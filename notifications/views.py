# pylint: disable=bare-except
from rest_framework.views import APIView
from rest_framework.response import Response
import pusher
from django.conf import settings

from .serializers import BroadcastSerializer


class Broadcaster:

    def __init__(self, data):
        self.data = data

    def push(self):
        '''
        Will throw error if invalid - it is required by the client to handle the exception
        '''
        serializer = BroadcastSerializer(data=self.data)

        # this is_valid() will throw error if invalid
        if serializer.is_valid():
            channels_client = pusher.Pusher(
                app_id=settings.PUSHER_APP_ID,
                key=settings.PUSHER_APP_KEY,
                secret=settings.PUSHER_APP_SECRET,
                cluster='eu',
                ssl=True
            )
            channels_client.trigger(serializer.data['email_channels'], serializer.data['event_name'], {**serializer.data['message']})

        else:
            raise Exception('Invalid json schema for broadcasting event' + f'{serializer.errors}')

class BroadcasterView(APIView):

    def post(self, request):

        try:
            broadcast = Broadcaster(data=request.data)
            broadcast.push()
            return Response({'message': 'Broadcasted!!!'})

        except:
            return Response({'message': 'Error!!!'}, status=422)


class PusherView(APIView):

    def post(self, request):
        channels_client = pusher.Pusher(
            app_id=settings.PUSHER_APP_ID,
            key=settings.PUSHER_APP_KEY,
            secret=settings.PUSHER_APP_SECRET,
            cluster='eu',
            ssl=True
        )

        channels_client.trigger('my-channel', 'my-event', {**request.data})
        return Response(status=200)
