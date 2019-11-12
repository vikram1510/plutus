from django.contrib import admin
from .models import Expense, Split, Comment

# Register your models here.
admin.site.register(Expense)
admin.site.register(Split)
admin.site.register(Comment)
