from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display    = ['email', 'display_name', 'is_staff', 'joined_at']
    ordering        = ['email']
    search_fields   = ['email', 'display_name']

    fieldsets = (
        (None,           {'fields': ('email', 'password')}),
        ('Personal info',{'fields': ('display_name', 'nationality')}),
        ('Permissions',  {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )
