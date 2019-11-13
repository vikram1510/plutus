from rest_framework import serializers
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
import django.contrib.auth.password_validation as validations
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError

User = get_user_model()

class GroupSerializer(serializers.ModelSerializer):

    def create(self, data):
        group = Group(**data)
        user = self.context['request'].user
        group.admin = user.id
        group.save()
        group.user_set.add(user)
        return group

    class Meta:
        model = Group
        fields = ('id', 'name', 'admin')

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirmation = serializers.CharField(write_only=True)
    groups = GroupSerializer(many=True)

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
        fields = ('username', 'email', 'password', 'password_confirmation', 'groups')
