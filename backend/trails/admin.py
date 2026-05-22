from django.contrib import admin
from .models import Trail, Itinerary


class ItineraryInline(admin.TabularInline):
    """Shows itinerary days directly inside the trail edit page."""
    model   = Itinerary
    extra   = 1
    ordering = ['day']


@admin.register(Trail)
class TrailAdmin(admin.ModelAdmin):
    list_display  = ['name', 'region', 'difficulty', 'duration_days', 'max_altitude_m', 'is_published']
    list_filter   = ['difficulty', 'region', 'is_published', 'guide_required']
    search_fields = ['name', 'region']
    prepopulated_fields = {'slug': ('name',)}
    inlines       = [ItineraryInline]


@admin.register(Itinerary)
class ItineraryAdmin(admin.ModelAdmin):
    list_display = ['trail', 'day', 'title', 'altitude_m', 'walk_hours']
    ordering     = ['trail', 'day']
