from django.urls import path
from django.http import HttpResponse
from rest_framework_simplejwt.views import TokenObtainPairView
from . import views
from .views import get_user_profile, register_user, update_user, verify_email, about_us
from django.conf import settings
from django.conf.urls.static import static

def home(request):
    return HttpResponse("Backend server is running!")


urlpatterns = [
    path('', home),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/user/', get_user_profile),
    path('api/register/', register_user),
    path('api/users/<int:pk>/', update_user),
    path('verify-email/<int:user_id>/', verify_email, name='verify-email'),
    path('api/check-table', views.check_table_availability, name='check_table_availability'),
    path('api/reserve', views.reserve_table, name='reserve_table'),
    path('api/about-us', about_us),
    path('api/user-reservations/', views.get_user_reservations, name='get_user_reservations'),
    path('api/reservations/<int:pk>/cancel/', views.cancel_reservation, name='cancel_reservation'),
    path('api/users/', views.get_users, name='get_users'),
    path("menu/", views.get_menu, name="get_menu"),
    path("api/pizzas/", views.get_pizzas, name="get_pizzas"),
    path("api/pizzas/add/", views.add_pizza, name="add_pizza"),
    path("api/pizzas/<int:pk>/update/", views.update_pizza, name="update_pizza"),
    path("api/pizzas/<int:pk>/delete/", views.delete_pizza, name="delete_pizza"),
    path("pizzas/<int:pizza_id>/upload-stickers/", views.upload_stickers),
    path("api/ingredients/", views.get_ingredients, name="get_ingredients"),
    path("api/ingredients/add/", views.add_ingredient, name="add_ingredient"),
    path("api/ingredients/<int:pk>/update/", views.update_ingredient, name="update_ingredient"),
    path("api/ingredients/<int:pk>/delete/", views.delete_ingredient, name="delete_ingredient"),
    path("api/promos/", views.get_promos, name="get_promos"),
    path("api/promos/add/", views.add_promo, name="add_promo"),
    path("api/promos/<int:pk>/update/", views.update_promo, name="update_promo"),
    path("api/promos/<int:pk>/delete/", views.delete_promo, name="delete_promo"),
    path("api/orders", views.create_order, name="create_order"),
    path("api/get-orders", views.get_orders, name="get_orders"),
    path("api/orders/<int:pk>/", views.delete_order, name="delete_order"),
    path("api/orders/<int:pk>/update/", views.update_order_status, name="update_order_status"),
    path('api/reservations/', views.get_reservations, name='get_reservations'),
    path("api/salads/", views.get_salads, name="salad-list"),
    path("api/salads/add/", views.add_salad, name="salad-add"),
    path("api/salads/<int:pk>/update/", views.update_salad, name="salad-update"),
    path("api/salads/<int:pk>/delete/", views.delete_salad, name="salad-delete"),
    path("api/drinks/", views.get_drinks, name="drink-list"),
    path("api/drinks/add/", views.add_drink, name="drink-add"),
    path("api/drinks/<int:pk>/update/", views.update_drink, name="drink-update"),
    path("api/drinks/<int:pk>/delete/", views.delete_drink, name="drink-delete"),
    path("api/desserts/", views.get_desserts, name="dessert-list"),
    path("api/desserts/add/", views.add_dessert, name="dessert-add"),
    path("api/desserts/<int:pk>/update/", views.update_dessert, name="dessert-update"),
    path("api/desserts/<int:pk>/delete/", views.delete_dessert, name="dessert-delete"),
    path("api/sauces/", views.get_sauces, name="sauce-list"),
    path("api/sauces/add/", views.add_sauce, name="sauce-add"),
    path("api/sauces/<int:pk>/update/", views.update_sauce, name="sauce-update"),
    path("api/sauces/<int:pk>/delete/", views.delete_sauce, name="sauce-delete"),
    path("api/special-offers/", views.get_special_offers, name="special-offer-list"),
    path("api/special-offers/add/", views.add_special_offer, name="special-offer-add"),
    path("api/special-offers/<int:pk>/update/", views.update_special_offer, name="special-offer-update"),
    path("api/special-offers/<int:pk>/delete/", views.delete_special_offer, name="special-offer-delete"),
    path('api/stats/most-ordered/', views.stats_most_ordered_pizzas, name='most-ordered'),
    path('api/stats/users/', views.stats_users, name='user-stats'),
    path('api/stats/monthly-orders/', views.stats_monthly_orders, name='monthly-orders'),
    path("api/send-message/", views.send_message),
    path("api/get-messages/", views.get_messages, name="get-messages"),
    path("api/messages/<int:pk>/delete/", views.delete_message, name="delete-message"),
    path('create-today-promo/', views.create_today_promo, name='create_today_promo'),
    path('api/get-daily-code/', views.get_daily_code, name='get-daily-code'),
    path('api/favorites/', views.favorite_list, name='favorite_list'),
    path('api/favorites/toggle/<int:pizza_id>/', views.toggle_favorite, name='toggle_favorite'),
    path('api/reservations/<int:pk>/approve/', views.approve_reservation, name='approve_reservation'),
    path("api/send-reservation-mail/", views.send_reservation_mail, name="send-reservation-mail"),
    path('api/google-login/', views.google_login, name="google-login"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
