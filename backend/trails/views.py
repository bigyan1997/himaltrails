from django.db.models import Avg, Count
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Trail, Guide
from .serializers import TrailListSerializer, TrailDetailSerializer, GuideSerializer


def _annotated_list_qs(queryset):
    return queryset.annotate(
        _avg_rating=Avg('reviews__rating'),
        _review_count=Count('reviews'),
    )


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

        return _annotated_list_qs(queryset)


class PopularTrailsView(generics.ListAPIView):
    """Returns top 5 trails by review count."""
    serializer_class   = TrailListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return (
            _annotated_list_qs(Trail.objects.filter(is_published=True))
            .order_by('-_review_count')[:5]
        )


class TrailDetailView(generics.RetrieveAPIView):
    """Returns a single trail by its slug."""
    serializer_class   = TrailDetailSerializer
    permission_classes = [AllowAny]
    queryset           = Trail.objects.filter(is_published=True).prefetch_related('reviews', 'itinerary', 'permits', 'teahouses')
    lookup_field       = 'slug'


class GuideListView(generics.ListAPIView):
    """Returns all active guides, optionally filtered by region."""
    serializer_class   = GuideSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs     = Guide.objects.filter(is_active=True).prefetch_related('trails')
        region = self.request.query_params.get('region')
        if region:
            qs = qs.filter(region__icontains=region)
        return qs
