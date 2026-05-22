import requests as http_requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        access_token = request.data.get('access_token')
        if not access_token:
            return Response({'error': 'access_token required'}, status=400)

        r = http_requests.get(
            'https://www.googleapis.com/oauth2/v1/userinfo',
            headers={'Authorization': f'Bearer {access_token}'},
            timeout=5,
        )
        if r.status_code != 200:
            return Response({'error': 'Invalid Google token'}, status=401)

        info = r.json()
        email = info.get('email', '').lower()
        if not email:
            return Response({'error': 'No email returned by Google'}, status=401)

        user, _ = User.objects.get_or_create(
            email=email,
            defaults={'display_name': info.get('name', '')},
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
