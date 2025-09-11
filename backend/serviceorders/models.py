from datetime import date

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Q, F


class ServiceOrder(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Baixa'),
        ('medium', 'Média'),
        ('high', 'Alta'),
    ]
    STATUS_CHOICES = [
        ('open', 'Aberta'),
        ('closed', 'Fechada'),
        ('unresolved', 'Não Resolvida'),
    ]

    title = models.CharField(max_length=255, verbose_name='Título')
    description = models.TextField(verbose_name='Descrição')
    resolved = models.TextField(null=True, blank=True, verbose_name='Descrição da resolução')
    start_date = models.DateField(verbose_name='Data de início')
    predicted_date = models.DateField(verbose_name='Data prevista')
    completion_date = models.DateField(null=True, blank=True, verbose_name='Data de conclusão')

    # evita negativos por definição
    days_delay = models.PositiveIntegerField(
        default=0,
        verbose_name='Dias de atraso',
        help_text='Número de dias de atraso (calculado automaticamente).',
    )

    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium', verbose_name='Prioridade')
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='open', verbose_name='Status')

    from_user = models.ForeignKey(
        User, related_name='services_created', on_delete=models.CASCADE, verbose_name='Usuário solicitante'
    )
    responsible = models.ForeignKey(
        User, related_name='services_responsible', on_delete=models.SET_NULL,
        null=True, blank=True, verbose_name='Responsável'
    )
    rate = models.PositiveSmallIntegerField(
        null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='Avaliação', help_text='Avaliação de 1 a 5 dada à ordem de serviço.'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')

    class Meta:
        verbose_name = 'Ordem de Serviço'
        verbose_name_plural = 'Ordens de Serviço'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['predicted_date']),
        ]
        constraints = [
            # rate entre 1 e 5 quando não nula
            models.CheckConstraint(
                check=Q(rate__isnull=True) | (Q(rate__gte=1) & Q(rate__lte=5)),
                name='service_rate_1_5_or_null',
            ),
            # start_date <= predicted_date
            models.CheckConstraint(
                check=Q(start_date__lte=F('predicted_date')),
                name='service_start_lte_predicted',
            ),
            # completion_date >= start_date quando houver
            models.CheckConstraint(
                check=Q(completion_date__isnull=True) | Q(completion_date__gte=F('start_date')),
                name='service_completion_gte_start_or_null',
            ),
        ]

    def __str__(self):
        return f'{self.title} ({self.get_status_display()})'

    @property
    def calculate_days_delay(self) -> int:
        """
        Calcula os dias de atraso:
        - Concluída: conclusão - prevista
        - Em aberto: hoje - prevista
        - Nunca negativo
        """
        if not self.predicted_date:
            return 0
        reference = self.completion_date or date.today()
        return max((reference - self.predicted_date).days, 0)

    def save(self, *args, **kwargs):
        self.days_delay = self.calculate_days_delay
        super().save(*args, **kwargs)
