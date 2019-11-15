from enum import Enum

from django.db import models
from django.contrib.auth import get_user_model
User = get_user_model()


class ActivityType(Enum):
    expense_created = 'expense_created'
    expense_updated = 'expense_updated'
    comment_added = 'comment_added'
    payment_made = 'payment_made'


class Activity(models.Model):
    '''
    Recording an activity to trigger an event
    '''
    # guaranteed to fit numbers from 1 to 922,337,203,685,477,5807 according to django
    id = models.BigAutoField(primary_key=True)

    # this will just an str representation of object id - it's like an pointer
    record_ref = models.CharField(max_length=50)
    activity_type = models.CharField(max_length=20, choices=[(activity.value, activity.name) for activity in ActivityType])

    # this is the person that will "considered" as the activity creator
    creator = models.ForeignKey(User, related_name='created_activities', on_delete=models.CASCADE)


class UserInvolvedActivity(models.Model):
    '''
    Basically this is to record all the users that is affected by the activity so they users are related to each activities
    This way we can push notifications to all the related users
    '''
    # guaranteed to fit numbers from 1 to 9223372036854775807 according to django
    id = models.BigAutoField(primary_key=True)

    # if the user and activity is related then delete this record as well
    activity = models.ForeignKey(Activity, related_name='related_activities', on_delete=models.CASCADE)
    related_user = models.ForeignKey(User, related_name='related_activities', on_delete=models.CASCADE)
