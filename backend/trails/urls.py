from django.urls import path
from .views import TrailListView, TrailDetailView, PopularTrailsView

urlpatterns = [
    path('',                TrailListView.as_view(),    name='trail-list'),
    path('popular/',        PopularTrailsView.as_view(), name='trail-popular'),
    path('<slug:slug>/',    TrailDetailView.as_view(),  name='trail-detail'),
]
