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
from . import totals_utils

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
            response = totals_utils.get_all_friends_total(request.user)

        elif params.get('filter') == 'current_user':
            response = totals_utils.get_current_user_total(request.user)

        elif params.get('friend_id'):
            friend_id = params.get('friend_id')
            try:
                friend = User.objects.get(pk=uuid.UUID(friend_id))
            except:
                raise NotFound(detail='Friend ID given is incorrect')

            if request.user == friend:
                raise NotAcceptable(detail='Friend ID given is equal to Current User ID')

            response = totals_utils.get_friend_total(request.user, friend)

        else:
            raise NotAcceptable(detail='Invalid query')

        return Response(response)
