from django.contrib import admin
from django.urls import path, include
from users.views import GoogleLoginView
from trails.views import GuideListView

urlpatterns = [
    path('admin/',                    admin.site.urls),
    path('api/trails/',               include('trails.urls')),
    path('api/guides/',               GuideListView.as_view()),
    path('api/auth/',                 include('dj_rest_auth.urls')),
    path('api/auth/registration/',    include('dj_rest_auth.registration.urls')),
    path('api/auth/social/',          include('allauth.socialaccount.urls')),
    path('api/auth/google/',          GoogleLoginView.as_view()),
    path('api/planner/',              include('planner.urls')),
]
