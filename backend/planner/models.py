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
