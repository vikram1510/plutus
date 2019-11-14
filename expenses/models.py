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
    user = models.ForeignKey(User, related_name='comments', on_delete=models.DO_NOTHING)

    def __str__(self):
        return f'{self.user}: {self.text}'

class Ledger(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    payment_from = models.ForeignKey(User, related_name='payments_made', on_delete=models.DO_NOTHING)
    payment_to = models.ForeignKey(User, related_name='payments_owed', on_delete=models.DO_NOTHING)
    amount = models.DecimalField(max_digits=6, decimal_places=2)
