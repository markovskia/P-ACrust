import traceback
import sys
from django.views.decorators.csrf import csrf_exempt

sys.stdout.reconfigure(encoding='utf-8')
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.utils.decorators import method_decorator

User = get_user_model()

from .models import User, Message, DailyCode
from .serializers import UserSerializer

import json
from django.http import JsonResponse
from datetime import datetime

from .serializers import MessageSerializer

from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Pizza
from .serializers import PizzaSerializer
from .serializers import ReservationSerializer

from .models import Ingredient
from .serializers import IngredientSerializer

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Promo
from .serializers import PromoSerializer
from .models import Order
from .serializers import OrderSerializer
from .models import Sticker
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models.functions import ExtractMonth
from django.db.models import Count
from django.utils import timezone
import random

from .models import Favorite
from .serializers import FavoriteSerializer

from django.core.mail import send_mail
from .models import Reservation
from rest_framework import status

from django.core.mail import get_connection, EmailMessage

import ssl
from django.core.mail import get_connection, EmailMultiAlternatives
from django.conf import settings


@api_view(["PATCH"])
def update_order_status(request, pk):
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)

    status_value = request.data.get("status")
    if status_value:
        order.status = status_value
        order.save()
        return Response({"message": f"Order {pk} updated to {status_value}"})
    else:
        return Response({"error": "Missing status field"}, status=400)


