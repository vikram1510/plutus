from django.urls import path
from .views import RegisterView, LoginView, GroupIndexCreate

urlpatterns = [
    path('register', RegisterView.as_view()),
    path('login', LoginView.as_view()),
    path('groups', GroupIndexCreate.as_view()),
]
