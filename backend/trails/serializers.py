from rest_framework import serializers
from .models import Trail, Itinerary


class ItinerarySerializer(serializers.ModelSerializer):

    class Meta:
        model  = Itinerary
        fields = ['day', 'title', 'description', 'altitude_m', 'walk_hours']


class TrailListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for the trails list page."""

    class Meta:
        model  = Trail
        fields = [
            'id', 'name', 'slug', 'region', 'difficulty',
            'duration_days', 'max_altitude_m', 'best_seasons',
        ]


class TrailDetailSerializer(serializers.ModelSerializer):
    """Full serializer for a single trail page — includes itinerary."""

    itinerary = ItinerarySerializer(many=True, read_only=True)

    class Meta:
        model  = Trail
        fields = [
            'id', 'name', 'slug', 'region', 'description', 'highlights',
            'distance_km', 'elevation_gain_m', 'max_altitude_m',
            'duration_days', 'difficulty', 'trek_style',
            'start_point', 'end_point', 'best_seasons',
            'permits_required', 'guide_required',
            'itinerary',
        ]
