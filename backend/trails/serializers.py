from rest_framework import serializers
from .models import Trail, Itinerary, Permit, Teahouse, Guide


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
    avg_rating    = serializers.SerializerMethodField()
    review_count  = serializers.SerializerMethodField()

    class Meta:
        model  = Trail
        fields = [
            'id', 'name', 'slug', 'region', 'difficulty',
            'duration_days', 'max_altitude_m', 'best_seasons',
            'trek_style', 'start_point', 'end_point',
            'latitude', 'longitude',
            'cover_image_url',
            'condition_status', 'condition_notes', 'condition_updated',
            'avg_rating', 'review_count',
        ]

    def get_avg_rating(self, obj):
        val = getattr(obj, '_avg_rating', None)
        if val is not None:
            return round(float(val), 1)
        reviews = list(obj.reviews.all())
        if not reviews:
            return None
        return round(sum(r.rating for r in reviews) / len(reviews), 1)

    def get_review_count(self, obj):
        val = getattr(obj, '_review_count', None)
        if val is not None:
            return val
        return obj.reviews.count()


class TrailDetailSerializer(serializers.ModelSerializer):
    """Full serializer for a single trail page."""

    itinerary    = ItinerarySerializer(many=True, read_only=True)
    permits      = PermitSerializer(many=True, read_only=True)
    teahouses    = TeahouseSerializer(many=True, read_only=True)
    avg_rating   = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model  = Trail
        fields = [
            'id', 'name', 'slug', 'region', 'description', 'highlights',
            'distance_km', 'elevation_gain_m', 'max_altitude_m',
            'duration_days', 'difficulty', 'trek_style',
            'start_point', 'end_point', 'best_seasons',
            'permits_required', 'guide_required',
            'latitude', 'longitude',
            'cover_image_url',
            'condition_status', 'condition_notes', 'condition_updated',
            'avg_rating', 'review_count',
            'itinerary', 'permits', 'teahouses',
        ]

    def get_avg_rating(self, obj):
        val = getattr(obj, '_avg_rating', None)
        if val is not None:
            return round(float(val), 1)
        reviews = list(obj.reviews.all())
        if not reviews:
            return None
        return round(sum(r.rating for r in reviews) / len(reviews), 1)

    def get_review_count(self, obj):
        val = getattr(obj, '_review_count', None)
        if val is not None:
            return val
        return obj.reviews.count()


class GuideSerializer(serializers.ModelSerializer):
    specialties_list = serializers.SerializerMethodField()
    languages_list   = serializers.SerializerMethodField()
    trail_slugs      = serializers.SerializerMethodField()

    class Meta:
        model  = Guide
        fields = [
            'id', 'name', 'license_number', 'experience_years',
            'specialties', 'specialties_list',
            'languages', 'languages_list',
            'trail_slugs',
            'price_per_day_usd', 'contact_phone', 'contact_email',
            'photo_url', 'bio', 'rating', 'review_count', 'region',
        ]

    def get_specialties_list(self, obj):
        return [s.strip() for s in obj.specialties.split(',') if s.strip()]

    def get_languages_list(self, obj):
        return [lang.strip() for lang in obj.languages.split(',') if lang.strip()]

    def get_trail_slugs(self, obj):
        return list(obj.trails.values_list('slug', flat=True))
