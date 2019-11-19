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
from .activity_utils import human_readable_activity_2, broadcast_activity_2

User = get_user_model()





# deprecated - it's bs
def _broadcast_activites(user_involved_activity, **kwargs):
    broadcast_data = {}
    activity = user_involved_activity.activity

    creator_email = activity.creator.email

    emails = set()

    # we don't want to publist to the creator's own channel
    [emails.add(uia.related_user.email) for uia in user_involved_activity if uia.related_user.email != creator_email]

    broadcast_data['email_channels'] = list(emails)
    broadcast_data['event_name'] = 'update'


    # there is only going to one activity that went to parse
    print(f'\n\ninvolved_activities:: {user_involved_activity}')
    
    readable_activity = human_readable_activity_2(user_involved_activity, return_single=True)

    # print(f'\n\readable_activity:: {readable_activity}')
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
        # well - this is already a split, so let's just add it
        if kwargs.get('split'):
            splits = [kwargs.get('split')]

    elif activity.model_name.lower() == 'comment':
        comment = kwargs.get('comment')
        splits = comment.expense.splits.all()

    involved_activities = []
    for split in splits:
        uia = UserInvolvedActivity()
        uia.activity = activity
        uia.related_user = split.debtor
        uia.current_awe_amount = split.amount # the amount owed while this event happened for the current user

        involved_activities.append(uia)

    if len(involved_activities) > 0:
        UserInvolvedActivity.objects.bulk_create(involved_activities)
        # _broadcast_activites(involved_activities, splits=splits)
        owe_amount_map = {}
        for uia in involved_activities:
            owe_amount_map[str(uia.related_user.id)] = str(uia.current_awe_amount)
        broadcast_activity_2(activity, involved_activities=involved_activities, owe_amount_map=owe_amount_map)



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
        split = activity._split
        _create_user_involved_activity(activity, split=split)


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
    # activity._debtor = split_inst.debtor
    # activity._expense = split_inst.expense
    activity._split = split_inst
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
