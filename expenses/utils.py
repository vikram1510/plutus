# pylint: disable=no-member, arguments-differ
from rest_framework.exceptions import ValidationError

from django.db import transaction, IntegrityError
from django.contrib.auth import get_user_model
from .models import Expense, Split, Activity, Ledger

User = get_user_model()

def _bulk_query_users(data):

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


def _upsert_split(split_data_list, user_dict, expense_inst, is_update):
    '''
    UPSERT means Update/Insert
    Create split data, populate debtor and return the splits as list.
    It also validates whether the split amount was equal or the expense amount or not.
    '''

    splits_create_list = []
    splits_update_list = []

    total_split_amount = 0

    for split_data in split_data_list:
        debtor_data = split_data.pop('debtor')

        if split_data.get('id', None) is None:
            # id is uuid on Split object, 'Split(**split)' won't capture id because it's string from json
            split = Split()
        else:
            split = Split.objects.get(pk=split_data.get('id'))

        split.amount = split_data.get('amount')
        split.is_deleted = split_data.get('is_deleted', False)
        split.debtor = user_dict.get(debtor_data.get('id')) # get the instance from already queried object

        total_split_amount += split.amount

        split.expense = expense_inst

        # print('\33[33m' + f'split_data:: {split}' + '\033[0m')

        if split_data.get('id', None) is None:
            splits_create_list.append(split)
        else:
            splits_update_list.append(split)


    if expense_inst.amount != total_split_amount:
        raise IntegrityError('Split amount does not add up')

    all_splits = []
    if len(splits_create_list) > 0:
        Split.objects.bulk_create(splits_create_list)
        all_splits += splits_create_list

    if is_update and len(splits_update_list) > 0:
        [split_inst.save() for split_inst in splits_update_list]
        all_splits += splits_update_list


    # print('\33[33m' + f'splitssplitssplitssplits:: {all_splits}' + '\033[0m')

    expense_inst.splits.set(all_splits)
    return splits_create_list


def upsert_expense(data, expense=None, is_update=False):
    '''
    UPSERT means Update/Insert
    Creates or updates the expense depending on the context
    '''

    user_dict = _bulk_query_users(data)

    payer_data = data.pop('payer')
    creator_data = data.pop('creator')
    splits_data = data.pop('splits') if 'splits' in data else []

    expense_inst = Expense()
    # update is different
    if is_update:
        expense_inst = Expense.objects.get(pk=expense.id)

    # for both update and create we stil need to check/populate the user
    expense_inst.payer = user_dict[payer_data.get('id')]
    expense_inst.creator = user_dict[creator_data.get('id')]

    expense_inst.split_type = data.get('split_type')
    expense_inst.description = data.pop('description')
    expense_inst.amount = data['amount']
    expense_inst.is_deleted = data.get('is_deleted', False)

    # is_new = expense is None

    # Creating a transaction savepoint as we might need to rollback to this point because to create split object, we need expense_inst to be saved but
    # 'Split.objects.bulk_create' might fail down the line 🤓
    tnx_sp = transaction.savepoint()

    try:
        with transaction.atomic():
            expense_inst.save()

            if len(splits_data) == 0:
                raise ValidationError({'splits': 'missing split details'})

            # this is bulk create/update
            _upsert_split(splits_data, user_dict, expense_inst, is_update)

            update_ledger(expense_inst, is_update)

            activity = Activity()
            activity.activity_type = 'expense_updated' if is_update else 'expense_created'
            activity.record_ref = expense_inst.id
            activity.creator = expense_inst.creator

            # this should send a signal to run and save activity fields
            activity.save()

            return expense_inst

    except Exception as e:
        # rollback and throw the exception
        transaction.savepoint_rollback(tnx_sp)
        raise ValidationError({'errors': e})


def update_ledger(expense, is_update):

    if is_update:
        expense.ledgers.all().delete()
        if expense.is_deleted:
            return
        add_ledger_entries(expense)
    
    else:
        add_ledger_entries(expense)

def add_ledger_entries(expense):
    for split in expense.splits.exclude(debtor=expense.payer):
        Ledger.objects.create(
            payment_from=expense.payer,
            payment_to=split.debtor,
            amount=split.amount,
            expense=expense
        )
