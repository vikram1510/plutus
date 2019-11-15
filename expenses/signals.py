# pylint: disable=no-member,protected-access

# signals.py - we will create all the triggers in this class
'''
Using signal is better because we decouple our logic.
Django provides some hooks/triggers like 'post_save, pre_save' etc. that allows as react to
changes made to database when some model record have been updated or inserted.

THIS ONLY WORKS IF WE USE THE save.() METHOD ON MODEL
'''

from django.dispatch import receiver
from django.db.models.signals import post_save
from django.contrib.auth import get_user_model
from .models import Expense, UserInvolvedActivity

User = get_user_model()


def _create_user_involved_activity(activity, expense):
    '''
    This function populates the UserInvolvedActivity table to record all the users
    and expense affected by the Activity creation.
    '''

    involved_activities = []
    for split in expense.splits.all():
        uia = UserInvolvedActivity()
        uia.activity = activity
        uia.related_user = split.debtor
        involved_activities.append(uia)

    UserInvolvedActivity.objects.bulk_create(involved_activities)


@receiver(post_save, sender='expenses.activity')
def handle_new_activity(**kwargs):
    '''
    Registering the post_save hook so all the logic that we need to do when Activity.save() happens successfully
    '''
    # def handle_new_activity(sender, instance, created, **kwargs):

    # if created:
    # created = kwargs['created'] # with

    activity = kwargs['instance']
    if activity.activity_type in ['expense_created', 'expense_updated']:
        print(f'\n\nhelloooooo {activity.creator}\n\n')
        print(f'helloooooo {kwargs}\n\n')

        expense = Expense.objects.get(pk=activity.record_ref)
        _create_user_involved_activity(activity, expense)
