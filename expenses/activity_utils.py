# pylint: disable=no-member, arguments-differ
from collections import OrderedDict
from decimal import Decimal
from .models import Expense, Comment

def _get_bulk_records(activities):
    '''
    Returns dictionary of records, grouped by dictionary
    It is expensive for database to do multiple queries for each loop in activities
    We insteads gather all the ids of records and query them once for each objects and create
    a dictionary map so we can use later.
    '''

    # capture the ids of expense and comments to do a bullk query when there are large records
    expense_set = set()
    comment_set = set()

    for activity in activities:
        if activity.model_name.lower() == 'expense':
            expense_set.add(activity.record_ref)
        elif activity.model_name.lower() == 'comment':
            comment_set.add(activity.record_ref)
        else:
            # more things later
            pass

    expense_dict = {}
    comment_dict = {}

    # doing a bulk query
    if len(expense_set) > 0:
        for expense in Expense.objects.filter(pk__in=list(expense_set)):
            expense_dict[str(expense.id)] = expense

    if len(comment_set) > 0:
        for comment in Comment.objects.filter(pk__in=list(comment_set)):
            comment_dict[str(comment.id)] = comment

    # there must a shorter syntax of doing this
    return {
        'expense_dict': expense_dict,
        'comment_dict': comment_dict
    }


def _generate_owe_lent_detail(expense):
    '''
    who owes whom and how much
    '''
    lent_detail = OrderedDict() # ordered dict is to really required for helpful to see/debug on the response
    lent_detail['payer'] = expense.payer.to_dict()
    lent_detail['debtors'] = []

    for split in expense.splits.all():
        lent_detail['debtors'].append({
            'id': str(split.debtor.id),
            'username': split.debtor.username,
            'amount': str(split.amount)
        })

    return lent_detail


def _generate_activty(model_name, ref_id, record_dict):
    '''
    Depending on the model_name, we will generate dynamic description and dictionaries.
    '''

    record_detail = {}
    if model_name.lower() == 'expense':
        expense_inst = record_dict['expense_dict'][str(ref_id)]
        record_detail = {
            'description': expense_inst.description,
            'amount' : str(Decimal(expense_inst.amount)),
            'split_type' : expense_inst.split_type,
            'lent_detail': _generate_owe_lent_detail(expense_inst)
        }

    elif model_name.lower() == 'comment':
        comment_inst = record_dict['comment_dict'][str(ref_id)]
        record_detail = {
            'text' : comment_inst.text,
            'expense_id' : str(comment_inst.expense.id)
        }

    return record_detail


def human_readable_activities(activities, return_single=False):
    '''
    This is to help the front end and create useful human readable info for each activity.
    Idea is that we can create dictionary with any kind of information so that it is easier for the front end
    '''

    record_dict = _get_bulk_records(activities)

    all_activities = []

    for activity in activities:
        readable_activity = OrderedDict() # ordered dict cuz helps to see on json
        readable_activity['id'] = str(activity.id)
        readable_activity['model_name'] = activity.model_name
        readable_activity['activity_type'] = activity.activity_type
        readable_activity['creator'] = activity.creator.to_dict(include_names=True)
        readable_activity['record_ref'] = activity.record_ref
        readable_activity['activity_detail'] = _generate_activty(activity.model_name, activity.record_ref, record_dict)

        # intentionally not using the model serializer as it will query again - we already have enough data to create dictionary

        all_activities.append(readable_activity)

    return all_activities[0] if return_single and len(all_activities) == 1 else all_activities
