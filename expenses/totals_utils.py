#pylint: disable=no-member,arguments-differ
from django.db.models import Sum
from jwt_auth.serializers import NestedUserSerializer
from .models import Ledger
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()

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

    payments_to = Ledger.objects.values('payment_to').annotate(sum=Sum('amount')).filter(payment_from=user)
    payments_from = Ledger.objects.values('payment_from').annotate(sum=Sum('amount')).filter(payment_to=user)

    tally['user'] = 0

    for payment in payments_from:
        friend_id = str(payment['payment_from'])
        tally['user'] -= Decimal(payment['sum'])
        tally[friend_id] = -Decimal(payment['sum'])

    for payment in payments_to:
        friend_id = str(payment['payment_to'])
        if friend_id not in tally:
            tally[friend_id] = 0
        tally[friend_id] += Decimal(payment['sum'])
        tally['user'] += Decimal(payment['sum'])

    friend_ids = [str(friend.id) for friend in user.friends.all()]
    ledger_ids = list(tally.keys())
    ledger_ids.remove('user')
    
    friends = User.objects.filter(pk__in=set(friend_ids + ledger_ids))
    
    friends = NestedUserSerializer(friends, many=True).data
    user = NestedUserSerializer(user).data

    for friend in friends:
        if friend['id'] in tally:
            friend['total'] = str(tally[friend['id']])
        else:
            friend['total'] = '0.00'

    user['total'] = str(tally['user'])

    response['friends'] = friends
    response['user'] = user

    return response

def get_friend_total(user, friend):
    key = 'amount__sum'

    payments_to = Ledger.objects.filter(payment_to=friend.id).filter(payment_from=user.id).aggregate(Sum('amount'))
    payments_from = Ledger.objects.filter(payment_from=friend.id).filter(payment_to=user.id).aggregate(Sum('amount'))

    total_from = 0 if not payments_from[key] else payments_from[key]
    total_to = 0 if not payments_to[key] else payments_to[key]
    total = Decimal(total_to - total_from)

    friend = NestedUserSerializer(friend).data
    friend['total'] = str(total)

    return friend
