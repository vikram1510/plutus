from django.urls import path
from .views import redirect_invite, FindInvitationView

app_name = 'invitation'

urlpatterns = [
    path('invites/<str:key>', FindInvitationView.as_view()),
    path('accept-invite/<str:invite_key>', redirect_invite),
]
