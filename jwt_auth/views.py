from rest_framework.generics import ListAPIView
from rest_framework.views import APIView, View
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
from django.conf import settings
import jwt
from .serializers import UserSerializer, GroupSerializer

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

        token = jwt.encode({'sub': user.id}, settings.SECRET_KEY, algorithm='HS256')
        return Response({'token': token, 'message': f'Welcome back {user.username}'})


class NewGroup(APIView):
    def post(self, request):
        serializer = GroupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Group Created'})
        return Response(serializer.errors, status=422)

class ViewGroup(ListAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
