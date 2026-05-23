from datetime import date as date_type
from django.db.models import Max
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView

from trails.models import Trail
from .models import SavedTrail, TripNote, PackingItem, Review, CompletedTrail, TripPlan, ConditionReport, SafetyCheckIn, UserPermit, ItineraryPlan, ItineraryWaypoint
from .serializers import (
    SavedTrailSerializer, TripNoteSerializer, PackingItemSerializer,
    ReviewSerializer, CompletedTrailSerializer, TripPlanSerializer,
    ConditionReportSerializer, SafetyCheckInSerializer, UserPermitSerializer,
    ItineraryPlanSerializer, ItineraryWaypointSerializer,
)


class SavedTrailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = SavedTrail.objects.filter(user=request.user).select_related('trail')
        return Response(SavedTrailSerializer(qs, many=True).data)

    def post(self, request):
        slug  = request.data.get('trail_slug')
        trail = get_object_or_404(Trail, slug=slug)
        obj, created = SavedTrail.objects.get_or_create(user=request.user, trail=trail)
        return Response(SavedTrailSerializer(obj).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class SavedTrailDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, trail_slug):
        trail = get_object_or_404(Trail, slug=trail_slug)
        SavedTrail.objects.filter(user=request.user, trail=trail).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TripNoteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, trail_slug):
        trail = get_object_or_404(Trail, slug=trail_slug)
        try:
            note = TripNote.objects.get(user=request.user, trail=trail)
            return Response(TripNoteSerializer(note).data)
        except TripNote.DoesNotExist:
            return Response({'content': '', 'trail_slug': trail_slug, 'trail_name': trail.name})

    def put(self, request, trail_slug):
        trail = get_object_or_404(Trail, slug=trail_slug)
        note, _ = TripNote.objects.get_or_create(user=request.user, trail=trail)
        note.content = request.data.get('content', '')
        note.save()
        return Response(TripNoteSerializer(note).data)


class PackingListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = PackingItem.objects.filter(user=request.user)
        return Response(PackingItemSerializer(qs, many=True).data)

    def post(self, request):
        serializer = PackingItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PackingItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        item = get_object_or_404(PackingItem, pk=pk, user=request.user)
        serializer = PackingItemSerializer(item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        item = get_object_or_404(PackingItem, pk=pk, user=request.user)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Reviews ────────────────────────────────────────────────────────────────────

class ReviewListView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, trail_slug):
        trail   = get_object_or_404(Trail, slug=trail_slug)
        reviews = Review.objects.filter(trail=trail).select_related('user')
        return Response(ReviewSerializer(reviews, many=True).data)

    def post(self, request, trail_slug):
        trail = get_object_or_404(Trail, slug=trail_slug)
        existing = Review.objects.filter(user=request.user, trail=trail).first()
        if existing:
            serializer = ReviewSerializer(existing, data=request.data, partial=True)
        else:
            serializer = ReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user, trail=trail)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ReviewDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, trail_slug, pk):
        review = get_object_or_404(Review, pk=pk, user=request.user)
        review.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Completed Trails ───────────────────────────────────────────────────────────

class CompletedTrailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = CompletedTrail.objects.filter(user=request.user).select_related('trail')
        return Response(CompletedTrailSerializer(qs, many=True).data)

    def post(self, request):
        slug  = request.data.get('trail_slug')
        trail = get_object_or_404(Trail, slug=slug)

        completed_at_raw = request.data.get('completed_at')
        if not completed_at_raw:
            return Response({'error': 'completed_at is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            date_type.fromisoformat(str(completed_at_raw))
        except ValueError:
            return Response({'error': 'completed_at must be a valid date (YYYY-MM-DD)'}, status=status.HTTP_400_BAD_REQUEST)

        obj, created = CompletedTrail.objects.update_or_create(
            user=request.user, trail=trail,
            defaults={
                'completed_at': completed_at_raw,
                'notes':        request.data.get('notes', ''),
            }
        )
        return Response(CompletedTrailSerializer(obj).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class CompletedTrailDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, trail_slug):
        trail = get_object_or_404(Trail, slug=trail_slug)
        CompletedTrail.objects.filter(user=request.user, trail=trail).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Condition Reports ──────────────────────────────────────────────────────────

VALID_CONDITION_STATUSES = {'open', 'partial', 'closed', 'unknown'}

class ConditionReportListView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, trail_slug):
        trail   = get_object_or_404(Trail, slug=trail_slug)
        reports = ConditionReport.objects.filter(trail=trail).select_related('user')[:20]
        return Response(ConditionReportSerializer(reports, many=True).data)

    def post(self, request, trail_slug):
        trail      = get_object_or_404(Trail, slug=trail_slug)
        status_val = request.data.get('status', '')
        if status_val not in VALID_CONDITION_STATUSES:
            return Response({'error': 'status must be one of: open, partial, closed, unknown'}, status=status.HTTP_400_BAD_REQUEST)
        description = str(request.data.get('description', ''))[:1000]
        report = ConditionReport.objects.create(
            user=request.user, trail=trail,
            status=status_val, description=description,
        )
        return Response(ConditionReportSerializer(report).data, status=status.HTTP_201_CREATED)


# ── Trip Plans ─────────────────────────────────────────────────────────────────

class TripPlansView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = TripPlan.objects.filter(user=request.user).select_related('trail')
        return Response(TripPlanSerializer(qs, many=True).data)

    def post(self, request):
        slug  = request.data.get('trail_slug')
        trail = get_object_or_404(Trail, slug=slug)

        start_date_raw = request.data.get('start_date')
        if not start_date_raw:
            return Response({'error': 'start_date is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            date_type.fromisoformat(str(start_date_raw))
        except ValueError:
            return Response({'error': 'start_date must be a valid date (YYYY-MM-DD)'}, status=status.HTTP_400_BAD_REQUEST)

        obj, created = TripPlan.objects.update_or_create(
            user=request.user, trail=trail,
            defaults={
                'start_date': start_date_raw,
                'notes':      request.data.get('notes', ''),
            }
        )
        serializer = TripPlanSerializer(obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class TripPlanDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, trail_slug):
        trail = get_object_or_404(Trail, slug=trail_slug)
        TripPlan.objects.filter(user=request.user, trail=trail).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Safety Check-Ins ───────────────────────────────────────────────────────────

class SafetyCheckInListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = SafetyCheckIn.objects.filter(user=request.user).select_related('trail')
        return Response(SafetyCheckInSerializer(qs, many=True).data)

    def post(self, request):
        slug  = request.data.get('trail_slug')
        trail = get_object_or_404(Trail, slug=slug)
        serializer = SafetyCheckInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save(user=request.user, trail=trail)
        return Response(SafetyCheckInSerializer(obj).data, status=status.HTTP_201_CREATED)


class SafetyCheckInDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        obj = get_object_or_404(SafetyCheckIn, pk=pk, user=request.user)
        if request.data.get('checked_in'):
            from django.utils import timezone
            obj.checked_in    = True
            obj.checked_in_at = timezone.now()
            obj.save()
        return Response(SafetyCheckInSerializer(obj).data)

    def delete(self, request, pk):
        obj = get_object_or_404(SafetyCheckIn, pk=pk, user=request.user)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── User Permits ───────────────────────────────────────────────────────────────

class UserPermitListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = UserPermit.objects.filter(user=request.user).select_related('trail')
        return Response(UserPermitSerializer(qs, many=True).data)

    def post(self, request):
        slug  = request.data.get('trail_slug')
        trail = get_object_or_404(Trail, slug=slug) if slug else None
        serializer = UserPermitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save(user=request.user, trail=trail)
        return Response(UserPermitSerializer(obj).data, status=status.HTTP_201_CREATED)


class UserPermitDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        obj = get_object_or_404(UserPermit, pk=pk, user=request.user)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Itinerary Planner ──────────────────────────────────────────────────────────

class ItineraryPlanListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = ItineraryPlan.objects.filter(user=request.user).prefetch_related('waypoints')
        return Response(ItineraryPlanSerializer(qs, many=True).data)

    def post(self, request):
        name = request.data.get('name', '').strip()
        if not name:
            return Response({'error': 'name is required'}, status=status.HTTP_400_BAD_REQUEST)
        trail_slug = request.data.get('trail_slug')
        trail = get_object_or_404(Trail, slug=trail_slug) if trail_slug else None
        plan = ItineraryPlan.objects.create(user=request.user, name=name, trail=trail)
        return Response(ItineraryPlanSerializer(plan).data, status=status.HTTP_201_CREATED)


class ItineraryPlanDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        plan = get_object_or_404(ItineraryPlan, pk=pk, user=request.user)
        if 'name' in request.data:
            plan.name = request.data['name']
            plan.save()
        return Response(ItineraryPlanSerializer(plan).data)

    def delete(self, request, pk):
        plan = get_object_or_404(ItineraryPlan, pk=pk, user=request.user)
        plan.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ItineraryWaypointListView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, plan_pk):
        plan = get_object_or_404(ItineraryPlan, pk=plan_pk, user=request.user)
        serializer = ItineraryWaypointSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        day_num = request.data.get('day_number', 1)
        max_order = plan.waypoints.filter(day_number=day_num).aggregate(m=Max('order'))['m'] or 0
        wp = serializer.save(plan=plan, order=max_order + 1)
        return Response(ItineraryWaypointSerializer(wp).data, status=status.HTTP_201_CREATED)


class ItineraryWaypointDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        wp = get_object_or_404(ItineraryWaypoint, pk=pk, plan__user=request.user)
        serializer = ItineraryWaypointSerializer(wp, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        wp = get_object_or_404(ItineraryWaypoint, pk=pk, plan__user=request.user)
        wp.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
