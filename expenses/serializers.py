# pylint: disable=no-member,arguments-differ
from rest_framework.serializers import ModelSerializer as MS
from django.contrib.auth import get_user_model

from .models import Expense

User = get_user_model()

class ExpenseSerializer(MS):

    class Meta:
        model = Expense
        fields = ('__all__')
