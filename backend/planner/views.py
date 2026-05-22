from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from trails.models import Trail
from .models import SavedTrail, TripNote, PackingItem
from .serializers import SavedTrailSerializer, TripNoteSerializer, PackingItemSerializer


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
