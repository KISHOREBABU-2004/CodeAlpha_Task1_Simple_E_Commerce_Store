from django.urls import path
from .views import ProductList, ProductDetail
from django.conf import settings
from django.conf.urls.static import static
from .views import ProductList, ProductDetail, process_order


urlpatterns = [
    path('', ProductList.as_view(), name='product-list'),
    path('<int:pk>/', ProductDetail.as_view(), name='product-detail'),
    path('api/orders/', process_order, name='process-order'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)