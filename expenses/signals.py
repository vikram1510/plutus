# pylint: disable=protected-access
# signals.py - we will create all the triggers in this class
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.contrib.auth import get_user_model
from .models import Expense, UserInvolvedActivity

User = get_user_model()


def _create_user_involved_activity(activity, expense):

    involved_activities = []
    for split in expense.splits.all():
        uia = UserInvolvedActivity()
        uia.activity = activity
        uia.related_user = split.debtor
        involved_activities.append(uia)

    UserInvolvedActivity.objects.bulk_create(involved_activities)


@receiver(post_save, sender='expenses.activity')
# def handle_new_activity(sender, instance, created, **kwargs):
def handle_new_activity(**kwargs):

    # if created:
    activity = kwargs['instance']
    if activity.activity_type in ['expense_created', 'expense_updated']:
        print(f'\n\nhelloooooo {activity.creator}\n\n')
        print(f'helloooooo {kwargs}\n\n')

        expense = Expense.objects.get(pk=activity.record_ref)
        _create_user_involved_activity(activity, expense)
