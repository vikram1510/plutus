from django.urls import path
from .views import PusherView

urlpatterns = [
    path('pusher', PusherView.as_view()),
]
