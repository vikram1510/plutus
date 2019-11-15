from rest_framework import serializers
from jwt_auth.serializers import NestedUserSerializer

class GenericPayloadSerializer(serializers.Serializer):
    '''
    Defining our own fields here. This is not 'ModelSerializer' 
    '''
    event_type = serializers.CharField(required=True) # expense created or updated or comments added, etc - from Activity
    event_creator = NestedUserSerializer(required=True) # the user that created this event
    model_ref = serializers.CharField(required=True) # the reference (id) of the model to go to
    model_name = serializers.CharField(required=True)


class BroadcastSerializer(serializers.Serializer):
    '''
    Defining our own fields here. This is not 'ModelSerializer' 
    '''
    email_channels = serializers.ListField(required=True) # this is actually the list of channels (emails) we will be broadcasting to
    event_name = serializers.CharField(required=True) # name of the event

    message = GenericPayloadSerializer(required=True)
