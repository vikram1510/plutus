from django.urls import path
from .views import RegisterView, LoginView, GroupIndexCreate, GroupShowUpdateDelete

urlpatterns = [
    path('register', RegisterView.as_view()),
    path('login', LoginView.as_view()),
    path('groups', GroupIndexCreate.as_view()),
    path('groups/<int:pk>', GroupShowUpdateDelete.as_view()),
]
