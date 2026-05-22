from rest_framework import serializers
from .models import Trail, Itinerary, Permit, Teahouse


class ItinerarySerializer(serializers.ModelSerializer):

    class Meta:
        model  = Itinerary
        fields = ['day', 'title', 'description', 'altitude_m', 'walk_hours']


class PermitSerializer(serializers.ModelSerializer):

    class Meta:
        model  = Permit
        fields = ['id', 'name', 'permit_type', 'cost_usd', 'where_to_buy', 'notes']


class TeahouseSerializer(serializers.ModelSerializer):

    class Meta:
        model  = Teahouse
        fields = [
            'id', 'name', 'location', 'altitude_m',
            'price_usd_min', 'price_usd_max',
            'has_wifi', 'has_hot_shower',
            'day_on_trail', 'notes',
        ]


class TrailListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for the trails list page."""

    class Meta:
        model  = Trail
        fields = [
            'id', 'name', 'slug', 'region', 'difficulty',
            'duration_days', 'max_altitude_m', 'best_seasons',
            'trek_style', 'start_point', 'end_point',
        ]


class TrailDetailSerializer(serializers.ModelSerializer):
    """Full serializer for a single trail page."""

    itinerary = ItinerarySerializer(many=True, read_only=True)
    permits   = PermitSerializer(many=True, read_only=True)
    teahouses = TeahouseSerializer(many=True, read_only=True)

    class Meta:
        model  = Trail
        fields = [
            'id', 'name', 'slug', 'region', 'description', 'highlights',
            'distance_km', 'elevation_gain_m', 'max_altitude_m',
            'duration_days', 'difficulty', 'trek_style',
            'start_point', 'end_point', 'best_seasons',
            'permits_required', 'guide_required',
            'itinerary', 'permits', 'teahouses',
        ]
