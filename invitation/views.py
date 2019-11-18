# from django.shortcuts import render
# from django.views import View
from django.shortcuts import redirect
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response

from invitations.utils import get_invitation_model
Invitation = get_invitation_model()

from .serializers import InviteListSerializer


class FindInvitationView(APIView):

    def get(self, _request, key):

        try:
            invitation = Invitation.objects.get(key=key)
            custom_data = {
                'key': invitation.key,
                'inviter': invitation.inviter.to_dict(),
                'email': invitation.email,
                'accepted': invitation.accepted
            }

            return Response(custom_data)

        except Invitation.DoesNotExist:
            return Response({'message': 'invitation not found'}, status=404)


    def post(self, _request, key):

        try:
            invitation = Invitation.objects.get(key=key)
            invitation.accepted = True
            invitation.save()
            return Response({'message': 'Invited accepted'})

        except Invitation.DoesNotExist:
            return Response({'message': 'invitation not found'}, status=404)


def redirect_invite(_request, invite_key):
    response = redirect(f'http://localhost:4000/register/{invite_key}')
    return response


# Create your views here.
# class InviteShowView(View):

#     # again - the name of the this method 'get' corresponds to the HTTP GET request but now with id
#     def get(self, request, invite_key):
#         return render(request, 'testing.html', {'invite_key': invite_key})
