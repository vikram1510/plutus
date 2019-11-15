#pylint: disable=no-member,arguments-differ
from django.db.models import Sum
from jwt_auth.serializers import NestedUserSerializer
from .models import Ledger


def get_current_user_total(user):
    key = 'amount__sum'
    payments_to = Ledger.objects.filter(payment_to=user.id).aggregate(Sum('amount'))
    payments_from = Ledger.objects.filter(payment_from=user.id).aggregate(Sum('amount'))
    total_from = 0 if not payments_from[key] else payments_from[key]
    total_to = 0 if not payments_to[key] else payments_to[key]
    total = total_from - total_to

    user = NestedUserSerializer(user).data
    user['total'] = total
    return user

def get_all_friends_total(user):
    response, tally = {}, {}

    payments_to = Ledger.objects.values('payment_to').annotate(sum=Sum('amount')).filter(payment_from=user.id)
    payments_from = Ledger.objects.values('payment_from').annotate(sum=Sum('amount')).filter(payment_to=user.id)

    # serialize to friends list and user dictionary
    friends = NestedUserSerializer(user.friends, many=True).data
    user = NestedUserSerializer(user).data

    tally['user'] = 0

    for payment in payments_from:
        friend_id = str(payment['payment_from'])
        tally['user'] -= float(payment['sum'])
        tally[friend_id] = -float(payment['sum'])

    for payment in payments_to:
        friend_id = str(payment['payment_to'])
        if friend_id not in tally:
            tally[friend_id] = 0
        tally[friend_id] += float(payment['sum'])
        tally['user'] += float(payment['sum'])

    for friend in friends:
        if friend['id'] in tally:
            friend['total'] = tally[friend['id']]
        else:
            friend['total'] = 0

    user['total'] = tally['user']

    response['friends'] = friends
    response['user'] = user

    return response

def get_friend_total(user, friend):
    key = 'amount__sum'

    payments_to = Ledger.objects.filter(payment_to=friend.id).filter(payment_from=user.id).aggregate(Sum('amount'))
    payments_from = Ledger.objects.filter(payment_from=friend.id).filter(payment_to=user.id).aggregate(Sum('amount'))

    total_from = 0 if not payments_from[key] else payments_from[key]
    total_to = 0 if not payments_to[key] else payments_to[key]
    total = total_to - total_from

    friend = NestedUserSerializer(friend).data
    friend['total'] = total

    return friend
