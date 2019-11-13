from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.views import APIView, View
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
from django.conf import settings
import jwt
from .serializers import UserSerializer, GroupSerializer
from rest_framework import serializers
import json

User = get_user_model()

class RegisterView(APIView):

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Registration Successful'})
        return Response(serializer.errors, status=422)

class LoginView(APIView):

    def get_user(self, email):
        try:
            return User.objects.get(email=email)
        except User.DoesNotExist:
            raise PermissionDenied({'message': 'Invalid Credentials'})

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = self.get_user(email)
        
        if not user.check_password(password):
            raise PermissionDenied({'message': 'Invalid Credentials'})

        token = jwt.encode({'sub': str(user.id)}, settings.SECRET_KEY, algorithm='HS256')
        return Response({'token': token, 'message': f'Welcome back {user.username}'})

class GroupIndexCreate(ListCreateAPIView):
    serializer_class = GroupSerializer
    def get_queryset(self):
        return self.request.user.groups.all()

class GroupShowUpdateDelete(RetrieveUpdateDestroyAPIView):
    serializer_class = GroupSerializer
    
    def retrieve(self, request, *args, **kwargs):
        queryset = Group.objects.get(pk=kwargs.get('pk'))
        serializer = GroupSerializer(queryset)
        return Response(serializer.data)

    def get_queryset(self):
        return self.request.user.admin_groups.all()
