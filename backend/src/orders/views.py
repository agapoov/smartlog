from .serializers import OrderSerializer, CargoSerializer, OrderCreateSerializer
from src.common import Base_APIVIEW, EnumBaseView
from .models import Cargo, Order, CargoTypeRools


class Order_APIVIEW(Base_APIVIEW):
    model = Order
    create_serializer = OrderCreateSerializer
    base_serializer = OrderSerializer
    paginate = True

class Cargo_APIVIEW(Base_APIVIEW):
    model = Cargo
    create_serializer = CargoSerializer
    base_serializer = CargoSerializer
    paginate = True

class CargoType_APIVIEW(EnumBaseView):
    """
    GET /api/cargo_type_rools/
    """
    model = CargoTypeRools