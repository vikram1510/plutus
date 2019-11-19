# pylint: disable=no-member, arguments-differ
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth import get_user_model
from django.conf import settings
import jwt
User = get_user_model()

class JWTAuthentication(BaseAuthentication):

    def authenticate(self, request):
        header = request.headers.get('Authorization')

        # Adding the check for Basic as we don't really handle/care about Basic Token authentication
        if not header or header.startswith('Basic'):
            return None

        # We are only interested with the Bearer!
        if not header.startswith('Bearer'):
            raise PermissionDenied({'message': 'Invalid Authorization Header'})

        token = header.replace('Bearer ', '')

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user = User.objects.get(pk=payload.get('sub'))
        except jwt.exceptions.InvalidTokenError:
            raise PermissionDenied({'message': 'Invalid token'})
        except User.DoesNotExist:
            raise PermissionDenied({'message': 'User not found'})

        return (user, token)
