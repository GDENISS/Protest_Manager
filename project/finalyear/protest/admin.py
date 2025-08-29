from django.contrib import admin
from .models import Nairobi, NairobiRoads, PoliceStn, ProtestEvents, NairobiHospitals, MergedWards
from django.contrib.gis.admin import GISModelAdmin  # Use GIS admin for geometry fields


@admin.register(Nairobi)
class NairobiAdmin(GISModelAdmin):
    list_display = ('gid', 'county', 'objectid', 'shape_leng', 'shape_area')
    search_fields = ('county',)





@admin.register(NairobiRoads)
class NairobiRoadsAdmin(GISModelAdmin):
    list_display = ['gid', 'name', 'highway', 'lanes']
    list_filter = ['highway', 'lanes']
    search_fields = ['name', 'highway', 'lanes']
    readonly_fields = ['gid']

    fieldsets = (
        ('Basic Information', {
            'fields': ('gid', 'name')
        }),
        ('Road Properties', {
            'fields': ('highway', 'lanes')
        }),
        ('Geometry', {
            'fields': ('geom',),
            'classes': ('collapse',)
        }),
    )

    default_zoom = 10
    default_lat = -1.2921
    default_lon = 36.8219



@admin.register(PoliceStn)
class PoliceStnAdmin(GISModelAdmin):
    list_display = ['gid', 'name', 'description_preview', 'is_visible', 'is_active', 'altitude_meters']
    list_filter = ['visibility', 'tessellate', 'extrude', 'timestamp']
    search_fields = ['name', 'descriptio']
    readonly_fields = ['gid']
    
    # Organize fields in the admin form
    fieldsets = (
        ('Basic Information', {
            'fields': ('gid', 'name', 'descriptio')
        }),
        ('Time Information', {
            'fields': ('timestamp', 'begin', 'end'),
            'classes': ('collapse',)
        }),
        ('Display Properties', {
            'fields': ('visibility', 'draworder', 'icon'),
            'classes': ('collapse',)
        }),
        ('3D Properties', {
            'fields': ('altitudemo', 'tessellate', 'extrude'),
            'classes': ('collapse',)
        }),
    )
    
    # Map settings for Nairobi
    default_zoom = 11
    default_lat = -1.2921  # Nairobi latitude
    default_lon = 36.8219  # Nairobi longitude
    
    def description_preview(self, obj):
        return obj.description_preview
    description_preview.short_description = 'Description'






@admin.register(ProtestEvents)
class ProtestEventsAdmin(GISModelAdmin):
    """
    Admin interface for ProtestEvents model with geographic capabilities.
    """
    
    # Display settings - matching your existing setup
    list_display = ['gid', 'event_date', 'year', 'fatalities', 'severity_level', 'has_fatalities']
    list_filter = ['year', 'fatalities', 'event_date']
    search_fields = ['gid']
    readonly_fields = ['gid', 'timestamp']
    #date_hierarchy = 'event_date'
    
    # Organize fields in the admin form - matching your setup
    fieldsets = (
        ('Basic Information', {
            'fields': ('gid', 'event_date', 'year', 'timestamp')
        }),
        ('Location', {
            'fields': ('latitude', 'longitude'),
        }),
        ('Impact', {
            'fields': ('fatalities',),
        }),
    )
    
    # Map settings for Nairobi - matching your setup
    default_zoom = 10
    default_lat = -1.2921  # Nairobi latitude
    default_lon = 36.8219  # Nairobi longitude
    
    
    # Custom display methods - matching your existing setup
    def severity_level(self, obj):
        return obj.severity_level
    severity_level.short_description = 'Severity'
    
    def has_fatalities(self, obj):
        return obj.has_fatalities
    has_fatalities.boolean = True
    has_fatalities.short_description = 'Fatalities?'
    
    # Custom actions - matching your existing setup
    actions = ['mark_recent_events']
    
    def mark_recent_events(self, request, queryset):
        from django.utils import timezone
        from datetime import timedelta
        recent_date = timezone.now().date() - timedelta(days=30)
        count = queryset.filter(event_date__gte=recent_date).count()
        self.message_user(request, f"{count} recent events (last 30 days) in selection.")
    mark_recent_events.short_description = "Show recent events count"
    
    # Ordering and pagination
    ordering = ['-event_date', '-gid']
    list_per_page = 25



@admin.register(NairobiHospitals)
class HospitalAdmin(GISModelAdmin):
    list_display = ('gid', 'name', 'amenity', 'healthcare', 'operator_t', 'addr_city')
    search_fields = ('name', 'addr_city', 'operator_t')


@admin.register(MergedWards)
class MergedWardsAdmin(GISModelAdmin):
    list_display = [
        'gid', 'ward', 'subcounty', 'county', 'poverty_level', 
        'youth_unemployment_level', 'protest_density_level', 'risk_assessment', 'pop2009'
    ]
    list_filter = [
        'county', 'subcounty'
    ]
    search_fields = ['ward', 'subcounty', 'county']
    readonly_fields = ['gid', 'poverty_level', 'youth_unemployment_level', 
                      'population_density_category', 'education_level_category',
                      'slum_housing_level', 'protest_density_level', 'risk_assessment', 'full_location']
    
    fieldsets = (
        ('Location Information', {
            'fields': ('gid', 'county', 'subcounty', 'ward', 'full_location')
        }),
        ('Population Data', {
            'fields': ('pop2009', 'pop_densit', 'population_density_category')
        }),
        ('Socioeconomic Indicators', {
            'fields': (
                'poverty_ra', 'poverty_level',
                'youth_unem', 'youth_unemployment_level',
                'avg_educat', 'education_level_category',
                'slum_house', 'slum_housing_level',
            )
        }),
        ('Protest Data', {
            'fields': ('protest_de', 'protest_density_level')
        }),
        ('Geographic Data', {
            'fields': ('shape_leng', 'shape_area', 'dist_to_ci')
        }),
        ('Risk Assessment', {
            'fields': ('risk_assessment',),
            'classes': ('collapse',)
        }),
        ('Geometry', {
            'fields': ('geom',),
            'classes': ('collapse',)
        }),
    )
    
    default_zoom = 10
    default_lat = -1.2921
    default_lon = 36.8219
    
    def get_queryset(self, request):
        """Optimize queryset for admin"""
        return super().get_queryset(request).select_related()
