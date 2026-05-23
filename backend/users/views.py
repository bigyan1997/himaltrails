import requests as http_requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


class AuthThrottle(AnonRateThrottle):
    rate = '10/minute'
    scope = 'auth'


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes   = [AuthThrottle]

    def post(self, request):
        access_token = request.data.get('access_token')
        if not access_token:
            return Response({'error': 'access_token required'}, status=400)

        # Verify the token and get user info in one call.
        # tokeninfo validates the token and returns the audience so we can
        # confirm it was issued for this application, not a different one.
        r = http_requests.get(
            'https://www.googleapis.com/oauth2/v1/tokeninfo',
            params={'access_token': access_token},
            timeout=5,
        )
        if r.status_code != 200:
            return Response({'error': 'Invalid Google token'}, status=401)

        info = r.json()

        expected_client_id = settings.GOOGLE_CLIENT_ID
        if expected_client_id and info.get('audience') != expected_client_id:
            return Response({'error': 'Token was not issued for this application'}, status=401)

        if not info.get('verified_email'):
            return Response({'error': 'Google account email is not verified'}, status=401)

        email = info.get('email', '').lower()
        if not email:
            return Response({'error': 'No email returned by Google'}, status=401)

        # Fetch display name via userinfo (tokeninfo doesn't return name)
        ui = http_requests.get(
            'https://www.googleapis.com/oauth2/v1/userinfo',
            headers={'Authorization': f'Bearer {access_token}'},
            timeout=5,
        )
        display_name = ui.json().get('name', '') if ui.status_code == 200 else ''

        user, _ = User.objects.get_or_create(
            email=email,
            defaults={'display_name': display_name},
        )

        refresh = RefreshToken.for_user(user)
        return Response({
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id':           user.id,
                'email':        user.email,
                'display_name': user.display_name,
                'nationality':  user.nationality,
            },
        })