@api_view(["POST"])
def create_order(request):
    try:
        data = request.data
        order = Order.objects.create(
            table_name=data.get("table_name"),
            order_type=data.get("order_type"),
            items=data.get("items"),
            subtotal=data.get("subtotal"),
            comment=data.get("comment", ""),
            status="pending",
            employee_name=data.get("employee_name"),
        )
        return Response({"message": "Order created", "id": order.id}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
def delete_order(request, pk):
    try:
        order = Order.objects.get(pk=pk)
        order.delete()
        return Response({"message": "Order deleted successfully"})
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_orders(request):
    orders = Order.objects.all().order_by('-id')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_promos(request):
    promos = Promo.objects.all().order_by('-created_at')
    serializer = PromoSerializer(promos, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_promo(request):
    serializer = PromoSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        print("❌ Promo validation errors:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_promo(request, pk):
    try:
        promo = Promo.objects.get(pk=pk)
    except Promo.DoesNotExist:
        return Response({"detail": "Promo not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = PromoSerializer(promo, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_promo(request, pk):
    try:
        promo = Promo.objects.get(pk=pk)
    except Promo.DoesNotExist:
        return Response({"detail": "Promo not found"}, status=status.HTTP_404_NOT_FOUND)

    promo.delete()
    return Response({"detail": "Promo deleted"}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_ingredients(request):
    ingredients = Ingredient.objects.all()
    serializer = IngredientSerializer(ingredients, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_ingredient(request):
    serializer = IngredientSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_ingredient(request, pk):
    try:
        ingredient = Ingredient.objects.get(pk=pk)
    except Ingredient.DoesNotExist:
        return Response({"error": "Ingredient not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = IngredientSerializer(ingredient, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_ingredient(request, pk):
    try:
        ingredient = Ingredient.objects.get(pk=pk)
        ingredient.delete()
        return Response({"message": "Ingredient deleted"}, status=status.HTTP_204_NO_CONTENT)
    except Ingredient.DoesNotExist:
        return Response({"error": "Ingredient not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_pizzas(request):
    pizzas = Pizza.objects.all()
    serializer = PizzaSerializer(pizzas, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_pizza(request):
    serializer = PizzaSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def update_pizza(request, pk):
    pizza = get_object_or_404(Pizza, pk=pk)
    print("📦 Received PATCH for pizza", pk)
    print("➡️ request.data:", request.data)
    print("➡️ request.FILES:", request.FILES)

    serializer = PizzaSerializer(pizza, data=request.data, partial=True, context={'request': request})

    if serializer.is_valid():
        serializer.save()
        print("✅ Pizza updated successfully!")
        return Response(serializer.data)
    else:
        print("❌ Pizza update validation errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_stickers(request, pizza_id):
    pizza = get_object_or_404(Pizza, id=pizza_id)

    files = request.FILES.getlist("stickers") or [request.FILES.get("image")]
    new_stickers = []

    for f in files:
        if not f:
            continue
        sticker = Sticker.objects.create(image=f)
        pizza.stickers.add(sticker)
        new_stickers.append({
            "id": sticker.id,
            "image": sticker.image.url
        })

    pizza.save()
    return Response(new_stickers)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_pizza(request, pk):
    try:
        pizza = Pizza.objects.get(pk=pk)
        pizza.delete()
        return Response({"message": "Pizza deleted"}, status=status.HTTP_204_NO_CONTENT)
    except Pizza.DoesNotExist:
        return Response({"error": "Pizza not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_menu(request):
    pizzas = Pizza.objects.filter(is_available=True)
    serializer = PizzaSerializer(pizzas, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    if request.user.role != "administrator":
        return Response({"error": "Not authorized"}, status=403)
    return Response({"message": "Welcome Admin!"})


@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request, user_id):
    try:
        user = User.objects.get(id=user_id)

        if user.email_verified:
            return Response({'message': 'Емаил адресата веќе е потврдена.'})

        user.email_verified = True
        user.save()

        return Response({'message': 'Емаил адресата е успешно потврдена!'})
    except User.DoesNotExist:
        return Response({'message': 'Корисникот не постои.'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['GET'])
def about_us(request):
    return Response({
        "company_name": "Your Company Name",
        "description": "We are a pizza restaurant dedicated to making the best pizzas in town!",
        "contact_email": "contact@yourcompany.com",
        "phone": "+123456789"
    })


def send_verification_email(user):
    try:
        subject = 'Потврда на регистрација'
        message = f'''
    Здраво {user.username},
    
    Ви благодариме што се регистриравте на нашата апликација.
    Кликнете на следниот линк за да ја потврдите вашата емаил адреса:
    
    http://localhost:8000/api/verify-email/{user.id}/
    
    (Ова е тест линк — во реална апликација се користи token за сигурност)
        '''
        send_mail(subject, message, settings.EMAIL_HOST_USER, [user.email])
    except Exception as e:
        print("⚠️ Не успеа да се испрати емаил:", e)


@api_view(['GET'])
def get_reservations(request):
    reservations = Reservation.objects.all()
    serializer = ReservationSerializer(reservations, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cancel_reservation(request, pk):
    try:
        reservation = Reservation.objects.get(pk=pk, username=request.user.username)
        reservation.delete()
        return Response({"message": "Reservation canceled"}, status=204)
    except Reservation.DoesNotExist:
        return Response({"error": "Reservation not found"}, status=404)
    except Exception as e:
        import traceback
        print("Error in cancel_reservation:")
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    print("Добиен POST request со податоци:", request.data)

    try:
        data = request.data
        name = data.get('name')
        username = data.get('username')

        try:
            email = data.get('email')
            validate_email(email)
        except ValidationError:
            return Response({'message': 'Емаил адресата не е валидна.'}, status=400)

        allowed_domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"]
        domain = email.split('@')[-1]
        if domain not in allowed_domains:
            return Response({'message': 'Само Gmail, Yahoo или Outlook адреси се дозволени.'}, status=400)

        password = data.get('password')
        address = data.get('address')
        phone = data.get('phone')
        promotions = data.get('acceptPromotions')
        city = data.get('city')

        if not username or not email or not password:
            return Response({'message': 'Недостасуваат обврзни полиња.'}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({'message': 'Овој емаил веќе е искористен.'}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({'message': 'Ова корисничко име веќе постои.'}, status=400)

        role = data.get('role', 'client')

        user = User.objects.create_user(
            name=name,
            username=username,
            email=email,
            password=password,
            address=address,
            phone=phone,
            city=city,
            acceptPromotions=promotions,
            role=role
        )

        send_verification_email(user)

        return Response({'message': 'User registered', 'user': {'username': user.username, 'email': user.email}},
                        status=201)
    except Exception as e:
        traceback.print_exc()
        return Response({'error': str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
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

    if request.user != user and request.user.role != "administrator":
        return Response({"error": "Unauthorized."}, status=status.HTTP_403_FORBIDDEN)

    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
def check_table_availability(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            table_id = data.get('tableId')
            date = data.get('date')
            from_time = data.get('fromTime')
            to_time = data.get('toTime')

            total_capacity = {
                "oval-table": 12,
                "rect-table-1": 6,
                "rect-table-2": 6,
                "rect-table-3": 6,
                "vert-table": 8,
                "left-table-1": 4,
                "left-table-2": 4,
                "left-table-3": 4,
                "left-table-4": 4,
                "left-table-5": 4,
                "left-table-6": 4,
                "left-table-7": 4,
                "left-table-8": 4,
                "left-table-9": 4,
                "right-table-10": 4,
                "right-table-11": 4,
                "right-table-12": 4,
                "right-table-13": 4,
                "right-table-14": 4,
                "right-table-15": 4,
                "right-table-16": 4,
            }

            reservations = Reservation.objects.filter(
                table_id=table_id,
                date=date,
                from_time__lt=to_time,
                to_time__gt=from_time
            )

            reserved_seats = sum([r.people_count for r in reservations])
            capacity = total_capacity.get(table_id, 0)
            free_chairs = max(capacity - reserved_seats, 0)

            reserved_seats = sum([r.people_count for r in reservations])
            capacity = total_capacity.get(table_id, 0)
            free_chairs = max(capacity - reserved_seats, 0)

            return JsonResponse({
                'available': free_chairs > 0,
                'freeChairs': free_chairs
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)


@api_view(['GET'])
def get_user_reservations(request):
    try:
        user_reservations = Reservation.objects.all().order_by('-date', '-from_time')

        reservation_list = []
        for res in user_reservations:
            reservation_list.append({
                "id": res.id,
                "table": res.table_id,
                "date": res.date,
                "from_time": res.from_time.strftime('%H:%M'),
                "to_time": res.to_time.strftime('%H:%M'),
                "people_count": res.people_count,
                "comment": res.comment,
                "approved": res.approved,
                "name": res.username
            })

        return Response(reservation_list)

    except Exception as e:
        print("🔥 Error fetching reservations:", e)
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def approve_reservation(request, pk):
    reservation = Reservation.objects.get(pk=pk)

    if reservation.approved == "Approved":
        reservation.approved = "Not Approved"
    else:
        reservation.approved = "Approved"

    reservation.save(update_fields=["approved"])

    return Response({
        "approved": reservation.approved
    })

@csrf_exempt
def reserve_table(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            print("=" * 50)
            print("📥 RECEIVED RESERVATION DATA:")
            for key, value in data.items():
                print(f"  {key}: {value} (type: {type(value).__name__})")
            print("=" * 50)

            table_id = data.get('tableId')
            date = data.get('date')
            from_time = data.get('fromTime')
            to_time = data.get('toTime')
            username = data.get('username')
            name = data.get('name')
            email = data.get('email')
            people_count = data.get('peopleCount')
            comment = data.get('comment', '')

            if not all([table_id, date, from_time, to_time, name, email, people_count]):
                missing = []
                if not table_id: missing.append('tableId')
                if not date: missing.append('date')
                if not from_time: missing.append('fromTime')
                if not to_time: missing.append('toTime')
                if not name: missing.append('name')
                if not email: missing.append('email')
                if not people_count: missing.append('peopleCount')

                return JsonResponse({'error': f'Недостасуваат полиња: {", ".join(missing)}'}, status=400)

            from_time_obj = datetime.strptime(from_time, "%H:%M").time()
            to_time_obj = datetime.strptime(to_time, "%H:%M").time()

            conflicts = Reservation.objects.filter(
                table_id=table_id,
                date=date,
                from_time__lt=to_time_obj,
                to_time__gt=from_time_obj
            )

            if conflicts.exists():
                return JsonResponse({'message': 'Масата не е слободна во тој период'}, status=400)


            reservation = Reservation.objects.create(
                table_id=table_id,
                date=date,
                from_time=from_time_obj,
                to_time=to_time_obj,
                username=username if username else None,
                name=name,
                email=email,
                people_count=people_count,
                comment=comment,
                approved="Pending"
            )

            print(f"✅ Reservation created: ID={reservation.id}, Name={name}, Table={table_id}")
            print("=" * 50)

            return JsonResponse({
                'message': 'Резервацијата е успешно зачувана!',
                'reservation_id': reservation.id
            }, status=201)

        except ValueError as e:
            print(f"❌ ValueError: {str(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': f'Погрешен формат: {str(e)}'}, status=400)

        except Exception as e:
            print(f"❌ Exception: {str(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

from .models import Salad
from .serializers import SaladSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def get_salads(request):
    salads = Salad.objects.all()
    serializer = SaladSerializer(salads, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_salad(request):
    serializer = SaladSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_salad(request, pk):
    try:
        salad = Salad.objects.get(pk=pk)
    except Salad.DoesNotExist:
        return Response({"error": "Salad not found"}, status=404)

    serializer = SaladSerializer(salad, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_salad(request, pk):
    try:
        salad = Salad.objects.get(pk=pk)
        salad.delete()
        return Response({"message": "Salad deleted"}, status=204)
    except Salad.DoesNotExist:
        return Response({"error": "Salad not found"}, status=404)


from .models import Drink
from .serializers import DrinkSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def get_drinks(request):
    drinks = Drink.objects.all()
    try:
        serializer = DrinkSerializer(drinks, many=True)
        return Response(serializer.data)
    except Exception as e:
        print("Error serializing drinks:", e)
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_drink(request):
    serializer = DrinkSerializer(data=request.data)
    if serializer.is_valid():
        print("Serializer valid!")
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    print("Serializer errors:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_drink(request, pk):
    try:
        drink = Drink.objects.get(pk=pk)
    except Drink.DoesNotExist:
        return Response({"error": "Drink not found"}, status=404)

    serializer = DrinkSerializer(drink, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_drink(request, pk):
    try:
        drink = Drink.objects.get(pk=pk)
        drink.delete()
        return Response({"message": "Drink deleted"}, status=204)
    except Drink.DoesNotExist:
        return Response({"error": "Drink not found"}, status=404)


from .models import Dessert
from .serializers import DessertSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def get_desserts(request):
    desserts = Dessert.objects.all()
    serializer = DessertSerializer(desserts, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_dessert(request):
    serializer = DessertSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_dessert(request, pk):
    try:
        dessert = Dessert.objects.get(pk=pk)
    except Dessert.DoesNotExist:
        return Response({"error": "Dessert not found"}, status=404)

    serializer = DessertSerializer(dessert, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_dessert(request, pk):
    try:
        dessert = Dessert.objects.get(pk=pk)
        dessert.delete()
        return Response({"message": "Dessert deleted"}, status=204)
    except Dessert.DoesNotExist:
        return Response({"error": "Dessert not found"}, status=404)


from .models import Sauce
from .serializers import SauceSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def get_sauces(request):
    sauces = Sauce.objects.all()
    serializer = SauceSerializer(sauces, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_sauce(request):
    serializer = SauceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_sauce(request, pk):
    try:
        sauce = Sauce.objects.get(pk=pk)
    except Sauce.DoesNotExist:
        return Response({"error": "Sauce not found"}, status=404)

    serializer = SauceSerializer(sauce, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_sauce(request, pk):
    try:
        sauce = Sauce.objects.get(pk=pk)
        sauce.delete()
        return Response({"message": "Sauce deleted"}, status=204)
    except Sauce.DoesNotExist:
        return Response({"error": "Sauce not found"}, status=404)


from .models import SpecialOffer
from .serializers import SpecialOfferSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def get_special_offers(request):
    offers = SpecialOffer.objects.all()
    serializer = SpecialOfferSerializer(offers, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_special_offer(request):
    serializer = SpecialOfferSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_special_offer(request, pk):
    try:
        offer = SpecialOffer.objects.get(pk=pk)
    except SpecialOffer.DoesNotExist:
        return Response({"error": "Special Offer not found"}, status=404)

    serializer = SpecialOfferSerializer(offer, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_special_offer(request, pk):
    try:
        offer = SpecialOffer.objects.get(pk=pk)
        offer.delete()
        return Response({"message": "Special Offer deleted"}, status=204)
    except SpecialOffer.DoesNotExist:
        return Response({"error": "Special Offer not found"}, status=404)


@api_view(['GET'])
@permission_classes([AllowAny])
def stats_most_ordered_pizzas(request):
    pizzas = Pizza.objects.all()
    data = []

    for pizza in pizzas:
        count = Order.objects.filter(items__icontains=pizza.name).count()
        data.append({"name": pizza.name, "count": count})

    return Response(data)


@api_view(['GET'])
@permission_classes([AllowAny])
def stats_users(request):
    users = User.objects.all()

    clients = users.filter(role="client").count()
    employees = users.filter(role="employee").count()
    admins = users.filter(role="administrator").count()

    return Response({
        "clients": clients,
        "employees": employees,
        "admins": admins
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def stats_monthly_orders(request):
    stats = (
        Order.objects
        .annotate(month=ExtractMonth('created_at'))
        .values('month')
        .annotate(count=Count('id'))
        .order_by('month')
    )
    return Response(stats)


@api_view(['POST'])
@permission_classes([AllowAny])
def send_message(request):
    print("POST data:", request.data)
    serializer = MessageSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        print("Message saved!")
        return Response({"message": "Message sent"}, status=status.HTTP_201_CREATED)
    print("Errors:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_messages(request):
    messages = Message.objects.all().order_by('-created_at')
    print("Returning messages:", messages)
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_message(request, pk):
    try:
        message = Message.objects.get(pk=pk)
        message.delete()
        return Response({"message": "Message deleted"}, status=204)
    except Message.DoesNotExist:
        return Response({"error": "Message not found"}, status=404)


PROMO_DURATION_SECONDS = 300


@api_view(['GET'])
@permission_classes([AllowAny])
def get_daily_code(request):
    now = timezone.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    code_obj = DailyCode.objects.filter(created_at__gte=today_start).first()

    if code_obj:
        elapsed = (now - code_obj.created_at).total_seconds()
        remaining = max(PROMO_DURATION_SECONDS - elapsed, 0)
        return Response({
            "code": code_obj.code,
            "created_at": code_obj.created_at,
            "time_left": remaining
        })
    else:
        new_code = str(random.randint(1000, 9999))
        code_obj = DailyCode.objects.create(code=new_code)
        return Response({
            "code": code_obj.code,
            "created_at": code_obj.created_at,
            "time_left": PROMO_DURATION_SECONDS
        })


@api_view(['POST'])
def create_today_promo(request):
    now = timezone.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    promo = Promo.objects.filter(created_at__gte=today_start).first()

    if promo:
        serializer = PromoSerializer(promo)
        return Response(serializer.data)

    code = random.randint(1000, 9999)
    serializer = PromoSerializer(data={"code": code})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_favorites(request):
    favorites = Favorite.objects.filter(user=request.user)
    serializer = FavoriteSerializer(
        favorites,
        many=True,
        context={'request': request}
    )
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_favorite(request, pizza_id):
    user = request.user
    try:
        pizza = Pizza.objects.get(id=pizza_id)
    except Pizza.DoesNotExist:
        return Response({"detail": "Pizza not found."}, status=status.HTTP_404_NOT_FOUND)

    favorite, created = Favorite.objects.get_or_create(user=user, pizza=pizza)

    if not created:
        favorite.delete()
        return Response({"status": "removed"})

    return Response({"status": "added"})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def favorite_list(request):
    user = request.user
    favorites = Favorite.objects.filter(user=user)
    pizzas = [fav.pizza for fav in favorites]
    serializer = PizzaSerializer(pizzas, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_reservation_mail(request):
    reservation_id = request.data.get("reservation_id")
    status = request.data.get("status")
    reservation = Reservation.objects.get(id=reservation_id)
    print("EMAIL:", reservation.email)
    recipient_email = reservation.email

    try:
        connection = get_connection(
            backend='django.core.mail.backends.smtp.EmailBackend',
            host=settings.EMAIL_HOST,
            port=settings.EMAIL_PORT,
            username=settings.EMAIL_HOST_USER,
            password=settings.EMAIL_HOST_PASSWORD,
            use_tls=True,
            timeout=30,
            fail_silently=False,
        )

        connection.ssl_context = ssl._create_unverified_context()

        if status == "Approved":
            subject = "Reservation Confirmed - PACrust Pizza"
            html_message = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #ffffff;
                        border-radius: 10px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }}
                    .header {{
                        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }}
                    .header h1 {{
                        margin: 0;
                        font-size: 28px;
                    }}
                    .status-badge {{
                        background-color: #2e7d32;
                        color: white;
                        padding: 10px 20px;
                        border-radius: 25px;
                        display: inline-block;
                        margin-top: 10px;
                        font-weight: bold;
                        font-size: 16px;
                    }}
                    .content {{
                        padding: 30px;
                    }}
                    .greeting {{
                        font-size: 18px;
                        color: #333;
                        margin-bottom: 20px;
                    }}
                    .details {{
                        background-color: #f9f9f9;
                        border-left: 4px solid #4CAF50;
                        padding: 20px;
                        margin: 20px 0;
                    }}
                    .detail-item {{
                        display: flex;
                        align-items: center;
                        margin: 12px 0;
                        font-size: 16px;
                    }}
                    .detail-icon {{
                        font-size: 24px;
                        margin-right: 15px;
                        min-width: 30px;
                    }}
                    .detail-label {{
                        font-weight: bold;
                        color: #555;
                        margin-right: 8px;
                    }}
                    .detail-value {{
                        color: #333;
                    }}
                    .footer {{
                        background-color: #333;
                        color: white;
                        text-align: center;
                        padding: 20px;
                        font-size: 14px;
                    }}
                    .message {{
                        color: #666;
                        line-height: 1.6;
                        margin: 20px 0;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>PACrust Pizza</h1>
                        <div class="status-badge">RESERVATION CONFIRMED</div>
                    </div>

                    <div class="content">
                        <p class="greeting">Hello {reservation.name},</p>

                        <p class="message">
                            Great news! Your reservation at <strong>PACrust</strong> has been confirmed. 
                            We're excited to serve you our delicious pizzas!
                        </p>

                        <div class="details">
                            <div class="detail-item">
                                <span class="detail-label">Date:</span>
                                <span class="detail-value">{reservation.date}</span>
                            </div>

                            <div class="detail-item">
                                <span class="detail-label">Time:</span>
                                <span class="detail-value">{reservation.from_time} - {reservation.to_time}</span>
                            </div>

                            <div class="detail-item">
                                <span class="detail-label">Party Size:</span>
                                <span class="detail-value">{reservation.people_count} {"person" if reservation.people_count == 1 else "people"}</span>
                            </div>

                            <div class="detail-item">
                                <span class="detail-label">Table:</span>
                                <span class="detail-value">#{reservation.table_id}</span>
                            </div>
                        </div>

                        <p class="message">
                            <strong>Important Notes:</strong><br>
                            • Please arrive 10 minutes before your reservation time<br>
                            • If you need to cancel or modify, contact us at least 2 hours in advance<br>
                            • We hold reservations for 15 minutes past the scheduled time
                        </p>

                        <p class="message">
                            Looking forward to welcoming you!<br>
                            <strong>The PACrust Team</strong>
                        </p>
                    </div>

                    <div class="footer">
                        <p>PACrust Pizza | Contact Us</p>
                        <p>{settings.EMAIL_HOST_USER}</p>
                    </div>
                </div>
            </body>
            </html>
            """
            plain_message = f"""
Hello {reservation.name},

YOUR RESERVATION IS CONFIRMED!

Your reservation at PACrust has been approved.

RESERVATION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date: {reservation.date}
Time: {reservation.from_time} - {reservation.to_time}
Party Size: {reservation.people_count} {"person" if reservation.people_count == 1 else "people"}
Table: #{reservation.table_id}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT NOTES:
- Please arrive 10 minutes before your reservation time
- If you need to cancel or modify, contact us at least 2 hours in advance
- We hold reservations for 15 minutes past the scheduled time

Looking forward to welcoming you!

The PACrust Team
            """
        else:  
            subject = "Reservation Update - PACrust Pizza"
            html_message = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #ffffff;
                        border-radius: 10px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }}
                    .header {{
                        background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }}
                    .header h1 {{
                        margin: 0;
                        font-size: 28px;
                    }}
                    .status-badge {{
                        background-color: #c62828;
                        color: white;
                        padding: 10px 20px;
                        border-radius: 25px;
                        display: inline-block;
                        margin-top: 10px;
                        font-weight: bold;
                        font-size: 16px;
                    }}
                    .content {{
                        padding: 30px;
                    }}
                    .greeting {{
                        font-size: 18px;
                        color: #333;
                        margin-bottom: 20px;
                    }}
                    .details {{
                        background-color: #fff3f3;
                        border-left: 4px solid #f44336;
                        padding: 20px;
                        margin: 20px 0;
                    }}
                    .detail-item {{
                        display: flex;
                        align-items: center;
                        margin: 12px 0;
                        font-size: 16px;
                    }}
                    .detail-icon {{
                        font-size: 24px;
                        margin-right: 15px;
                        min-width: 30px;
                    }}
                    .detail-label {{
                        font-weight: bold;
                        color: #555;
                        margin-right: 8px;
                    }}
                    .detail-value {{
                        color: #333;
                    }}
                    .footer {{
                        background-color: #333;
                        color: white;
                        text-align: center;
                        padding: 20px;
                        font-size: 14px;
                    }}
                    .message {{
                        color: #666;
                        line-height: 1.6;
                        margin: 20px 0;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>PACrust Pizza</h1>
                        <div class="status-badge">RESERVATION NOT APPROVED</div>
                    </div>

                    <div class="content">
                        <p class="greeting">Hello {reservation.name},</p>

                        <p class="message">
                            Unfortunately, we're unable to confirm your reservation at this time.
                        </p>

                        <div class="details">
                            <div class="detail-item">
                                <span class="detail-label">Requested Date:</span>
                                <span class="detail-value">{reservation.date}</span>
                            </div>

                            <div class="detail-item">
                                <span class="detail-label">Requested Time:</span>
                                <span class="detail-value">{reservation.from_time} - {reservation.to_time}</span>
                            </div>

                            <div class="detail-item">
                                <span class="detail-label">Party Size:</span>
                                <span class="detail-value">{reservation.people_count} {"person" if reservation.people_count == 1 else "people"}</span>
                            </div>
                        </div>

                        <p class="message">
                            <strong>What's next?</strong><br>
                            • We may be fully booked at your requested time<br>
                            • Please try booking for a different date or time<br>
                            • Contact us directly for alternative options<br>
                            • We'd love to accommodate you another time!
                        </p>

                        <p class="message">
                            We apologize for any inconvenience and hope to see you soon!<br>
                            <strong>The PACrust Team</strong>
                        </p>
                    </div>

                    <div class="footer">
                        <p>PACrust Pizza | Contact Us</p>
                        <p>{settings.EMAIL_HOST_USER}</p>
                    </div>
                </div>
            </body>
            </html>
            """
            plain_message = f"""
Hello {reservation.name},

RESERVATION NOT APPROVED

Unfortunately, we're unable to confirm your reservation at this time.

REQUESTED DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date: {reservation.date}
Time: {reservation.from_time} - {reservation.to_time}
Party Size: {reservation.people_count} {"person" if reservation.people_count == 1 else "people"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT'S NEXT?
- We may be fully booked at your requested time
- Please try booking for a different date or time
- Contact us directly for alternative options
- We'd love to accommodate you another time!

We apologize for any inconvenience and hope to see you soon!

The PACrust Team
            """

        from django.core.mail import EmailMultiAlternatives

        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.EMAIL_HOST_USER,
            to=[recipient_email],
            connection=connection,
        )
        email.attach_alternative(html_message, "text/html")
        email.send()

        print(f"Email sent to {recipient_email} - Status: {status}")
        return Response({"success": True})

    except Exception as e:
        print(f"Email error: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({"success": False, "error": str(e)}, status=500)


from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import get_user_model

User = get_user_model()
from rest_framework_simplejwt.tokens import RefreshToken

GOOGLE_CLIENT_ID = "843169508428-d5f1cskdgm7l4acah10nmdue9vm4hmfq.apps.googleusercontent.com"


@api_view(['POST'])
def google_login(request):
    token = request.data.get('token') or request.data.get('credential')

    print("Received token:", token)

    if not token:
        return Response({"error": "Token missing"}, status=400)

    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )

        email = idinfo.get('email')
        username = email.split('@')[0]

        user, created = User.objects.get_or_create(
            email=email,
            defaults={'username': username}
        )

        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'username': user.username,
                'email': user.email,
                'role': getattr(user, 'role', 'user')
            }
        })

    except Exception as e:
        print("GOOGLE ERROR:", e)
        return Response({'error': str(e)}, status=400)
