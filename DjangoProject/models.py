from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class MyUserManager(BaseUserManager):
    def create_user(self, name, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email е задолжителен')
        email = self.normalize_email(email)

        if 'role' not in extra_fields:
            extra_fields['role'] = 'client'

        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)  # лозинката се хашира
        user.save(using=self._db)

        return user

    def create_superuser(self, name, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(name, username, email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    role_choices = (
        ('client', 'Client'),
        ('administrator', 'Administrator'),
        ('employee', 'Employee'),
    )

    name = models.CharField(max_length=20, unique=False, default="Guest")
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    city = models.CharField(max_length=20, blank=True, null=True, default="Skopje")
    acceptPromotions = models.BooleanField(default=False)

    email_verified = models.BooleanField(default=False)

    role = models.CharField(max_length=20, choices=role_choices, default="client")

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = MyUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return f"{self.username} ({self.role})"


class Reservation(models.Model):
    table_id = models.CharField(max_length=100)
    date = models.DateField()
    from_time = models.TimeField()
    to_time = models.TimeField()
    name = models.CharField(max_length=10, default="Guest")
    username = models.CharField(max_length=150)
    email = models.EmailField()
    people_count = models.IntegerField()
    comment = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=20, blank=True, null=True, default="Skopje")
    approved = models.CharField(
        max_length=20,
        choices=[
            ("Not Approved", "Not Approved"),
            ("Approved", "Approved")
        ],
        default="Not Approved"
    )


class Pizza(models.Model):
    name = models.CharField(max_length=100)
    heading = models.CharField(max_length=150, blank=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    image = models.ImageField(upload_to="pizzas/", blank=True, null=True)
    availability = models.BooleanField(default=True)
    stickers = models.ManyToManyField('Sticker', related_name='pizzas', blank=True)

    def __str__(self):
        return self.name


class Sticker(models.Model):
    image = models.ImageField(upload_to='stickers/')


class Ingredient(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    image = models.ImageField(upload_to="ingredients/", blank=True, null=True)
    availability = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Promo(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ('%', 'Percentage'),
        ('€', 'Fixed Amount'),
    ]

    name = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=1, choices=DISCOUNT_TYPE_CHOICES, default='%')
    discount_value = models.DecimalField(max_digits=6, decimal_places=2)
    usage_limit = models.PositiveIntegerField(blank=True, null=True)
    no_limit = models.BooleanField(default=False)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.discount_type}{self.discount_value})"


class Order(models.Model):
    table_name = models.CharField(max_length=50)
    order_type = models.CharField(max_length=20)  # Dine In / Takeaway
    items = models.JSONField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    comment = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    employee_name = models.CharField(max_length=100, blank=True, null=True)  # ✅


class Salad(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    description = models.TextField(blank=True)
    availability = models.BooleanField(default=True)
    image = models.ImageField(upload_to='salads/', blank=True, null=True)


class Drink(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    size = models.CharField(max_length=50, blank=True, null=True)
    availability = models.BooleanField(default=True)
    image = models.ImageField(upload_to='drinks/', blank=True, null=True)


class Dessert(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    availability = models.BooleanField(default=True)
    image = models.ImageField(upload_to='desserts/', blank=True, null=True)


class Sauce(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    availability = models.BooleanField(default=True)
    image = models.ImageField(upload_to='sauces/', blank=True, null=True)

    def __str__(self):
        return self.name


class SpecialOffer(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    description = models.TextField(blank=True)
    availability = models.BooleanField(default=True)
    image = models.ImageField(upload_to='special_offers/', blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)

    # New fields for components of the offer
    pizzas_count = models.PositiveIntegerField(default=0)
    drinks_count = models.PositiveIntegerField(default=0)
    salads_count = models.PositiveIntegerField(default=0)
    desserts_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name

class Message(models.Model):
    sender = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender}"

class DailyCode(models.Model):
    code = models.CharField(max_length=10, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.code

class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='favorites'
    )
    pizza = models.ForeignKey(
        Pizza,
        on_delete=models.CASCADE,
        related_name='favorited_by'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'pizza')
        verbose_name = "Favorite"
        verbose_name_plural = "Favorites"

    def __str__(self):
        return f"{self.user} ❤️ {self.pizza.name}"