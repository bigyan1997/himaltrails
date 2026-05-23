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
    path('conditions/<slug:trail_slug>/',        views.ConditionReportListView.as_view()),
    path('safety/',                              views.SafetyCheckInListView.as_view()),
    path('safety/<int:pk>/',                     views.SafetyCheckInDetailView.as_view()),
    path('permits/',                             views.UserPermitListView.as_view()),
    path('permits/<int:pk>/',                    views.UserPermitDetailView.as_view()),
]
