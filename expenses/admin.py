from django.contrib import admin
from .models import Expense, Split, Comment, Ledger, Activity, UserInvolvedActivity

# Register your models here.
admin.site.register(Expense)
admin.site.register(Split)
admin.site.register(Comment)
admin.site.register(Activity)
admin.site.register(UserInvolvedActivity)
admin.site.register(Ledger)
