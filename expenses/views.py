#pylint: disable=no-member
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView
from .models import Expense
from .serializers import ExpenseSerializer

# this is the list view for the expense
class ExpenseView(ListCreateAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

# we want to only update the expense - we will never ever delete the expense object - EVER!!!
class ExpenseDetailView(RetrieveUpdateAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
