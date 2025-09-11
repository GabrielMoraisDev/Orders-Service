from rest_framework import viewsets
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from serviceorders.models import ServiceOrder
from serviceorders.serializers import ServiceOrderSerializer


class ServiceOrderViewSet(viewsets.ModelViewSet):
    queryset = ServiceOrder.objects.select_related('from_user', 'responsible')
    serializer_class = ServiceOrderSerializer
    permission_classes = [DjangoModelPermissions]

    filterset_fields = ['status', 'priority', 'from_user', 'responsible', 'predicted_date']
    ordering_fields = ['created_at', 'updated_at', 'predicted_date', 'completion_date', 'days_delay', 'priority']
    ordering = ['-created_at']
    search_fields = ['title', 'description', 'resolved']

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """
        Fecha a ordem, define status='closed' e grava completion_date=hoje.
        """
        os_obj = self.get_object()
        if os_obj.status == 'closed':
            return Response({'detail': 'Já está fechada.'}, status=status.HTTP_400_BAD_REQUEST)
        os_obj.status = 'closed'
        os_obj.completion_date = date.today()
        os_obj.save()
        return Response(ServiceOrderSerializer(os_obj).data)

    @action(detail=True, methods=['post'])
    def rate(self, request, pk=None):
        """
        Define a avaliação (1..5). Ex: {"rate": 4}
        """
        os_obj = self.get_object()
        try:
            rate = int(request.data.get('rate'))
        except (TypeError, ValueError):
            return Response({'detail': 'rate inválido'}, status=status.HTTP_400_BAD_REQUEST)
        if not (1 <= rate <=5):
            return Response({'detail': 'rate deve estar entre 1 e 5'}, status=status.HTTP_400_BAD_REQUEST)
        os_obj.rate = rate
        os_obj.save()
        return Response(ServiceOrderSerializer(os_obj).data)

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """
        Atribui um responsável. Ex: {"responsible_id": 7}
        """
        os_obj = self.get_object()
        resp_id = request.data.get('responsible_id')
        if not resp_id:
            return Response({'datail': 'responsible_id é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(pk=resp_id)
        except User.DoesNotExist:
            return Response({'detail': 'Usuário não econtrado'}, status=status.HTTP_404_NOT_FOUND)
        os_obj.responsible = user
        os_obj.save()
        return Response(ServiceOrderSerializer(os_obj).data)
