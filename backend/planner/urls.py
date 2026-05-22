from django.urls import path
from . import views

urlpatterns = [
    path('saved/',                               views.SavedTrailsView.as_view()),
    path('saved/<slug:trail_slug>/',             views.SavedTrailDetailView.as_view()),
    path('notes/<slug:trail_slug>/',             views.TripNoteView.as_view()),
    path('packing/',                             views.PackingListView.as_view()),
    path('packing/<int:pk>/',                    views.PackingItemDetailView.as_view()),
    path('reviews/<slug:trail_slug>/',           views.ReviewListView.as_view()),
    path('reviews/<slug:trail_slug>/<int:pk>/',  views.ReviewDetailView.as_view()),
    path('completed/',                           views.CompletedTrailsView.as_view()),
    path('completed/<slug:trail_slug>/',         views.CompletedTrailDetailView.as_view()),
    path('plans/',                               views.TripPlansView.as_view()),
    path('plans/<slug:trail_slug>/',             views.TripPlanDetailView.as_view()),
]
