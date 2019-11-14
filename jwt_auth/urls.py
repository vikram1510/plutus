from django.urls import path
from .views import RegisterView, LoginView, GroupFriendsIndexCreate, GroupShowUpdateDelete, FriendShowDelete

urlpatterns = [
    path('register', RegisterView.as_view()),
    path('login', LoginView.as_view()),
    path('groups', GroupFriendsIndexCreate.as_view(), name='groups_index'),
    path('groups/<int:pk>', GroupShowUpdateDelete.as_view()),
    path('friends', GroupFriendsIndexCreate.as_view(), name='friends_index'),
    path('friends/<str:pk>', FriendShowDelete.as_view()),
]
