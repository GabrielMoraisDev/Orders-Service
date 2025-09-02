from django.contrib import admin

from serviceorders.models import WorkOrder


@admin.register(WorkOrder)
class WorkOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'status', 'priority', 'from_user', 'responsible',
                    'predicted_date', 'completion_date', 'days_delay', 'created_at')
    list_filter = ('status', 'priority', 'predicted_date', 'completion_date', 'created_at')
    search_fields = ('title', 'description', 'resolved', 'from_user__username', 'responsible__username')
    date_hierarchy = 'predicted_date'
    autocomplete_fields = ('from_user', 'responsible')
