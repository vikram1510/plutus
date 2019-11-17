# pylint: disable=abstract-method
from rest_framework import serializers

class BroadcastSerializer(serializers.Serializer):
    '''
    Defining our own fields here. This is not 'ModelSerializer'
    '''
    email_channels = serializers.ListField(required=True) # this is actually the list of channels (emails) we will be broadcasting to
    event_name = serializers.CharField(required=True) # name of the event

    message = serializers.DictField(required=True)
