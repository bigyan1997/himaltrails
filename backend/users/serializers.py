from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    email        = serializers.EmailField(required=True)
    password1    = serializers.CharField(write_only=True, min_length=8)
    password2    = serializers.CharField(write_only=True, min_length=8)
    display_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    nationality  = serializers.CharField(max_length=100, required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate(self, data):
        if data['password1'] != data['password2']:
            raise serializers.ValidationError({'password2': "Passwords do not match."})
        return data

    def save(self, request):
        user = User.objects.create_user(
            email        = self.validated_data['email'],
            password     = self.validated_data['password1'],
            display_name = self.validated_data.get('display_name', ''),
            nationality  = self.validated_data.get('nationality', ''),
        )
        return user

    def get_cleaned_data(self):
        return self.validated_data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model        = User
        fields       = ['id', 'email', 'display_name', 'nationality', 'joined_at']
        read_only_fields = ['id', 'email', 'joined_at']
