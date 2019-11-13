# pylint: disable=no-member,arguments-differ
from rest_framework.serializers import ModelSerializer as MS

from django.contrib.auth import get_user_model

# ensure this import from other app is before our own .models import
from jwt_auth.serializers import UserSerializer
from .models import Expense

User = get_user_model()

class ExpenseSerializer(MS):

    payer = UserSerializer()
    creator = UserSerializer()

    class Meta:
        model = Expense
        fields = ('__all__')


    def create(self, data):
        # data is dictionary at this point

        payer_data = data.pop('payer')
        creator_data = data.pop('creator')

        expense = Expense(**data)
        expense.payer = User.objects.get(**payer_data)
        expense.creator = User.objects.get(**creator_data)

        expense.save()
        return expense
