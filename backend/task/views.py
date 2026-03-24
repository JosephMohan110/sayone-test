from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('-created_at')
    serializer_class = TaskSerializer

    # Custom endpoint to mark task as complete
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        task = self.get_object()
        task.completed = True
        task.save()
        return Response({'status': 'completed'})

    # Optional: AI priority suggestion based on title
    @action(detail=False, methods=['post'])
    def suggest_priority(self, request):
        title = request.data.get('title', '')
        priority = 'medium'
        if 'urgent' in title.lower() or 'asap' in title.lower():
            priority = 'high'
        elif 'maybe' in title.lower() or 'later' in title.lower():
            priority = 'low'
        return Response({'priority': priority})