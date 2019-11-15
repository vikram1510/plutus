#pylint: disable=no-member,arguments-differ
import uuid
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, NotAcceptable
from django.db.models import Sum
from django.contrib.auth import get_user_model
from .models import Expense, Comment, Ledger
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView
from .serializers import ListExpenseSerializer, CreateUpdateExpenseSerializer, ListCommentSerializer, CreateCommentSerializer

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


class CommentListView(ListCreateAPIView):

    def get_queryset(self):
        expense = Expense.objects.get(pk=self.kwargs['pk'])
        return expense.comments.all()

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ListCommentSerializer

        return CreateCommentSerializer


class TotalView(APIView):
    def get(self, request):
        params = request.GET
        user_id = request.user.id

        if not params:
            response = self.get_all_friends_total(user_id, request.user.friends)

        elif params.get('filter') == 'current_user':
            response = self.get_current_user_total(user_id)

        elif params.get('friend_id'):
            friend_id = params.get('friend_id')
            try:
                User.objects.get(pk=uuid.UUID(friend_id))
            except:
                raise NotFound(detail='User not found')
            response = self.get_friend_total(user_id, friend_id)

        else:
            raise NotAcceptable(detail='Invalid query')

        return Response(response)

    def get_current_user_total(self, user_id):
        key = 'amount__sum'
        payments_to = Ledger.objects.filter(payment_to=user_id).aggregate(Sum('amount'))
        payments_from = Ledger.objects.filter(payment_from=user_id).aggregate(Sum('amount'))
        total_from = 0 if not payments_from[key] else payments_from[key]
        total_to = 0 if not payments_to[key] else payments_to[key]
        total = total_from - total_to
        return {'id': user_id, 'total': total}

    def get_all_friends_total(self, user_id, friends):
        totals = {}
        friend_totals = []
        tally = {}

        payments_to = Ledger.objects.values('payment_to').annotate(sum=Sum('amount')).filter(payment_from=user_id)
        payments_from = Ledger.objects.values('payment_from').annotate(sum=Sum('amount')).filter(payment_to=user_id)
        friend_ids = [str(friend.id) for friend in friends.all()]

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

        for friend_id in friend_ids:
            total = {'id': friend_id}
            if friend_id in tally:
                total['total'] = tally[friend_id]
            else:
                total['total'] = 0
            friend_totals.append(total)

        totals['friends'] = friend_totals
        totals['user'] = {'id': user_id, 'total': tally['user']}

        return totals

    def get_friend_total(self, user_id, friend_id):
        key = 'amount__sum'

        payments_to = Ledger.objects.filter(payment_to=friend_id).filter(payment_from=user_id).aggregate(Sum('amount'))
        payments_from = Ledger.objects.filter(payment_from=friend_id).filter(payment_to=user_id).aggregate(Sum('amount'))

        total_from = 0 if not payments_from[key] else payments_from[key]
        total_to = 0 if not payments_to[key] else payments_to[key]
        total = total_to - total_from

        return {'id': friend_id, 'total': total}
