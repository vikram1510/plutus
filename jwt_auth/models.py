import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, Group



# Create your models here.
class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    profile_image = models.CharField(max_length=500, blank=True)
    friends = models.ManyToManyField('self', related_name='friends', blank=True)

Group.add_to_class('admin', models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='admin_groups', null=True))
