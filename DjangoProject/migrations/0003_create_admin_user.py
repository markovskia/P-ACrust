from django.db import migrations
from django.contrib.auth.hashers import make_password

def create_admin_users(apps, schema_editor):
    User = apps.get_model('DjangoProject', 'User')

    # Admin 1
    user1, created1 = User.objects.get_or_create(username='admin1')
    if created1:
        user1.name = 'Admin One'
        user1.email = 'admin1@mail.com'
        user1.password = make_password('adminpass1')
        user1.role = 'administrator'
        user1.save()

    # Admin 2
    user2, created2 = User.objects.get_or_create(username='admin2')
    if created2:
        user2.name = 'Admin Two'
        user2.email = 'admin2@mail.com'
        user2.password = make_password('adminpass2')
        user2.role = 'administrator'
        user2.save()

def delete_admin_users(apps, schema_editor):
    User = apps.get_model('DjangoProject', 'User')
    User.objects.filter(username__in=['admin1', 'admin2']).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('DjangoProject', '0002_user_role'),
    ]

    operations = [
        migrations.RunPython(create_admin_users, delete_admin_users),
    ]
