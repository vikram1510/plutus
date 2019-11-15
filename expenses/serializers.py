# pylint: disable=no-member, arguments-differ
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model

from .utils import upsert_expense

# ensure this import from other app is before our own .models import
from jwt_auth.serializers import NestedUserSerializer, ReferenceUserSerializer
from .models import Expense, Split, Comment

User = get_user_model()


class ActivitySerializer(serializers.Serializer):

    latest_activity_id = serializers.CharField(required=True)



class NestedExpenseSerializer(serializers.ModelSerializer):

    creator = NestedUserSerializer()
    payer = NestedUserSerializer()

    class Meta:
        model = Expense
        fields = ('id', 'creator', 'payer', 'amount', 'description', 'split_type', 'date_created', 'date_updated', 'is_deleted')


class NestedSplitSerializer(serializers.ModelSerializer):

    id = serializers.CharField(required=False)
    debtor = NestedUserSerializer()

    class Meta:
        model = Split
        fields = ('id', 'amount', 'debtor', 'date_created', 'date_updated', 'is_deleted')


class NestedListCommentSerializer(serializers.ModelSerializer):

    creator = NestedUserSerializer()

    class Meta:
        model = Comment
        fields = ('id', 'text', 'creator')


class CreateUpdateSplitSerializer(serializers.ModelSerializer):

    id = serializers.CharField(required=False)
    debtor = ReferenceUserSerializer()

    class Meta:
        model = Split
        fields = ('id', 'amount', 'debtor', 'date_created', 'date_updated', 'is_deleted')


class CreateUpdateExpenseSerializer(serializers.ModelSerializer):

    id = serializers.CharField(required=False)
    creator = NestedUserSerializer()
    payer = NestedUserSerializer()

    splits = CreateUpdateSplitSerializer(many=True, required=False)

    class Meta:
        model = Expense
        fields = ('id', 'creator', 'payer', 'amount', 'description', 'split_type', 'is_deleted', 'splits')

    def update(self, expense, new_data):
        '''
        Need to update the transaction including the splits
        '''
        return upsert_expense(data=new_data, expense=expense, is_update=True)


    def create(self, data):
        '''
        Upon the creation of expense, it is resonsible for creating the Split record as well depending on the split_type
        and validate whether the request is correct or not.
        '''
        print(f'testing............. {data}')
        return upsert_expense(data)


class ListExpenseSerializer(serializers.ModelSerializer):

    # not make it required to be present by default because it can be just settlement expense
    # but depending on the split_type we might throw validation saying splits array must not be empty
    splits = NestedSplitSerializer(many=True, required=False)
    creator = NestedUserSerializer()
    payer = NestedUserSerializer()
    comments = NestedListCommentSerializer(many=True)

    class Meta:
        model = Expense
        fields = ('id', 'creator', 'payer', 'amount', 'description', 'split_type', 'date_created', 'date_updated', 'is_deleted', 'splits', 'comments')

class ListCommentSerializer(serializers.ModelSerializer):

    creator = NestedUserSerializer()

    class Meta:
        model = Comment
        fields = ('id', 'text', 'creator')

class CreateCommentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Comment
        fields = ('id', 'text', 'creator', 'expense')
