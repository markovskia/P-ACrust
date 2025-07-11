import traceback
import sys
sys.stdout.reconfigure(encoding='utf-8')
from django.template.context_processors import request
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView

from rest_framework.response import Response
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
User = get_user_model()
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import User
from .serializers import UserSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    print("Добиен POST request со податоци:", request.data)

    try:
        data = request.data
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        address = request.data.get('address')
        phone = request.data.get('phone')
        promotions = request.data.get('acceptPromotions')

        if not username or not email or not password:
            return Response({'message': 'Недостасуваат обврзни полиња.'}, status=400)

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            address = address,
            phone = phone,
            acceptPromotions = promotions
        )

        return Response({'message': 'User registered', 'user': {'username': user.username, 'email': user.email}},status=201)
    except Exception as e:
        print("🔥 EXCEPTION:", str(e))
        traceback.print_exc()
        return Response({'error': str(e)}, status=500)

class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        print(f"Обид за најава со корисничко име: {request.data.get('username')}")
        return super().post(request, *args, **kwargs)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    # Само сопствениот профил смееш да го менуваш
    if request.user != user:
        return Response({"error": "Unauthorized."}, status=status.HTTP_403_FORBIDDEN)

    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
