import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, Group


# Create your models here.
class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    profile_image = models.CharField(max_length=500, blank=True)
    friends = models.ManyToManyField('self', related_name='friends', blank=True)
    email = models.EmailField(unique=True, db_index=True)

    def to_dict(self, include_names=False):
        basic_detail = {
            'id': str(self.id),
            'username': self.get_username(),
            'email': self.email,
            'profile_image': self.profile_image
        }
        if include_names:
            basic_detail['first_name'] = self.first_name
            basic_detail['last_name'] = self.last_name

        return basic_detail

Group.add_to_class('admin', models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='admin_groups', null=True))
