# pylint: disable=wrong-import-position

import uuid
from enum import Enum
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# Using python built in enums
class SplitTypeChoice(Enum):
    percentage = 'percentage'
    equal = 'equal'
    unequal = 'unequal'
    full_amount = 'full_amount'
    settlement = 'settlement'

# This is the main expense
class Expense(models.Model):

    # we don't want the default int as id from our models - so uuid is pseudo unique enough I think
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    amount = models.DecimalField(max_digits=6, decimal_places=2)
    creator = models.ForeignKey(User, related_name='created_expenses', on_delete=models.DO_NOTHING)
    payer = models.ForeignKey(User, related_name='paid_expenses', on_delete=models.DO_NOTHING)
    description = models.CharField(max_length=50)
    # category = mode - need to think about the how to categories our expense properly later
    split_type = models.CharField(max_length=30, choices=[(split_type.value, split_type.name) for split_type in SplitTypeChoice])
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.description} - £{self.amount} ({self.payer})'


# This is the split bills from the expense
class Split(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    amount = models.DecimalField(max_digits=6, decimal_places=2) # this is the split amount
    # CASCADE - When the referenced object is deleted, also delete the objects that have references to it
    expense = models.ForeignKey(Expense, related_name='splits', on_delete=models.CASCADE)
    debtor = models.ForeignKey(User, related_name='splits', on_delete=models.DO_NOTHING)
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.amount} - {self.debtor}'


# Comment is the child of the Expense
class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    text = models.CharField(max_length=200) # the actual user comment text
    # CASCADE - When the referenced object is deleted, also delete the objects that have references to it
    expense = models.ForeignKey(Expense, related_name='comments', on_delete=models.CASCADE)
    creator = models.ForeignKey(User, related_name='comments', on_delete=models.DO_NOTHING)

    def __str__(self):
        return f'{self.creator}: {self.text}'


class Ledger(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    payment_from = models.ForeignKey(User, related_name='payments_made', on_delete=models.DO_NOTHING)
    payment_to = models.ForeignKey(User, related_name='payments_owed', on_delete=models.DO_NOTHING)
    amount = models.DecimalField(max_digits=6, decimal_places=2)

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

    # def save(self, *args, **kwargs):
    #     self._expense_id = '51c174d3-a290-4b25-b4df-8b06103a76ab'
    #     super(Activity, self).save(*args, **kwargs)


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

# This import is intentionally here - it's supposed to be on apps.py def ready() function but doesn't work
# The reason this is at the bottom is that we want the signals uses some of the model so can't have it at the top
# of this file.
# But we want to register of model signals as soon as we have loaded our models.
from . import signals
