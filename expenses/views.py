#pylint: disable=no-member,arguments-differ
import uuid
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, NotAcceptable, NotAuthenticated
from django.db.models import Sum
from django.contrib.auth import get_user_model
from .models import Expense, Ledger
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView
from .serializers import ListExpenseSerializer, CreateUpdateExpenseSerializer
from jwt_auth.serializers import NestedUserSerializer

User = get_user_model()

# this is the list view for the expense
class ExpenseView(ListCreateAPIView):
    queryset = Expense.objects.all()
    # serializer_class = ExpenseSerializer

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ListExpenseSerializer

        return CreateUpdateExpenseSerializer


# we want to only update the expense - we will never ever delete the expense object - EVER!!!
class ExpenseDetailView(RetrieveUpdateAPIView):
    queryset = Expense.objects.all()
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ListExpenseSerializer

        return CreateUpdateExpenseSerializer

class TotalView(APIView):
    def get(self, request):
        params = request.GET
        if not request.user.is_authenticated:
            raise NotAuthenticated(detail='Not Authenticated')

        if not params:
            response = self.get_all_friends_total(request.user)

        elif params.get('filter') == 'current_user':
            response = self.get_current_user_total(request.user)

        elif params.get('friend_id'):
            friend_id = params.get('friend_id')
            try:
                friend = User.objects.get(pk=uuid.UUID(friend_id))
            except:
                raise NotFound(detail='Friend ID given is incorrect')
            response = self.get_friend_total(request.user, friend)

        else:
            raise NotAcceptable(detail='Invalid query')

        return Response(response)

    def get_current_user_total(self, user):
        key = 'amount__sum'
        payments_to = Ledger.objects.filter(payment_to=user.id).aggregate(Sum('amount'))
        payments_from = Ledger.objects.filter(payment_from=user.id).aggregate(Sum('amount'))
        total_from = 0 if not payments_from[key] else payments_from[key]
        total_to = 0 if not payments_to[key] else payments_to[key]
        total = total_from - total_to

        user = NestedUserSerializer(user).data
        user['total'] = total
        return user

    def get_all_friends_total(self, user):
        response, tally = {}, {}

        payments_to = Ledger.objects.values('payment_to').annotate(sum=Sum('amount')).filter(payment_from=user.id)
        payments_from = Ledger.objects.values('payment_from').annotate(sum=Sum('amount')).filter(payment_to=user.id)

        # serialize to friends list and user dictionary
        friends = NestedUserSerializer(user.friends, many=True).data
        user = NestedUserSerializer(user).data

        tally['user'] = 0

        for payment in payments_from:
            key = str(payment['payment_from'])
            tally['user'] -= float(payment['sum'])
            tally[key] = -float(payment['sum'])

        for payment in payments_to:
            key = str(payment['payment_to'])
            if key not in tally:
                tally[key] = 0
            tally[key] += float(payment['sum'])
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

    def get_friend_total(self, user, friend):
        key = 'amount__sum'

        payments_to = Ledger.objects.filter(payment_to=friend.id).filter(payment_from=user.id).aggregate(Sum('amount'))
        payments_from = Ledger.objects.filter(payment_from=friend.id).filter(payment_to=user.id).aggregate(Sum('amount'))

        total_from = 0 if not payments_from[key] else payments_from[key]
        total_to = 0 if not payments_to[key] else payments_to[key]
        total = total_to - total_from

        friend = NestedUserSerializer(friend).data
        friend['total'] = total

        return friend


