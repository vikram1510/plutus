# pylint: disable=protected-access,broad-except
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, RetrieveDestroyAPIView, ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
from django.conf import settings
from django.urls import resolve
from django.core.validators import validate_email
import jwt
from invitations.utils import get_invitation_model
from .serializers import UserSerializer, GroupSerializer, FriendSerializer, NestedUserSerializer

Invitation = get_invitation_model()

User = get_user_model()

class RegisterView(APIView):


    def _handle_invitation(self, user_data, invite_key):
        '''
        Need to handle and fail silently if the invite thing is broken - lol!
        '''

        try:
            invitation = Invitation.objects.get(key=invite_key)

            inviter = User.objects.get(pk=invitation.inviter.id)
            invited_user = User.objects.get(email=user_data['email'])

            inviter.friends.add(invited_user)
            inviter.save()

            invitation.delete()

        except Exception as err:
            # log it and do nothing
            print(f'\nInviation Failing silently!!! {err}\n')


    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():

            serializer.save()

            if request.data.get('invite_key'):
                self._handle_invitation(serializer._validated_data, request.data.get('invite_key'))

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

        token = jwt.encode({'sub': str(user.id), 'username': user.username, 'email': user.email, 'profile_image': user.profile_image}, settings.SECRET_KEY, algorithm='HS256')
        return Response({'token': token, 'message': f'Welcome back {user.username}'})


class UserList(ListAPIView):
    serializer_class = NestedUserSerializer

    def get_queryset(self):
        params = self.request.GET
        if not params:
            return User.objects.all()

        elif params.get('email'):
            email = params.get('email')
            try:
                validate_email(email)
            except:
                raise ValidationError(detail='Invalid Email')
            return User.objects.filter(email=email)



class GroupFriendsIndexCreate(ListCreateAPIView):
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        url_name = resolve(self.request.path_info).url_name
        if url_name == 'groups_index':
            return self.request.user.groups.all()
        elif url_name == 'friends_index':
            return self.request.user.friends.all()

    def get_serializer_class(self):
        url_name = resolve(self.request.path_info).url_name
        if url_name == 'groups_index':
            return GroupSerializer
        elif url_name == 'friends_index':
            return FriendSerializer

class GroupShowUpdateDelete(RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = GroupSerializer

    def retrieve(self, request, *args, **kwargs):
        queryset = Group.objects.get(pk=kwargs.get('pk'))
        serializer = GroupSerializer(queryset)
        return Response(serializer.data)

    def get_queryset(self):
        return self.request.user.admin_groups.all()


class FriendShowDelete(RetrieveDestroyAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = FriendSerializer
    def get_queryset(self):
        return self.request.user.friends.all()
