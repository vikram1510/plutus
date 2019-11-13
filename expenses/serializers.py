# pylint: disable=no-member, arguments-differ
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.db import transaction, IntegrityError

# ensure this import from other app is before our own .models import
from jwt_auth.serializers import NestedUserSerializer
from .models import Expense, Split

User = get_user_model()

class NestedExpenseSerializer(serializers.ModelSerializer):

    creator = NestedUserSerializer()
    payer = NestedUserSerializer()

    class Meta:
        model = Expense
        fields = ('id', 'creator', 'payer', 'amount', 'description', 'split_type', 'date_created', 'date_updated', 'is_deleted')

class NestedSplitSerializer(serializers.ModelSerializer):

    debtor = NestedUserSerializer()

    class Meta:
        model = Split
        fields = ('id', 'amount', 'debtor', 'date_created', 'date_updated', 'is_deleted')

class SplitSerializer(serializers.ModelSerializer):

    # making it not required on the serializer when creating
    expense = NestedExpenseSerializer(required=False)
    debtor = NestedUserSerializer()

    class Meta:
        model = Split
        fields = ('id', 'amount', 'debtor', 'date_created', 'date_updated', 'is_deleted', 'expense')


class ExpenseSerializer(serializers.ModelSerializer):

    # not make it required to be present by default because it can be just settlement expense
    # but depending on the split_type we might throw validation saying splits array must not be empty
    splits = NestedSplitSerializer(many=True, required=False)

    creator = NestedUserSerializer()
    payer = NestedUserSerializer()

    class Meta:
        model = Expense
        fields = ('id', 'creator', 'payer', 'amount', 'description', 'split_type', 'date_created', 'date_updated', 'is_deleted', 'splits')


    def _create_split(self, split_data, expense):
        '''
        Create split data, populate debtor and return the splits as list.
        It also validates whether the split amount was equal or the expense amount or not.
        '''
        split_list = []

        expense_inst = Expense.objects.get(pk=str(expense.id))

        total_split_amount = 0
        for split in split_data:
            debtor_data = split.pop('debtor')
            split = Split(**split)
            total_split_amount += split.amount
            split.expense = expense_inst
            split.debtor = User.objects.get(**debtor_data)
            split_list.append(split)

        if total_split_amount != expense_inst.amount:
            raise IntegrityError(f'Total split bill amount: ({total_split_amount}) was not equal to expense amount: ({expense_inst.amount})')

        Split.objects.bulk_create(split_list)
        return split_list


    def _create_update_expense(self, data, expense=None):

        payer_data = data.pop('payer')
        creator_data = data.pop('creator')
        splits_data = data.pop('splits') if 'splits' in data else []

        # if expense is None then we want to create a new one else we use to existing one and do the update operation
        expense_inst = Expense(**data) if expense is None else expense

        is_splits_required = not expense_inst.split_type == 'settlement'

        # Creating a transaction savepoint as we might need to rollback to this point because to create split object, we need expense_inst to be saved but
        # 'Split.objects.bulk_create' might fail down the line 🤓
        sid = transaction.savepoint()

        try:
            expense_inst.payer = User.objects.get(**payer_data)
            expense_inst.creator = User.objects.get(**creator_data)

            expense_inst.save()

            if is_splits_required:
                if len(splits_data) == 0:
                    raise ValidationError({'splits': 'missing split details'})

                # this is bulk create
                splits = self._create_split(splits_data, expense_inst)

            if is_splits_required:
                expense_inst.splits.set(splits)

            return expense_inst

        except (IntegrityError, User.DoesNotExist) as err:
            # rollback and throw the exception
            transaction.savepoint_rollback(sid)
            raise ValidationError({'errors': list(err.args)})


    @transaction.atomic
    def update(self, expense, new_data):
        '''
        Need to update the transaction including the splits
        '''
        return self._create_update_expense(new_data, expense)


    @transaction.atomic
    def create(self, data):
        '''
        Upon the creation of expense, it is resonsible for creating the Split record as well depending on the split_type
        and validate whether the request is correct or not.
        '''
        return self._create_update_expense(data)
