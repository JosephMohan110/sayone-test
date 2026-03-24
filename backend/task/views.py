import logging
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User
from .models import Task
from .serializers import TaskSerializer

logger = logging.getLogger(__name__)

class TaskViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TaskSerializer

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as exc:
            logger.exception('Task creation failed')
            return Response(
                {'error': str(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except Exception as exc:
            logger.exception('Task update failed')
            return Response(
                {'error': str(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        try:
            task = self.get_object()
            task.completed = True
            task.save()
            serializer = self.get_serializer(task)
            return Response(serializer.data)
        except Exception as exc:
            logger.exception('Task completion failed')
            return Response(
                {'error': str(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def suggest_priority(self, request):
        title = request.data.get('title', '')
        priority = 'medium'
        
        # Simple AI logic for priority suggestion
        high_priority_keywords = ['urgent', 'asap', 'critical', 'important', 'emergency', 'deadline']
        low_priority_keywords = ['maybe', 'later', 'someday', 'optional', 'if possible']
        
        title_lower = title.lower()
        
        if any(keyword in title_lower for keyword in high_priority_keywords):
            priority = 'high'
        elif any(keyword in title_lower for keyword in low_priority_keywords):
            priority = 'low'
        
        return Response({'priority': priority})