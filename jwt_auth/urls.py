from django.urls import path
from .views import RegisterView, LoginView, NewGroup, ViewGroup

urlpatterns = [
    path('register', RegisterView.as_view()),
    path('login', LoginView.as_view()),
    # path('groups', NewGroup.as_view()),
    path('groups', ViewGroup.as_view()),
]
