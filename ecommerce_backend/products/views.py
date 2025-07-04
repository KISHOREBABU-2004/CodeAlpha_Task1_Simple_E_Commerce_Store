from rest_framework import generics
from .models import Product
from .serializers import ProductSerializer
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

class ProductList(generics.ListCreateAPIView):  # Handles GET/POST
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class ProductDetail(generics.RetrieveUpdateDestroyAPIView):  # Handles GET/PUT/DELETE
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

def home_view(request):
    return render(request, 'home.html')

@api_view(['POST'])
def process_order(request):
    # In a real app, you would:
    # 1. Validate payment
    # 2. Create order records
    # 3. Clear the cart
    return Response({'status': 'success'})