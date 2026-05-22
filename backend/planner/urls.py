from django.urls import path
from . import views

urlpatterns = [
    path('saved/',                       views.SavedTrailsView.as_view()),
    path('saved/<slug:trail_slug>/',     views.SavedTrailDetailView.as_view()),
    path('notes/<slug:trail_slug>/',     views.TripNoteView.as_view()),
    path('packing/',                     views.PackingListView.as_view()),
    path('packing/<int:pk>/',            views.PackingItemDetailView.as_view()),
]
