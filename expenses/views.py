#pylint: disable=no-member,arguments-differ
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView
# from rest_framework.response import Response
from .models import Expense, Comment
from .serializers import ListExpenseSerializer, CreateUpdateExpenseSerializer, CommentSerializer

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
    serializer_class = CommentSerializer

    def get_queryset(self):
        expense = Expense.objects.get(pk=self.kwargs['pk'])
        return expense.comments.all()
