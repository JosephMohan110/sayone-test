from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    due_date = serializers.DateField(required=False, allow_null=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'category', 'due_date',
            'priority', 'completed', 'created_at', 'user'
        ]
        read_only_fields = ('id', 'user', 'created_at')

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Title cannot be empty')
        return value.strip()

    def validate_category(self, value):
        valid = [choice[0] for choice in Task.CATEGORY_CHOICES]
        if value not in valid:
            raise serializers.ValidationError(f'Invalid category. Choose from: {", ".join(valid)}')
        return value

    def validate_priority(self, value):
        valid_priorities = ['low', 'medium', 'high']
        if value not in valid_priorities:
            raise serializers.ValidationError(f'Invalid priority. Choose from: {", ".join(valid_priorities)}')
        return value