# pylint: disable=no-member, arguments-differ
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.db import transaction, IntegrityError

# ensure this import from other app is before our own .models import
from jwt_auth.serializers import NestedUserSerializer
from .models import Expense, Split, Ledger

User = get_user_model()

class NestedExpenseSerializer(serializers.ModelSerializer):

    creator = NestedUserSerializer()
    payer = NestedUserSerializer()

    class Meta:
        model = Expense
        fields = ('id', 'creator', 'payer', 'amount', 'description', 'split_type', 'date_created', 'date_updated', 'is_deleted')

class NestedSplitSerializer(serializers.ModelSerializer):

    id = serializers.CharField(read_only=True)
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


    def _bulk_query_users(self, data):

        # gather all the user ids that have been references on the expense and splits
        user_ids = set()

        payer_data = data.get('payer')
        if payer_data and payer_data.get('id'):
            user_ids.add(payer_data.get('id'))

        creator_data = data.get('creator')
        if creator_data and creator_data.get('id'):
            user_ids.add(creator_data.get('id'))

        split_data_list = data.get('splits')
        if split_data_list:
            for split_data in split_data_list:
                debtor_data = split_data.get('debtor')
                if debtor_data.get('id'):
                    user_ids.add(debtor_data['id'])

        # Bulk query all the possible users and map them by id on the dictionary
        users = User.objects.filter(pk__in=list(user_ids))

        user_dict = {}
        for user in users:
            user_dict[str(user.id)] = user

        return user_dict


    def _upsert_split(self, split_data_list, user_dict, expense, is_update):
        '''
        UPSERT means Update/Insert
        Create split data, populate debtor and return the splits as list.
        It also validates whether the split amount was equal or the expense amount or not.
        '''

        expense_inst = Expense.objects.get(pk=expense.id)

        splits_create_list = []
        splits_update_dict = {}

        for split_data in split_data_list:
            debtor_data = split_data.pop('debtor')

            # because id is uuid on Split object, 'Split(**split)' won't capture id because it's string from json
            split = Split(**split_data)
            split.debtor = user_dict.get(debtor_data.get('id')) # get the instance from already queried object

            split.expense = expense_inst

            if split_data.get('id') is None:
                splits_create_list.append(split)
            else:
                splits_update_dict[split_data.get('id')] = split_data

        splits = []
        if len(splits_create_list) > 0:
            Split.objects.bulk_create(splits_create_list)
            splits.append(splits_create_list)

        if is_update and len(splits_update_dict.keys()) > 0:
            for (key, split) in splits_update_dict.items():
                # split_inst = Split.objects.get(pk=key).update(split_data)
                split_inst = Split.objects.get(pk=key)
                split_inst.amount = split.get('amount')
                split_inst.save()
                splits.append(split_inst)

        expense_inst.splits.set(splits)

        return splits_create_list


    def _upsert_expense(self, data, expense=None, is_update=False):
        '''
        UPSERT means Update/Insert
        Creates or updates the expense depending on the context
        '''

        user_dict = self._bulk_query_users(data)

        payer_data = data.pop('payer')
        creator_data = data.pop('creator')
        splits_data = data.pop('splits') if 'splits' in data else []

        # if expense is None then we want to create a new one else we use to existing one and do the update operation
        expense_inst = expense if is_update else Expense(**data)

        # is_new = expense is None
        is_splits_required = not expense_inst.split_type == 'settlement'

        # Creating a transaction savepoint as we might need to rollback to this point because to create split object, we need expense_inst to be saved but
        # 'Split.objects.bulk_create' might fail down the line 🤓
        tnx_sp = transaction.savepoint()

        try:
            with transaction.atomic():
                expense_inst.payer = user_dict[payer_data.get('id')]
                expense_inst.creator = user_dict[creator_data.get('id')]

                expense_inst.save()

                if is_splits_required:
                    if len(splits_data) == 0:
                        raise ValidationError({'splits': 'missing split details'})

                    # this is bulk create/update
                    self._upsert_split(splits_data, user_dict, expense_inst, is_update)

                return expense_inst

        except (IntegrityError, User.DoesNotExist) as err:
            # rollback and throw the exception
            transaction.savepoint_rollback(tnx_sp)
            raise ValidationError({'errors': list(err.args)})


    def update(self, expense, new_data):
        '''
        Need to update the transaction including the splits
        '''
        return self._upsert_expense(new_data, expense=expense, is_update=True)


    def create(self, data):
        '''
        Upon the creation of expense, it is resonsible for creating the Split record as well depending on the split_type
        and validate whether the request is correct or not.
        '''
        return self._upsert_expense(data)

class LedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ledger
        fields = '__all__'
