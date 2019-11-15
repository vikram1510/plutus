from django.urls import path
from .views import PusherView, Broadcaster

urlpatterns = [
    path('pusher', PusherView.as_view()),
    path('broadcast', Broadcaster.as_view()),
]
