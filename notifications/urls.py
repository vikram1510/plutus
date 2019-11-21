from django.urls import path
from .views import PusherView, BroadcasterView

urlpatterns = [
    path('pusher', PusherView.as_view()),
    path('broadcast', BroadcasterView.as_view()),
]
