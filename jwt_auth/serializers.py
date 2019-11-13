# pylint: disable=no-member
from rest_framework import serializers
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
import django.contrib.auth.password_validation as validations
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError

User = get_user_model()

class NestedUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('id','username', 'email',)
        extra_kwargs = {
            'username': {'validators': []},
        }


class GroupSerializer(serializers.ModelSerializer):

    def create(self, data):
        users_data = data.pop('user_set')
        group = Group(**data)
        group.save()
        users = [User.objects.get(**user_data) for user_data in users_data]
        group.user_set.set(users)
        return group

    user_set = NestedUserSerializer(many=True)

    class Meta:
        model = Group
        fields = ('id', 'name', 'admin', 'user_set')

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirmation = serializers.CharField(write_only=True)
    groups = GroupSerializer(many=True, required=False)

    def validate(self, data):
        password = data.pop('password')
        password_confirmation = data.pop('password_confirmation')

        if password != password_confirmation:
            raise ValidationError({'password_confirmation': 'does not match'})

        # try:
        #     validations.validate_password(password=password)
        # except ValidationError as err:
        #     raise serializers.ValidationError({'password': err.messages})

        data['password'] = make_password(password)
        return data


    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'password_confirmation', 'groups')
