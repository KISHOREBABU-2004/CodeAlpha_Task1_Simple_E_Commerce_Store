from django.contrib import admin
from django.urls import path, include
from products.views import home_view  # Add this import
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', home_view, name='home'),  # Add this line
    path('admin/', admin.site.urls),
    path('api/products/', include('products.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)