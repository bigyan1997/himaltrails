from rest_framework import generics
from .models import Trail
from .serializers import TrailListSerializer, TrailDetailSerializer


class TrailListView(generics.ListAPIView):
    """Returns all published trails."""
    serializer_class = TrailListSerializer

    def get_queryset(self):
        queryset = Trail.objects.filter(is_published=True)

        # Optional filters from query params
        # e.g. /api/trails/?region=Everest&difficulty=hard
        region     = self.request.query_params.get('region')
        difficulty = self.request.query_params.get('difficulty')

        if region:
            queryset = queryset.filter(region__icontains=region)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)

        return queryset


class TrailDetailView(generics.RetrieveAPIView):
    """Returns a single trail by its slug."""
    serializer_class   = TrailDetailSerializer
    queryset           = Trail.objects.filter(is_published=True)
    lookup_field       = 'slug'
