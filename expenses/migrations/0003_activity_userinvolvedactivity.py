# Generated by Django 2.2.7 on 2019-11-14 22:07

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('expenses', '0002_auto_20191113_1653'),
    ]

    operations = [
        migrations.CreateModel(
            name='Activity',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('record_ref', models.CharField(max_length=50)),
                ('activity_type', models.CharField(choices=[('expense_created', 'expense_created'), ('expense_updated', 'expense_updated'), ('comment_added', 'comment_added'), ('payment_made', 'payment_made')], max_length=20)),
                ('creator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='created_activities', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='UserInvolvedActivity',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('activity', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='related_activities', to='expenses.Activity')),
                ('related_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='related_activities', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
