from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    due_date = serializers.DateField(required=False, allow_null=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'category', 'due_date',
            'priority', 'completed', 'created_at', 'user', 'order', 'image_url'
        ]
        read_only_fields = ('id', 'user', 'created_at')

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Title cannot be empty')
        return value.strip()

    def validate_category(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Category cannot be empty')
        if len(value) > 20:
            raise serializers.ValidationError('Category must be 20 characters or fewer')
        return value.strip()

    def validate_priority(self, value):
        valid_priorities = ['low', 'medium', 'high']
        if value not in valid_priorities:
            raise serializers.ValidationError(f'Invalid priority. Choose from: {", ".join(valid_priorities)}')
        return value