# pylint: disable=no-member,protected-access,expression-not-assigned

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
from notifications.views import Broadcaster
from .models import Expense, UserInvolvedActivity
from .activity_utils import human_readable_activities

User = get_user_model()


def _broadcast_activites(involved_activities, **kwargs):
    broadcast_data = {}
    activity = involved_activities[0].activity

    creator_email = activity.creator.email

    emails = set()

    # we don't want to publist to the creator's own channel
    [emails.add(ia.related_user.email) for ia in involved_activities if ia.related_user.email != creator_email]

    broadcast_data['email_channels'] = list(emails)
    broadcast_data['event_name'] = 'update'

    # there is only going to one ativity that went to parse
    readable_activities = human_readable_activities([activity])

    broadcast_data['message'] = readable_activities[0]

    print(f'broadcast_data::: {broadcast_data}')

    broadcaster = Broadcaster(broadcast_data)
    broadcaster.push()


def _create_user_involved_activity(activity, **kwargs):
    '''
    This function populates the UserInvolvedActivity table to record all the users
    and expense affected by the Activity creation.
    '''

    expense = kwargs.get('expense', None)

    # this is activities where all the users are involved and need to be notified
    involved_activities = []
    if expense:
        for split in expense.splits.all():
            uia = UserInvolvedActivity()
            uia.activity = activity
            uia.related_user = split.debtor

            involved_activities.append(uia)

    if len(involved_activities) > 0:
        UserInvolvedActivity.objects.bulk_create(involved_activities)
        _broadcast_activites(involved_activities)



@receiver(post_save, sender='expenses.activity')
def handle_new_activity(**kwargs):
    '''
    Registering the post_save hook so all the logic that we need to do when Activity.save() happens successfully
    '''
    # def handle_new_activity(sender, instance, created, **kwargs):

    # if created:
    # created = kwargs['created'] # with

    activity = kwargs['instance']

    if activity.model_name.lower() == 'expense':
        expense = Expense.objects.get(pk=activity.record_ref)
        _create_user_involved_activity(activity, expense=expense)
