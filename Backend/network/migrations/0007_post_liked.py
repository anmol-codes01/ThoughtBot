# Generated by Django 5.0.1 on 2024-02-04 09:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0006_remove_follow_follow_count_user_follow_count'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='liked',
            field=models.BooleanField(default=False),
        ),
    ]
