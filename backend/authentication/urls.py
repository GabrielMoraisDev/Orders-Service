from django.urls import path

from authentication.views import CustomTokenObtainPairView, CustomTokenRefreshView

from authentication.views import (
    CurrentUserView,
    UserPermissionsView,
    UserGroupsView,
    AllPermissionsView,
    FullUserAccessView,
    UserCreateView,
    UserListView,
    UserDetailView
    )


urlpatterns = [

    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),

    path('users/me/', CurrentUserView.as_view(), name='current_user'),
    path('users/me/permissions/', UserPermissionsView.as_view(), name='user_permissions'),
    path('users/me/groups/', UserGroupsView.as_view(), name='user_groups'),
    path('permissions/', AllPermissionsView.as_view(), name='all_permissions'),
    path('users/me/full-access/', FullUserAccessView.as_view(), name='full_user_access'),

    # Cadastro e listagem de usuários
    path('users/create/', UserCreateView.as_view(), name='user_create'),
    path('users/', UserListView.as_view(), name='user_list'),
    path('users/<int:user_id>/', UserDetailView.as_view(), name='user_detail'),
]

# Rotas de autenticação e permissões.
