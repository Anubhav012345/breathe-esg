from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Organisation

class OrganisationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organisation
        fields = ['id', 'name', 'slug']

class UserSerializer(serializers.ModelSerializer):
    organisation = OrganisationSerializer(read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'organisation']

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    organisation_name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'organisation_name']

    def create(self, validated_data):
        org_name = validated_data.pop('organisation_name')
        slug = org_name.lower().replace(' ', '-')
        org, _ = Organisation.objects.get_or_create(name=org_name, defaults={'slug': slug})
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', 'analyst'),
            organisation=org,
        )
        return user