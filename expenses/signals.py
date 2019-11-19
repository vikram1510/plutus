# pylint: disable=no-member,protected-access,expression-not-assigned

# signals.py - we will create all the triggers in this class
'''
Using signal is better because we decouple our logic.
Django provides some hooks/triggers like 'post_save, pre_save' etc. that allows as react to
changes made to database when some model record have been updated or inserted.

THIS ONLY WORKS IF WE USE THE save.() METHOD ON MODEL
'''

from django.dispatch import receiver
from django.db.models.signals import post_save, post_delete
from django.contrib.auth import get_user_model
from notifications.views import Broadcaster
from .models import Expense, UserInvolvedActivity, Activity, Comment
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
    readable_activity = human_readable_activities([activity], return_single=True)

    broadcast_data['message'] = readable_activity

    broadcaster = Broadcaster(broadcast_data)
    broadcaster.push()


def _create_user_involved_activity(activity, **kwargs):
    '''
    This function populates the UserInvolvedActivity table to record all the users
    and expense affected by the Activity creation.
    '''

    # this is activities where all the users are involved and need to be notified
    splits = []
    if activity.model_name.lower() == 'expense':
        expense = kwargs.get('expense')
        splits = expense.splits.all()
    
    elif activity.model_name.lower() == 'split':
        splits = []

    elif activity.model_name.lower() == 'comment':
        comment = kwargs.get('comment')
        splits = comment.expense.splits.all()

    involved_activities = []
    for split in splits:
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

    elif activity.model_name.lower() == 'comment':
        comment = Comment.objects.get(pk=activity.record_ref)
        _create_user_involved_activity(activity, comment=comment)

    elif activity.model_name.lower() == 'split':
        debtor = activity._debtor
        expense = activity._expense
        print(f'debtor::: {debtor.__dict__}')
        print(f'expense::: {expense.__dict__}')
        _create_user_involved_activity(activity, expense=expense, debtor=debtor)


@receiver(post_delete, sender='expenses.split')
def handle_split_delete(**kwargs):
    '''
    Need to notify the user that was removed from the split so he/she is made aware
    and will never start receiving notifications :)
    '''
    split_inst = kwargs['instance']

    activity = Activity()
    activity.record_ref = str(split_inst.expense.id)
    activity.model_name = split_inst.__class__.__name__
    activity.creator = split_inst.expense.updator
    activity.activity_type = 'deleted'
    activity._debtor = split_inst.debtor
    activity._expense = split_inst.expense
    # this should send a signal to run and save activity fields
    activity.save()



@receiver(post_save, sender='expenses.comment')
def handle_new_comment(**kwargs):
    '''
    Registering a the post_save hook on comment model so that it creates an activity which in-turn creates
    User involved activities and broadcast the events
    '''

    # this is the comment instance after apply the .save()
    comment_inst = kwargs['instance']

    if kwargs.get('created', False):
        activity = Activity()

        activity.record_ref = str(comment_inst.id)
        activity.model_name = comment_inst.__class__.__name__
        activity.creator = comment_inst.creator

        # default
        activity.activity_type = 'created'

        # this should send a signal to run and save activity fields
        activity.save()
