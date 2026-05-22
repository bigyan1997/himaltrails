from rest_framework import serializers
from trails.serializers import TrailListSerializer
from .models import SavedTrail, TripNote, PackingItem, Review, CompletedTrail, TripPlan


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
        slug  = validated_data.pop('trail_slug')
        trail = Trail.objects.get(slug=slug)
        return TripPlan.objects.create(trail=trail, **validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('trail_slug', None)
        return super().update(instance, validated_data)
