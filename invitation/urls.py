from django.urls import path
from .views import redirect_invite, FindInvitationView, SendInvite

app_name = 'invitation'

urlpatterns = [
    path('accept-invite/<str:invite_key>', redirect_invite),
    path('invites/<str:key>', FindInvitationView.as_view()),
    path('invites', SendInvite.as_view()),
]
