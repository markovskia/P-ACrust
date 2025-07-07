from django.urls import path
from django.http import HttpResponse
from rest_framework_simplejwt.views import TokenObtainPairView
from .views import get_user_profile, register_user, update_user

def home(request):
    return HttpResponse("Backend server is running!")

urlpatterns = [
    path('', home),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/user/', get_user_profile),
    path('api/register/', register_user),
    path('api/users/<int:pk>/', update_user),
]
