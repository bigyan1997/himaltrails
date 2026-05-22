from django.db import models


class Trail(models.Model):

    DIFFICULTY_CHOICES = [
        ('easy',     'Easy'),
        ('moderate', 'Moderate'),
        ('hard',     'Hard'),
        ('expert',   'Expert'),
    ]

    TREK_STYLE_CHOICES = [
        ('teahouse', 'Tea House'),
        ('camping',  'Camping'),
        ('luxury',   'Luxury Lodge'),
    ]

    # ─── Basic Info ──────────────────────────────────────────────
    name         = models.CharField(max_length=200)
    slug         = models.SlugField(unique=True)
    region       = models.CharField(max_length=100)
    description  = models.TextField()
    highlights   = models.TextField(help_text="One highlight per line")

    # ─── Stats ───────────────────────────────────────────────────
    distance_km      = models.DecimalField(max_digits=6, decimal_places=2)
    elevation_gain_m = models.IntegerField()
    max_altitude_m   = models.IntegerField()
    duration_days    = models.IntegerField()
    difficulty       = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)
    trek_style       = models.CharField(max_length=20, choices=TREK_STYLE_CHOICES, default='teahouse')

    # ─── Route ───────────────────────────────────────────────────
    start_point  = models.CharField(max_length=200, default='Kathmandu')
    end_point    = models.CharField(max_length=200, default='Kathmandu')
    best_seasons = models.CharField(max_length=200, help_text="e.g. Mar-May, Sep-Dec")

    # ─── Logistics ───────────────────────────────────────────────
    permits_required = models.BooleanField(default=True)
    guide_required   = models.BooleanField(default=False)

    # ─── Meta ────────────────────────────────────────────────────
    is_published = models.BooleanField(default=False)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Itinerary(models.Model):
    """One row per day of a trail's itinerary."""

    trail       = models.ForeignKey(Trail, on_delete=models.CASCADE, related_name='itinerary')
    day         = models.IntegerField()
    title       = models.CharField(max_length=200)
    description = models.TextField()
    altitude_m  = models.IntegerField(null=True, blank=True)
    walk_hours  = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)

    class Meta:
        ordering = ['day']

    def __str__(self):
        return f"Day {self.day} — {self.title}"