from rest_framework import serializers
from trails.serializers import TrailListSerializer
from .models import SavedTrail, TripNote, PackingItem


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
