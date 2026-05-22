from django.db.models import Count
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Trail
from .serializers import TrailListSerializer, TrailDetailSerializer


class TrailListView(generics.ListAPIView):
    """Returns all published trails."""
    serializer_class   = TrailListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Trail.objects.filter(is_published=True)

        region     = self.request.query_params.get('region')
        difficulty = self.request.query_params.get('difficulty')

        if region:
            queryset = queryset.filter(region__icontains=region)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)

        return queryset


class PopularTrailsView(generics.ListAPIView):
    """Returns top 5 trails by review count."""
    serializer_class   = TrailListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return (
            Trail.objects
            .filter(is_published=True)
            .annotate(num_reviews=Count('reviews'))
            .order_by('-num_reviews')[:5]
        )


class TrailDetailView(generics.RetrieveAPIView):
    """Returns a single trail by its slug."""
    serializer_class   = TrailDetailSerializer
    permission_classes = [AllowAny]
    queryset           = Trail.objects.filter(is_published=True)
    lookup_field       = 'slug'
