from datetime import date

from django.contrib import admin

from serviceorders.models import ServiceOrder


@admin.register(ServiceOrder)
class ServiceOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'status', 'priority', 'from_user', 'responsible',
                    'predicted_date', 'completion_date', 'days_delay', 'created_at')
    list_filter = ('status', 'priority', 'predicted_date', 'completion_date', 'created_at')
    search_fields = ('title', 'description', 'resolved', 'from_user__username', 'responsible__username')
    date_hierarchy = 'predicted_date'
    autocomplete_fields = ('from_user', 'responsible')
    list_editable = ('status', 'priority',)

    actions = ['closed_os']

    def closed_os(self, request, queryset):
        updated = queryset.update(status='closed', completion_date=date.today())
        self.message_user(request, f"{updated} OS fechadas.")
