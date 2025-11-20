from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer

from django.contrib.auth.models import Permission, User
from rest_framework import status
from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.serializers import ModelSerializer
from .serializers import UserCreateSerializer, UserUpdateSerializer


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active']


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

class UserCreateView(CreateAPIView):
    serializer_class = UserCreateSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'groups': [g.name for g in user.groups.all()],
                'permissions': [p.codename for p in user.user_permissions.all()]
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListView(ListAPIView):
    queryset = User.objects.filter(is_active=True).order_by('first_name', 'last_name')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class UserDetailView(RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserSerializer
        return UserUpdateSerializer

    def get_object(self):
        user_id = self.kwargs.get('user_id')
        return User.objects.get(id=user_id)

    def destroy(self, request, *args, **kwargs):
        """Soft delete - marca como inativo"""
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'message': 'Usuário desativado com sucesso'}, status=status.HTTP_200_OK)

