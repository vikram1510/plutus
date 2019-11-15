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
from notifications.views import Broadcaster
from .models import Expense, UserInvolvedActivity

User = get_user_model()


def _broadcast_activites(involved_activities, **kwargs):
    broadcast_data = {}
    activity = involved_activities[0].activity

    broadcast_data['email_channels'] = []
    emails = set()
    [emails.add(ia.related_user.email) for ia in involved_activities]
    broadcast_data['email_channels'] = list(emails)
    broadcast_data['event_name'] = 'update'

    # FIXME: Need to make this generic enough to work for all the types of the activty and model ref
    message = {
        'event_type': kwargs.get('event_type'),
        'model_name': kwargs.get('model_name'),
        'event_creator': {
            'id' : str(activity.creator.id),
            'username' : activity.creator.username,
            'email' : activity.creator.email
        },
        'model_ref': str(activity.record_ref),
        'activity_ref': str(activity.id)
    }

    broadcast_data['message'] = message

    broadcaster = Broadcaster(broadcast_data)
    broadcaster.push()


def _create_user_involved_activity(activity, **kwargs):
    '''
    This function populates the UserInvolvedActivity table to record all the users
    and expense affected by the Activity creation.
    '''

    expense = kwargs.get('expense', None)
    created = kwargs.get('created', False)
    event_type = ''

    involved_activities = []
    if expense:
        model_name = 'expense'
        event_type = f'{model_name}_created' if created else f'{model_name}_updated'
        for split in expense.splits.all():
            uia = UserInvolvedActivity()
            uia.activity = activity
            uia.related_user = split.debtor
            involved_activities.append(uia)

    if len(involved_activities) > 0:
        UserInvolvedActivity.objects.bulk_create(involved_activities)
        _broadcast_activites(involved_activities, created=created, event_type=event_type, model_name=model_name)



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
        _create_user_involved_activity(activity, expense=expense, created=True)
