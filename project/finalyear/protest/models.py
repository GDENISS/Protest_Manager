from django.contrib.gis.db import models
from django.utils.timezone import make_aware

class Nairobi(models.Model):
    gid = models.AutoField(primary_key=True)
    objectid = models.IntegerField()
    area = models.DecimalField(max_digits=20, decimal_places=10)
    perimeter = models.DecimalField(max_digits=20, decimal_places=10)
    county3 = models.DecimalField(max_digits=20, decimal_places=10, db_column='county3_')  # Fixed this line
    county3_id = models.DecimalField(max_digits=20, decimal_places=10)
    county = models.CharField(max_length=100)
    shape_leng = models.DecimalField(max_digits=20, decimal_places=10)
    shape_area = models.DecimalField(max_digits=20, decimal_places=10)
    geom = models.GeometryField(srid=4326)
    
    class Meta:
        managed = False
        db_table = 'nairobi'
        
    def __str__(self):
        return f"Road {self.gid} in {self.county}"

class NairobiRoads(models.Model):
    gid = models.AutoField(primary_key=True)
    name = models.CharField(max_length=80, blank=True, null=True)
    highway = models.CharField(max_length=80, blank=True, null=True)
    lanes = models.CharField(max_length=80, blank=True, null=True)
    geom = models.GeometryField(srid=4326)  # WGS84 default, adjust if needed

    class Meta:
        managed = False  # Set to True if Django should manage the table
        db_table = 'roads'  # Match the actual table name in your DB
        verbose_name = 'Nairobi Road'
        verbose_name_plural = 'Nairobi Roads'

    def __str__(self):
        return self.name or f"Road {self.gid}"

    @property
    def road_type_display(self):
        """Clean display for highway type"""
        return self.highway.title() if self.highway else "Unknown"
    
class PoliceStn(models.Model):
    gid = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    descriptio = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(blank=True, null=True)
    begin = models.DateTimeField(blank=True, null=True)
    end = models.DateTimeField(blank=True, null=True)
    altitudemo = models.DecimalField(max_digits=20, decimal_places=10, blank=True, null=True)
    tessellate = models.IntegerField(blank=True, null=True)
    extrude = models.IntegerField(blank=True, null=True)
    visibility = models.IntegerField(blank=True, null=True)
    draworder = models.IntegerField(blank=True, null=True)
    icon = models.CharField(max_length=255, blank=True, null=True)
    geom = models.GeometryField(srid=4326)  # Adjust SRID as needed
    
    class Meta:
        managed = False  # Set to True if Django should manage this table
        db_table = 'policestn'  # Replace with your actual table name if different
        verbose_name = 'Police Station'
        verbose_name_plural = 'Police Stations'
        
    def __str__(self):
        return self.name or f"Police Station {self.gid}"
    
    @property
    def is_visible(self):
        """Check if the police station is visible"""
        return self.visibility == 1 if self.visibility is not None else True
    
    @property
    def altitude_meters(self):
        """Return altitude in meters"""
        return float(self.altitudemo) if self.altitudemo else 0
    
    @property
    def is_active(self):
        """Check if the police station is currently active based on begin/end dates"""
        from django.utils import timezone
        now = timezone.now()
        
        if self.begin and now < self.begin:
            return False
        if self.end and now > self.end:
            return False
        return True
    
    @property
    def description_preview(self):
        """Return a truncated description for display"""
        if self.descriptio:
            return self.descriptio[:100] + "..." if len(self.descriptio) > 100 else self.descriptio
        return "No description"
    
class ProtestEvents(models.Model):
    gid = models.AutoField(primary_key=True)
    event_date = models.DateField(blank=True, null=True)
    year = models.IntegerField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    fatalities = models.IntegerField(blank=True, null=True)
    timestamp = models.DateTimeField(blank=True, null=True)
    geom = models.GeometryField(srid=4326)  # Adjust SRID as needed
    
    class Meta:
        managed = False  # Set to True if Django should manage this table
        db_table = 'protest_events'  # Replace with your actual table name if different
        verbose_name = 'Protest Event'
        verbose_name_plural = 'Protest Events'
        ordering = ['-event_date']  # Most recent events first
        
    def __str__(self):
      if self.event_date:
        # Handle both string and date objects
        if isinstance(self.event_date, str):
            return f"Protest Event on {self.event_date}"
        else:
            return f"Protest Event on {self.event_date.strftime('%Y-%m-%d')}"
      return f"Protest Event {self.gid}"
    
    @property
    def has_fatalities(self):
        """Check if the event resulted in fatalities"""
        return self.fatalities and self.fatalities > 0
    
    @property
    def severity_level(self):
        """Return severity level based on fatalities"""
        if not self.fatalities:
            return 'Low'
        elif self.fatalities <= 2:
            return 'Medium'
        elif self.fatalities <= 5:
            return 'High'
        else:
            return 'Critical'
    
    @property
    def coordinates(self):
        """Return latitude and longitude as tuple"""
        if self.latitude and self.longitude:
            return (float(self.latitude), float(self.longitude))
        return None
    
    @property
    def event_year(self):
        """Return year from event_date or year field"""
        if self.event_date:
            return self.event_date.year
        return self.year
    
    @property
    def days_since_event(self):
        """Calculate days since the event occurred"""
        if self.event_date:
            from django.utils import timezone
            today = timezone.now().date()
            return (today - self.event_date).days
        return None


