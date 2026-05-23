from django.conf import settings
from django.db import models


class SavedTrail(models.Model):
    user     = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_trails')
    trail    = models.ForeignKey('trails.Trail', on_delete=models.CASCADE, related_name='saved_by')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'trail']
        ordering = ['-saved_at']

    def __str__(self):
        return f'{self.user.email} → {self.trail.name}'


class TripNote(models.Model):
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='trip_notes')
    trail      = models.ForeignKey('trails.Trail', on_delete=models.CASCADE, related_name='trip_notes')
    content    = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'trail']

    def __str__(self):
        return f'{self.user.email} note on {self.trail.name}'


class PackingItem(models.Model):
    CATEGORIES = [
        ('clothing',   'Clothing'),
        ('gear',       'Gear'),
        ('documents',  'Documents'),
        ('medical',    'Medical'),
        ('food',       'Food & Water'),
        ('other',      'Other'),
    ]
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='packing_items')
    name       = models.CharField(max_length=200)
    checked    = models.BooleanField(default=False)
    category   = models.CharField(max_length=20, choices=CATEGORIES, default='other')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['category', 'created_at']

    def __str__(self):
        return f'{self.user.email}: {self.name}'


class Review(models.Model):
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    trail      = models.ForeignKey('trails.Trail', on_delete=models.CASCADE, related_name='reviews')
    rating     = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    body       = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'trail']
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} rated {self.trail.name} {self.rating}★'


class CompletedTrail(models.Model):
    user         = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='completed_trails')
    trail        = models.ForeignKey('trails.Trail', on_delete=models.CASCADE, related_name='completed_by')
    completed_at = models.DateField()
    notes        = models.TextField(blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'trail']
        ordering = ['-completed_at']

    def __str__(self):
        return f'{self.user.email} completed {self.trail.name}'


class ConditionReport(models.Model):
    STATUS_CHOICES = [
        ('open',    'Open'),
        ('partial', 'Partial restrictions'),
        ('closed',  'Closed'),
        ('unknown', 'Unknown'),
    ]
    user        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='condition_reports')
    trail       = models.ForeignKey('trails.Trail', on_delete=models.CASCADE, related_name='condition_reports')
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES)
    description = models.TextField(blank=True, max_length=1000)
    reported_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-reported_at']

    def __str__(self):
        return f'{self.user.email} reported {self.trail.name}: {self.status}'


class TripPlan(models.Model):
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='trip_plans')
    trail      = models.ForeignKey('trails.Trail', on_delete=models.CASCADE, related_name='trip_plans')
    start_date = models.DateField()
    notes      = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'trail']
        ordering = ['start_date']

    def __str__(self):
        return f'{self.user.email} plans {self.trail.name} from {self.start_date}'


class SafetyCheckIn(models.Model):
    user             = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='safety_checkins')
    trail            = models.ForeignKey('trails.Trail', on_delete=models.CASCADE, related_name='safety_checkins')
    emergency_name   = models.CharField(max_length=200)
    emergency_email  = models.EmailField()
    emergency_phone  = models.CharField(max_length=30, blank=True)
    start_date       = models.DateField()
    expected_return  = models.DateField()
    checked_in       = models.BooleanField(default=False)
    checked_in_at    = models.DateTimeField(null=True, blank=True)
    notes            = models.TextField(blank=True)
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} → {self.trail.name} due {self.expected_return}'


class UserPermit(models.Model):
    user          = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_permits')
    trail         = models.ForeignKey('trails.Trail', on_delete=models.CASCADE, related_name='user_permits', null=True, blank=True)
    permit_name   = models.CharField(max_length=200)
    permit_number = models.CharField(max_length=100, blank=True)
    permit_type   = models.CharField(max_length=50)
    issued_date   = models.DateField()
    expiry_date   = models.DateField()
    notes         = models.TextField(blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-issued_date']

    def __str__(self):
        return f'{self.user.email}: {self.permit_name}'
