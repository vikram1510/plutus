from django.db import models
from django.contrib.auth.models import AbstractUser, Group

Group.add_to_class('admin', models.IntegerField(null=True, blank=True))

# Create your models here.
class User(AbstractUser):
    profile_image = models.CharField(max_length=500, blank=True)
