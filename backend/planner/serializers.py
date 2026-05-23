from rest_framework import serializers
from trails.serializers import TrailListSerializer
from .models import SavedTrail, TripNote, PackingItem, Review, CompletedTrail, TripPlan, ConditionReport, SafetyCheckIn, UserPermit, ItineraryPlan, ItineraryWaypoint


class SavedTrailSerializer(serializers.ModelSerializer):
    trail = TrailListSerializer(read_only=True)

    class Meta:
        model  = SavedTrail
        fields = ['id', 'trail', 'saved_at']


class TripNoteSerializer(serializers.ModelSerializer):
    trail_slug = serializers.CharField(source='trail.slug', read_only=True)
    trail_name = serializers.CharField(source='trail.name', read_only=True)

    class Meta:
        model  = TripNote
        fields = ['id', 'trail_slug', 'trail_name', 'content', 'updated_at']


class PackingItemSerializer(serializers.ModelSerializer):
    class Meta:
        model  = PackingItem
        fields = ['id', 'name', 'checked', 'category', 'created_at']


class ReviewSerializer(serializers.ModelSerializer):
    author      = serializers.CharField(source='user.display_name', read_only=True)
    author_init = serializers.SerializerMethodField()
    body        = serializers.CharField(allow_blank=True, max_length=2000, required=False)

    class Meta:
        model  = Review
        fields = ['id', 'author', 'author_init', 'rating', 'body', 'created_at']

    def get_author_init(self, obj):
        name = obj.user.display_name or obj.user.email
        return name[0].upper()


class CompletedTrailSerializer(serializers.ModelSerializer):
    trail = TrailListSerializer(read_only=True)

    class Meta:
        model  = CompletedTrail
        fields = ['id', 'trail', 'completed_at', 'notes', 'created_at']


class ConditionReportSerializer(serializers.ModelSerializer):
    author      = serializers.CharField(source='user.display_name', read_only=True)
    author_init = serializers.SerializerMethodField()
    description = serializers.CharField(allow_blank=True, max_length=1000, required=False)

    class Meta:
        model  = ConditionReport
        fields = ['id', 'author', 'author_init', 'status', 'description', 'reported_at']

    def get_author_init(self, obj):
        name = obj.user.display_name or obj.user.email
        return name[0].upper()


class TripPlanSerializer(serializers.ModelSerializer):
    trail      = TrailListSerializer(read_only=True)
    trail_slug = serializers.CharField(write_only=True)
    end_date   = serializers.SerializerMethodField()

    class Meta:
        model  = TripPlan
        fields = ['id', 'trail', 'trail_slug', 'start_date', 'end_date', 'notes', 'updated_at']

    def get_end_date(self, obj):
        from datetime import timedelta, date
        start = obj.start_date if isinstance(obj.start_date, date) else date.fromisoformat(obj.start_date)
        return (start + timedelta(days=obj.trail.duration_days)).isoformat()

    def create(self, validated_data):
        from trails.models import Trail
        from django.shortcuts import get_object_or_404
        slug  = validated_data.pop('trail_slug')
        trail = get_object_or_404(Trail, slug=slug)
        return TripPlan.objects.create(trail=trail, **validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('trail_slug', None)
        return super().update(instance, validated_data)


class SafetyCheckInSerializer(serializers.ModelSerializer):
    trail_name = serializers.CharField(source='trail.name', read_only=True)
    trail_slug = serializers.CharField(source='trail.slug', read_only=True)
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model  = SafetyCheckIn
        fields = [
            'id', 'trail_name', 'trail_slug',
            'emergency_name', 'emergency_email', 'emergency_phone',
            'start_date', 'expected_return',
            'checked_in', 'checked_in_at', 'notes',
            'is_overdue', 'created_at',
        ]

    def get_is_overdue(self, obj):
        from datetime import date
        return not obj.checked_in and obj.expected_return < date.today()


class UserPermitSerializer(serializers.ModelSerializer):
    trail_name = serializers.CharField(source='trail.name', read_only=True)
    trail_slug = serializers.CharField(source='trail.slug', read_only=True)
    is_expired = serializers.SerializerMethodField()

    class Meta:
        model  = UserPermit
        fields = [
            'id', 'trail_name', 'trail_slug',
            'permit_name', 'permit_number', 'permit_type',
            'issued_date', 'expiry_date', 'notes',
            'is_expired', 'created_at',
        ]

    def get_is_expired(self, obj):
        from datetime import date
        return obj.expiry_date < date.today()


class ItineraryWaypointSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ItineraryWaypoint
        fields = ['id', 'day_number', 'order', 'name', 'latitude', 'longitude', 'altitude_m', 'waypoint_type', 'notes', 'created_at']


class ItineraryPlanSerializer(serializers.ModelSerializer):
    waypoints      = ItineraryWaypointSerializer(many=True, read_only=True)
    trail_name     = serializers.SerializerMethodField()
    trail_slug     = serializers.SerializerMethodField()
    trail_duration = serializers.SerializerMethodField()

    class Meta:
        model  = ItineraryPlan
        fields = ['id', 'name', 'trail_name', 'trail_slug', 'trail_duration', 'waypoints', 'created_at', 'updated_at']

    def get_trail_name(self, obj):     return obj.trail.name          if obj.trail else None
    def get_trail_slug(self, obj):     return obj.trail.slug          if obj.trail else None
    def get_trail_duration(self, obj): return obj.trail.duration_days if obj.trail else None
