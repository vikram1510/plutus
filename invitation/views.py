# from django.shortcuts import render
# from django.views import View
from django.shortcuts import redirect
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from invitations.utils import get_invitation_model
from django.contrib.auth import get_user_model
from .serializers import InviteListSerializer, InviteCreateSerializer

Invitation = get_invitation_model()
User = get_user_model()

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
    '''
    We need to redirect in a much friendly way to our frontend.
    TODO: Make the redirection to frontend configurable from the settings... 👍
    '''
    response = redirect(f'http://localhost:4000/register?invite_key={invite_key}')
    return response

class SendInvite(APIView):
    def post(self, request):
        email = request.data['email']
        try:
            invite = Invitation.create(email, inviter=request.user)
            invite.send_invitation(request)
            return Response({'message': 'Invite Sent!'})
        except Exception as e:
            return Response({'error': 'Invite Failed'}, status=400)
