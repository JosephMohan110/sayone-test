import re
from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=True, max_length=150)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'password2')

    def validate_username(self, value):
        candidate = value.strip()
        if len(candidate) < 1:
            raise serializers.ValidationError('Username must be at least 1 character.')

        if not re.match(r'^[A-Za-z ]+$', candidate):
            raise serializers.ValidationError('Username should contain only letters and spaces.')

        return candidate

    def validate_email(self, value):
        if not value or '@' not in value:
            raise serializers.ValidationError('Please enter a valid email address.')
        return value.lower().strip()

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class LoginSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        return token
    
    def validate(self, attrs):
        # Accept email in login field as well
        username = attrs.get('username')
        password = attrs.get('password')

        if username and '@' in username:
            try:
                user = User.objects.get(email__iexact=username)
                attrs['username'] = user.username
            except User.DoesNotExist:
                pass

        data = super().validate(attrs)
        # Add username to response
        data['username'] = self.user.username
        return data