class NairobiHospitals(models.Model):
    gid = models.AutoField(primary_key=True)
    name = models.CharField(max_length=80, blank=True, null=True)
    amenity = models.CharField(max_length=80, blank=True, null=True)
    healthcare = models.CharField(max_length=94, blank=True, null=True)
    operator_t = models.CharField(max_length=80, blank=True, null=True)
    addr_city = models.CharField(max_length=80, blank=True, null=True)
    geom = models.GeometryField(srid=4326)

    class Meta:
        managed = False
        db_table = 'hospitals'

    def __str__(self):
        return self.name if self.name else f"Hospital {self.gid}"


class MergedWards(models.Model):
    gid = models.AutoField(primary_key=True)
    pop2009 = models.IntegerField(blank=True, null=True)
    county = models.CharField(max_length=100, blank=True, null=True)
    subcounty = models.CharField(max_length=100, blank=True, null=True)
    ward = models.CharField(max_length=100, blank=True, null=True)
    shape_leng = models.FloatField(blank=True, null=True)
    shape_area = models.FloatField(blank=True, null=True)
    poverty_ra = models.FloatField(blank=True, null=True)
    youth_unem = models.FloatField(blank=True, null=True)
    slum_house = models.FloatField(blank=True, null=True)
    avg_educat = models.FloatField(blank=True, null=True)
    pop_densit = models.FloatField(blank=True, null=True)
    dist_to_ci = models.FloatField(blank=True, null=True)
    protest_de = models.FloatField(blank=True, null=True)
    geom = models.GeometryField(srid=4326, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'merged_wards'
        verbose_name = 'Merged Ward'
        verbose_name_plural = 'Merged Wards'
        ordering = ['county', 'subcounty', 'ward']

    def __str__(self):
        return f"{self.ward}, {self.subcounty}, {self.county}" if self.ward else f"Ward {self.gid}"
    
    @property
    def full_location(self):
        """Return full location string"""
        parts = [self.ward, self.subcounty, self.county]
        return ", ".join([part for part in parts if part])
    
    @property
    def poverty_level(self):
        """Categorize poverty rate"""
        if not self.poverty_ra:
            return 'Unknown'
        elif self.poverty_ra < 20:
            return 'Low'
        elif self.poverty_ra < 40:
            return 'Medium'
        elif self.poverty_ra < 60:
            return 'High'
        else:
            return 'Very High'
    
    @property
    def youth_unemployment_level(self):
        """Categorize youth unemployment"""
        if not self.youth_unem:
            return 'Unknown'
        elif self.youth_unem < 15:
            return 'Low'
        elif self.youth_unem < 30:
            return 'Medium'
        elif self.youth_unem < 45:
            return 'High'
        else:
            return 'Very High'
    
    @property
    def population_density_category(self):
        """Categorize population density"""
        if not self.pop_densit:
            return 'Unknown'
        elif self.pop_densit < 1000:
            return 'Low Density'
        elif self.pop_densit < 5000:
            return 'Medium Density'
        elif self.pop_densit < 10000:
            return 'High Density'
        else:
            return 'Very High Density'
    
    @property
    def education_level_category(self):
        """Categorize average education level"""
        if not self.avg_educat:
            return 'Unknown'
        elif self.avg_educat < 5:
            return 'Very Low'
        elif self.avg_educat < 8:
            return 'Low'
        elif self.avg_educat < 12:
            return 'Medium'
        else:
            return 'High'
    
    @property
    def slum_housing_level(self):
        """Categorize slum housing percentage"""
        if not self.slum_house:
            return 'Unknown'
        elif self.slum_house < 10:
            return 'Low'
        elif self.slum_house < 30:
            return 'Medium'
        elif self.slum_house < 50:
            return 'High'
        else:
            return 'Very High'
    
    @property
    def protest_density_level(self):
        """Categorize protest density"""
        if not self.protest_de:
            return 'No Data'
        
        protest_val = float(self.protest_de)
        if protest_val == 0:
            return 'None'
        elif protest_val < 0.5:
            return 'Low'
        elif protest_val < 1.0:
            return 'Medium'
        elif protest_val < 2.0:
            return 'High'
        else:
            return 'Very High'
    
    @property
    def risk_assessment(self):
        """Calculate overall risk assessment based on multiple factors including protest density"""
        risk_score = 0.0
        factors = 0
        
        # Poverty rate contribution
        if self.poverty_ra:
            risk_score += min(float(self.poverty_ra) / 10, 10)  # Max 10 points
            factors += 1
        
        # Youth unemployment contribution
        if self.youth_unem:
            risk_score += min(float(self.youth_unem) / 5, 10)  # Max 10 points
            factors += 1
        
        # Slum housing contribution
        if self.slum_house:
            risk_score += min(float(self.slum_house) / 5, 10)  # Max 10 points
            factors += 1
        
        # Population density contribution
        if self.pop_densit:
            risk_score += min(float(self.pop_densit) / 1000, 5)  # Max 5 points
            factors += 1
        
        # Education level (inverse - lower education = higher risk)
        if self.avg_educat:
            risk_score += max(0, (12 - float(self.avg_educat)) / 2)  # Max 6 points
            factors += 1
        
        # Protest density contribution (direct correlation)
        if self.protest_de is not None:
            risk_score += min(float(self.protest_de) * 5, 15)  # Max 15 points for protest density
            factors += 1
        
        if factors == 0:
            return 'Unknown'
        
        avg_risk = risk_score / factors
        
        if avg_risk < 3:
            return 'Low Risk'
        elif avg_risk < 6:
            return 'Medium Risk'
        elif avg_risk < 9:
            return 'High Risk'
        else:
            return 'Critical Risk'




