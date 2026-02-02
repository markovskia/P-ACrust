from rest_framework import serializers
from .models import User, Pizza, Ingredient, Promo, Order, Reservation, Sticker
from .models import Salad, Drink, Dessert, Sauce, SpecialOffer, Message, Favorite

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'username', 'email', 'address', 'phone', 'acceptPromotions', 'password', 'city', 'role']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance


class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        # fields = [
        #     "id",
        #     "table_id",
        #     "date",
        #     "from_time",
        #     "to_time",
        #     "name",
        #     "username",
        #     "people_count",
        #     "comment",
        #     "city",
        #     "approved",
        # ]
        fields = "__all__"

class StickerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sticker
        fields = ['id', 'image']


class PizzaSerializer(serializers.ModelSerializer):
    stickers = StickerSerializer(many=True, read_only=True)
    sticker_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Sticker.objects.all(),
        write_only=True,
        required=False,
        source='stickers'
    )

    class Meta:
        model = Pizza
        fields = [
            'id', 'name', 'heading', 'description', 'price',
            'image', 'availability', 'stickers', 'sticker_ids'
        ]

    def create(self, validated_data):
        stickers = validated_data.pop('stickers', [])
        pizza = Pizza.objects.create(**validated_data)
        pizza.stickers.set(stickers)
        return pizza

    def update(self, instance, validated_data):
        stickers = validated_data.pop('stickers', None)

        # 🧩 Handle stickers manually from request if FormData is used
        request = self.context.get('request')
        if request and hasattr(request, 'data'):
            sticker_ids = request.data.getlist('sticker_ids')
            if sticker_ids:
                try:
                    sticker_ids = [int(x) for x in sticker_ids]
                    instance.stickers.set(sticker_ids)
                except ValueError:
                    pass

        # Update all other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = '__all__'


class PromoSerializer(serializers.ModelSerializer):
    discountType = serializers.CharField(source='discount_type')
    discountValue = serializers.DecimalField(source='discount_value', max_digits=6, decimal_places=2)
    usageLimit = serializers.IntegerField(source='usage_limit', required=False, allow_null=True)
    noLimit = serializers.BooleanField(source='no_limit', required=False)
    startDate = serializers.DateField(source='start_date', required=False, allow_null=True)
    endDate = serializers.DateField(source='end_date', required=False, allow_null=True)

    class Meta:
        model = Promo
        fields = [
            'id', 'name', 'discountType', 'discountValue',
            'usageLimit', 'noLimit', 'startDate', 'endDate',
            'active', 'created_at'
        ]


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'


class SaladSerializer(serializers.ModelSerializer):
    class Meta:
        model = Salad
        fields = '__all__'


class DrinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Drink
        fields = '__all__'


class DessertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dessert
        fields = '__all__'


class SauceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sauce
        fields = '__all__'


class SpecialOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpecialOffer
        fields = '__all__'

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = "__all__"

class FavoriteSerializer(serializers.ModelSerializer):
    pizza = PizzaSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'pizza']