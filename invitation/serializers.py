from rest_framework import serializers
from invitations.utils import get_invitation_model
from jwt_auth.serializers import NestedUserSerializer

Invitation = get_invitation_model()

class InviteListSerializer(serializers.ModelSerializer):

    inviter = NestedUserSerializer()

    class Meta:
        model = Invitation
        fields = ('__all__')
