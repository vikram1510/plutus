# pylint: disable=no-member,arguments-differ
from rest_framework.serializers import ModelSerializer as MS

# ensure this import from other app is before our own .models import
from jwt_auth.serializers import UserSerializer
from .models import Expense

class ExpenseSerializer(MS):

    payer = UserSerializer()
    creator = UserSerializer()

    class Meta:
        model = Expense
        fields = ('__all__')
