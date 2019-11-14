from django.urls import path
from .views import ExpenseView, ExpenseDetailView, TotalView

urlpatterns = [
    path('expenses', ExpenseView.as_view()),
    path('expenses/<str:pk>', ExpenseDetailView.as_view()),
    path('totals', TotalView.as_view()),
]
