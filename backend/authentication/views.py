from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer

from django.contrib.auth.models import Permission


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = TokenObtainPairSerializer


class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = TokenRefreshSerializer


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'is_active': user.is_active,
        })


class UserPermissionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_perms = user.user_permissions.values_list('codename', flat=True)
        group_perms = user.groups.values_list('permissions__codename', flat=True)
        all_perms = sorted(set(user_perms).union(group_perms))
        return Response({'permissions': all_perms})


class UserGroupsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_groups = request.user.groups.values_list('name', flat=True)
        return Response({'groups': list(user_groups)})


class AllPermissionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        all_permissions = Permission.objects.all().values(
            'id', 'codename', 'name', 'content_type__app_label', 'content_type__model'
        )
        return Response({'all_permissions': list(all_permissions)})


class FullUserAccessView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_perms = user.user_permissions.values_list('codename', flat=True)
        group_perms = user.groups.values_list('permissions__codename', flat=True)
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'is_active': user.is_active,
                'groups': list(user.groups.values_list('name', flat=True)),
            },
            'permissions': sorted(set(user_perms).union(group_perms)),
        })
