#pylint: disable=no-member,arguments-differ
import uuid
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, NotAcceptable, NotAuthenticated
from django.db.models import Sum, Q
from django.contrib.auth import get_user_model
from .models import Expense, Comment, Ledger, Activity, UserInvolvedActivity, Split
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView
from .serializers import ListExpenseSerializer, CreateUpdateExpenseSerializer, ListCommentSerializer, CreateCommentSerializer, NestedSplitSerializer, NestedExpenseSerializer
from jwt_auth.serializers import NestedUserSerializer
from . import totals_utils

User = get_user_model()

# this is the endpoint to query the list of activity
class ActivityListView(APIView):

    def get(self, request):
        params = request.GET

        if not request.user.is_authenticated:
            raise NotAuthenticated(detail='Not Authenticated')

        current_user = request.user

        filter_param = {'related_activities__related_user': current_user}

        # if 'activity_after' is not provided then get the whole history - maybe need to limit the size
        if params and params.get('activity_after', None):
            filter_param['pk__gt'] = params.get('activity_after')

        activities = Activity.objects.filter(**filter_param).order_by('-pk')

        print(f'activities::: {activities}')
        return Response(len(activities))



# this is the list view for the expense
class ExpenseView(ListCreateAPIView):

    def get_queryset(self):
        params = self.request.GET
        if not params:
            return Expense.objects.all()
        
        friend_id = params.get('friend_id')
        return Expense.objects.filter(splits__debtor=self.request.user).filter(splits__debtor=friend_id).distinct()

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
