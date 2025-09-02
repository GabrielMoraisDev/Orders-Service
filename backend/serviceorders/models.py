from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class WorkOrder(models.Model):
    """
    Modelo que representa uma Ordem de Serviço no sistema.
    """

    PRIORITY_CHOICES = [
        ('low', 'Baixa'),
        ('midium', 'Média'),
        ('high', 'Alta'),
    ]

    STATUS_CHOICES = [
        ('open', 'Aberta'),
        ('closed', 'Fechada'),
        ('unresolved', 'Não Resolvida'),
    ]

    title = models.CharField(max_length=255, verbose_name='Título')
    description = models.TextField(verbose_name='Descrição')
    resolved = models.TextField(
        null=True,
        blank=True,
        verbose_name='Descrição da resolução',
    )
    start_date = models.DateField(verbose_name='Data de início')
    predicted_date = models.DateField(verbose_name='Data Prevista')
    completion_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='Data de conclusão'
    )
    days_delay = models.IntegerField(
        default=0,
        verbose_name='Dias de atraso',
        help_text='Número de dias de atraso (calculado automaticamente).',
    )
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='medium',
        verbose_name='Prioridade',
    )
    from_user = models.ForeignKey(
        User,
        related_name='workorders_created',
        on_delete=models.CASCADE,
        verbose_name='Usuário solicitante',
    )
    responsible = models.ForeignKey(
        User,
        related_name='workorders_responsible',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Responsável',
    )
    rate = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='Avaliação',
        help_text='Avaliação de 1 a 5 dada à ordem de serviço.',
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Criado em',
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Atualizado em',
    )

    class Meta:
        verbose_name = 'Ordem de Serviço'
        verbose_name_plural = 'Ordens de Serviço'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} ({self.get_status_display()})'
    
    @property
    def calculate_days_delay(self) -> int:
        """
        Calcula os dias de atraso com base na data prevista e na conclusão.
        Retorna 0 se não houver atraso.
        """
        if self.completion_date and self.predicted_date:
            delay = (self.completion_date - self.predicted_date).days
            return max(delay, 0)
        return 0
    
    def save(self, *args, **kwargs):
        """Sobrescreve o save para atualizar automaticamente os dias de atraso."""
        self.days_delay = self.calculate_days_delay
        super().save(*args, **kwargs)
