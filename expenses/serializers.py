# pylint: disable=no-member, arguments-differ
from rest_framework import serializers
from django.contrib.auth import get_user_model
from jwt_auth.serializers import NestedUserSerializer

from .utils import upsert_expense
from .models import Expense, Split, Comment

User = get_user_model()


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
        fields = ('id', 'text', 'creator', 'date_created')


class CreateUpdateSplitSerializer(serializers.ModelSerializer):

    id = serializers.CharField(required=False)
    debtor = NestedUserSerializer()

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
        return upsert_expense(data=new_data, expense=expense, is_update=True, updator=self.context['request'].user)


    def create(self, data):
        '''
        Upon the creation of expense, it is resonsible for creating the Split record as well depending on the split_type
        and validate whether the request is correct or not.
        '''
        return upsert_expense(data)


class ListExpenseSerializer(serializers.ModelSerializer):

    # not make it required to be present by default because it can be just settlement expense
    # but depending on the split_type we might throw validation saying splits array must not be empty
    splits = NestedSplitSerializer(many=True, required=False)
    creator = NestedUserSerializer()
    payer = NestedUserSerializer()
    updator = NestedUserSerializer()
    comments = NestedListCommentSerializer(many=True)

    class Meta:
        model = Expense
        fields = ('id', 'creator', 'payer', 'updator', 'amount', 'description', 'split_type', 'date_created', 'date_updated', 'is_deleted', 'splits', 'comments')

class ListCommentSerializer(serializers.ModelSerializer):

    creator = NestedUserSerializer()

    class Meta:
        model = Comment
        fields = ('id', 'text', 'creator')

class CreateCommentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Comment
        fields = ('id', 'text', 'creator', 'expense')
