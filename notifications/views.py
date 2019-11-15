from rest_framework.views import APIView
from rest_framework.response import Response
import pusher
from django.conf import settings

from .serializers import BroadcastSerializer

class Broadcaster(APIView):

    def post(self, request):
        serializer = BroadcastSerializer(data=request.data)
        print(f'\n\nSerializers::: {serializer}')
        return Response({'message': 'Broadcasted!!!'})



class PusherView(APIView):

    def post(self, request):
        channels_client = pusher.Pusher(
            app_id=settings.PUSHER_APP_ID,
            key=settings.PUSHER_APP_KEY,
            secret=settings.PUSHER_APP_SECRET,
            cluster='eu',
            ssl=True
        )

        channels_client.trigger('my-channel', 'my-event', { **request.data })
        return Response(status=200)
