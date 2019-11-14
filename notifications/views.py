from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
import pusher

# Create your views here.
class PusherView(APIView):

    def post(self, request):
        channels_client = pusher.Pusher(
            app_id = settings.PUSHER_APP_ID,
            key = settings.PUSHER_APP_KEY,
            secret= settings.PUSHER_APP_SECRET,
            cluster='eu',
            ssl=True
        )

        channels_client.trigger('my-channel', 'my-event', { **request.data })
        return Response(status=200)
