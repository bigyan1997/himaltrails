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

    # ─── Coordinates (for map + weather) ─────────────────────────
    latitude     = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude    = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # ─── Media ───────────────────────────────────────────────────
    cover_image_url = models.URLField(max_length=600, blank=True)

    # ─── Trail condition ─────────────────────────────────────────
    CONDITION_CHOICES = [
        ('open',    'Open'),
        ('partial', 'Partial restrictions'),
        ('closed',  'Closed'),
        ('unknown', 'Unknown'),
    ]
    condition_status = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='open')
    condition_notes  = models.TextField(blank=True)
    condition_updated = models.DateField(null=True, blank=True)

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


class Permit(models.Model):

    PERMIT_TYPE_CHOICES = [
        ('tims',          'TIMS Card'),
        ('national_park', 'National Park Entry'),
        ('conservation',  'Conservation Area Permit'),
        ('restricted',    'Restricted Area Permit'),
        ('municipal',     'Municipality / Local Entry'),
    ]

    trail        = models.ForeignKey(Trail, on_delete=models.CASCADE, related_name='permits')
    name         = models.CharField(max_length=200)
    permit_type  = models.CharField(max_length=30, choices=PERMIT_TYPE_CHOICES)
    cost_usd     = models.DecimalField(max_digits=8, decimal_places=2)
    where_to_buy = models.CharField(max_length=400)
    notes        = models.TextField(blank=True)

    class Meta:
        ordering = ['cost_usd']

    def __str__(self):
        return f"{self.name} — {self.trail.name}"


class Teahouse(models.Model):

    trail          = models.ForeignKey(Trail, on_delete=models.CASCADE, related_name='teahouses')
    name           = models.CharField(max_length=200)
    location       = models.CharField(max_length=200)
    altitude_m     = models.IntegerField(null=True, blank=True)
    price_usd_min  = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    price_usd_max  = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    has_wifi       = models.BooleanField(default=False)
    has_hot_shower = models.BooleanField(default=False)
    day_on_trail   = models.IntegerField(null=True, blank=True)
    notes          = models.TextField(blank=True)

    class Meta:
        ordering = ['altitude_m']

    def __str__(self):
        return f"{self.name} — {self.location}"


class Guide(models.Model):
    name              = models.CharField(max_length=200)
    license_number    = models.CharField(max_length=100, blank=True)
    experience_years  = models.IntegerField(default=0)
    specialties       = models.CharField(max_length=400, blank=True, help_text='comma-separated')
    languages         = models.CharField(max_length=200, blank=True)
    trails            = models.ManyToManyField(Trail, blank=True, related_name='guides')
    price_per_day_usd = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    contact_phone     = models.CharField(max_length=30, blank=True)
    contact_email     = models.EmailField(blank=True)
    photo_url         = models.URLField(max_length=500, blank=True)
    bio               = models.TextField(blank=True)
    rating            = models.DecimalField(max_digits=3, decimal_places=1, default=5.0)
    review_count      = models.IntegerField(default=0)
    region            = models.CharField(max_length=100, blank=True)
    is_active         = models.BooleanField(default=True)

    class Meta:
        ordering = ['-rating', 'name']

    def __str__(self):
        return self.name