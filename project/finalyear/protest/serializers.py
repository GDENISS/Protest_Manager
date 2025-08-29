# protests/serializers.py
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from datetime import datetime
from django.utils.timezone import make_aware
from .models import Nairobi, NairobiRoads, PoliceStn, ProtestEvents, NairobiHospitals, MergedWards
from rest_framework import serializers as drf_serializers
import pytz

class NairobiSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = Nairobi
        geo_field = 'geom'
        fields = '__all__'

class NairobiRoadsSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = NairobiRoads
        fields = ('gid', 'name', 'highway', 'lanes', 'road_type_display')
        geo_field = 'geom'

class PoliceStnSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = PoliceStn
        geo_field = 'geom'
        fields = '__all__'

class ProtestEventsSerializer(GeoFeatureModelSerializer):
    # Override the timestamp field to handle float values
    timestamp = drf_serializers.DateTimeField(required=False, allow_null=True)
    
    def to_representation(self, instance):
        # Clean any float datetime values before serialization
        if hasattr(instance, 'timestamp') and instance.timestamp is not None:
            if isinstance(instance.timestamp, (int, float)):
                try:
                    # Convert float/int timestamp to datetime
                    instance.timestamp = datetime.fromtimestamp(instance.timestamp, tz=pytz.UTC)
                except (ValueError, OSError):
                    # If conversion fails, set to None
                    instance.timestamp = None
        
        try:
            return super().to_representation(instance)
        except AttributeError as e:
            if "'float' object has no attribute 'utcoffset'" in str(e):
                # Log the problematic instance for debugging
                print(f"Skipping problematic record with ID: {instance.gid}")
                print(f"Timestamp value: {instance.timestamp}, type: {type(instance.timestamp)}")
                # Set problematic timestamp to None and try again
                instance.timestamp = None
                return super().to_representation(instance)
            raise e

    class Meta:
        model = ProtestEvents
        geo_field = 'geom'
        fields = '__all__'



class NairobiHospitalsSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = NairobiHospitals
        geo_field = 'geom'
        fields = ('gid', 'name', 'amenity', 'healthcare', 'operator_t', 'addr_city')


class MergedWardsSerializer(GeoFeatureModelSerializer):
    # Add computed fields to the serializer
    poverty_level = drf_serializers.ReadOnlyField()
    youth_unemployment_level = drf_serializers.ReadOnlyField()
    population_density_category = drf_serializers.ReadOnlyField()
    education_level_category = drf_serializers.ReadOnlyField()
    slum_housing_level = drf_serializers.ReadOnlyField()
    protest_density_level = drf_serializers.ReadOnlyField()
    risk_assessment = drf_serializers.ReadOnlyField()
    full_location = drf_serializers.ReadOnlyField()
    
    class Meta:
        model = MergedWards
        geo_field = 'geom'
        fields = (
            'gid', 'pop2009', 'county', 'subcounty', 'ward', 'shape_leng', 
            'shape_area', 'poverty_ra', 'youth_unem', 'slum_house', 
            'avg_educat', 'pop_densit', 'dist_to_ci', 'protest_de', 
            'poverty_level', 'youth_unemployment_level', 'population_density_category', 
            'education_level_category', 'slum_housing_level', 'protest_density_level', 
            'risk_assessment', 'full_location'
        )
