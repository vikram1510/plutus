# pylint: disable=no-member, arguments-differ
from collections import OrderedDict
from notifications.views import Broadcaster
from .models import Expense, Comment


def _generate_owe_lent_detail(expense):
    '''
    who owes whom and how much
    '''
    lent_detail = OrderedDict() # ordered dict is to really required for helpful to see/debug on the response
    lent_detail['payer'] = expense.payer.to_dict()
    lent_detail['debtors'] = []

    split_total_exclude_payer = 0
    for split in expense.splits.all():
        lent_detail['debtors'].append({
            'id': str(split.debtor.id),
            'username': split.debtor.username,
            'amount': str(split.amount)
        })
        if split.debtor.id != expense.payer.id:
            split_total_exclude_payer += split.amount

    lent_detail['split_total_exclude_payer'] = str(split_total_exclude_payer)

    return lent_detail


def _generate_activty(model_name, ref_id, record_dict, **kwargs):
    '''
    Depending on the model_name, we will generate dynamic description and dictionaries.
    '''

    record_detail = {}
    if model_name.lower() == 'expense' or model_name.lower() == 'split':
        expense_inst = record_dict['expense_dict'][str(ref_id)]
        record_detail = {
            'description': expense_inst.description,
            'amount' : str(expense_inst.amount),
            'split_type' : expense_inst.split_type,
            'lent_detail': _generate_owe_lent_detail(expense_inst),
            'previous_owe_amount': kwargs.get('owe_amount_map', {})
        }

    elif model_name.lower() == 'comment':
        comment_inst = record_dict['comment_dict'][str(ref_id)]
        record_detail = {
            'text' : comment_inst.text,
            'expense_id' : str(comment_inst.expense.id),
            'expense_description': comment_inst.expense.description
        }

    return record_detail



def _get_bulk_records_2(activities, **kwargs):
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
        if activity.model_name.lower() == 'expense' or activity.model_name.lower() == 'split':
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


def _query_owe_amount(activity):
    '''
    This is the map of the users by the owe amount WHEN THE SPLIT occurred
    '''

    owe_amount_map = {}
    if activity.model_name.lower() == 'expense':
        for uia in activity.activities.all():
            owe_amount_map[str(uia.related_user.id)] = str(uia.current_awe_amount)

    return owe_amount_map


def human_readable_activity_2(activities, return_single=False, query_owe_amount=False, **kwargs):

    record_dict = _get_bulk_records_2(activities)

    readable_activities = []

    owe_amount_map = kwargs.get('kwargs', {})

    for activity in activities:
        readable_activity = OrderedDict() # ordered dict cuz helps to see on json

        if query_owe_amount:
            owe_amount_map = _query_owe_amount(activity)

        readable_activity['id'] = str(activity.id)
        readable_activity['date_created'] = activity.date_created.replace(tzinfo=None).isoformat()
        readable_activity['model_name'] = activity.model_name
        readable_activity['activity_type'] = activity.activity_type
        readable_activity['creator'] = activity.creator.to_dict(include_names=True)
        readable_activity['record_ref'] = activity.record_ref
        readable_activity['activity_detail'] = _generate_activty(model_name=activity.model_name,
            ref_id=activity.record_ref, record_dict=record_dict, owe_amount_map=owe_amount_map)

        # intentionally not using the model serializer as it will query again - we already have enough data to create dictionary

        readable_activities.append(readable_activity)

    return readable_activities[0] if return_single and len(readable_activities) == 1 else readable_activities



def broadcast_activity_2(activity, event_name='update', **kwargs):
    broadcast_data = {}
    creator_email = activity.creator.email

    involved_activities = kwargs.get('involved_activities', [])

    # we don't want to publist to the creator's own channel
    emails = set()
    [emails.add(uia.related_user.email) for uia in involved_activities if uia.related_user.email != creator_email]

    broadcast_data['email_channels'] = list(emails)
    broadcast_data['event_name'] = event_name

    # there is only going to one ativity that went to parse
    readable_activity = human_readable_activity_2([activity], return_single=True, owe_amount_map=kwargs.get('owe_amount_map'))

    broadcast_data['message'] = readable_activity

    broadcaster = Broadcaster(broadcast_data)
    broadcaster.push()
