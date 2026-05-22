from django.urls import path
from .views import TrailListView, TrailDetailView

urlpatterns = [
    path('',TrailListView.as_view(),   name='trail-list'),
    path('<slug:slug>/', TrailDetailView.as_view(), name='trail-detail'),
]
