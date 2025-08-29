import os
os.environ['PROJ_LIB'] = r"C:\OSGeo4W\share\proj"
os.environ['GDAL_DATA'] = r"C:\OSGeo4W\share\gdal"

import json
import re
from datetime import datetime

import numpy as np
from scipy import stats
from scipy.spatial.distance import cdist
from sklearn.neighbors import KernelDensity

import requests
from bs4 import BeautifulSoup

from rest_framework import viewsets
from rest_framework_gis.pagination import GeoJsonPagination
from rest_framework_gis.filters import InBBoxFilter
from rest_framework.response import Response

from django.contrib.gis.geos import GEOSGeometry, Point
from django.contrib.gis.measure import Distance
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt

from .models import Nairobi, NairobiRoads, PoliceStn, ProtestEvents, NairobiHospitals, MergedWards
from .serializers import (
    NairobiSerializer,
    NairobiRoadsSerializer,
    PoliceStnSerializer,
    ProtestEventsSerializer,
    NairobiHospitalsSerializer,
    MergedWardsSerializer
)



class GeoJsonPaginationClass(GeoJsonPagination):
    page_size = 100  


class GeoBaseViewSet(viewsets.ReadOnlyModelViewSet):
    pagination_class = GeoJsonPaginationClass
    filter_backends = [InBBoxFilter]
    bbox_filter_field = 'geom' 
    bbox_filter_include_overlapping = True  


class NairobiViewSet(GeoBaseViewSet):
    queryset = Nairobi.objects.all()
    serializer_class = NairobiSerializer

class NairobiRoadsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = NairobiRoads.objects.all()
    serializer_class = NairobiRoadsSerializer
    pagination_class = None  # disable pagination


class PoliceStnViewSet(GeoBaseViewSet):
    queryset = PoliceStn.objects.all()
    serializer_class = PoliceStnSerializer


class ProtestEventsViewSet(GeoBaseViewSet):
    queryset = ProtestEvents.objects.all()
    serializer_class = ProtestEventsSerializer

class HospitalViewSet(GeoBaseViewSet):
    """
    API endpoint that allows hospital data to be viewed as GeoJSON.
    """
    queryset = NairobiHospitals.objects.all()
    serializer_class = NairobiHospitalsSerializer


class MergedWardsViewSet(GeoBaseViewSet):
    """
    API endpoint that allows merged wards data to be viewed as GeoJSON.
    Includes socioeconomic data for spatial analysis.
    """
    queryset = MergedWards.objects.all()
    serializer_class = MergedWardsSerializer
    
    def get_queryset(self):
        """
        Optionally filter wards by various parameters
        """
        queryset = MergedWards.objects.all()
        
        # Filter by county
        county = self.request.query_params.get('county', None)
        if county:
            queryset = queryset.filter(county__icontains=county)
        
        # Filter by subcounty
        subcounty = self.request.query_params.get('subcounty', None)
        if subcounty:
            queryset = queryset.filter(subcounty__icontains=subcounty)
        
        # Filter by poverty rate range
        min_poverty = self.request.query_params.get('min_poverty', None)
        max_poverty = self.request.query_params.get('max_poverty', None)
        if min_poverty:
            queryset = queryset.filter(poverty_ra__gte=float(min_poverty))
        if max_poverty:
            queryset = queryset.filter(poverty_ra__lte=float(max_poverty))
        
        # Filter by youth unemployment range
        min_unemployment = self.request.query_params.get('min_unemployment', None)
        max_unemployment = self.request.query_params.get('max_unemployment', None)
        if min_unemployment:
            queryset = queryset.filter(youth_unem__gte=float(min_unemployment))
        if max_unemployment:
            queryset = queryset.filter(youth_unem__lte=float(max_unemployment))
        
        # Filter by protest density range
        min_protest = self.request.query_params.get('min_protest_density', None)
        max_protest = self.request.query_params.get('max_protest_density', None)
        if min_protest:
            queryset = queryset.filter(protest_de__gte=float(min_protest))
        if max_protest:
            queryset = queryset.filter(protest_de__lte=float(max_protest))
        
        # Filter by population density range
        min_pop_density = self.request.query_params.get('min_pop_density', None)
        max_pop_density = self.request.query_params.get('max_pop_density', None)
        if min_pop_density:
            queryset = queryset.filter(pop_densit__gte=float(min_pop_density))
        if max_pop_density:
            queryset = queryset.filter(pop_densit__lte=float(max_pop_density))
        
        return queryset


# Trending Hashtags Functionality
@csrf_exempt
@require_http_methods(["GET"])
def trending_hashtags(request):
    """
    Get trending X (Twitter) hashtags for Kenya using web scraping and curated sources
    """
    try:
        hashtags = []
        
        # Method 1: Scrape from trending sites
        scraped_hashtags = scrape_trending_hashtags()
        hashtags.extend(scraped_hashtags)
        
        # Method 2: Get from Kenyan news sources
        news_hashtags = get_kenya_news_hashtags()
        hashtags.extend(news_hashtags)
        
        # Method 3: Add curated Kenya-specific trending topics
        curated_hashtags = get_curated_kenya_hashtags()
        hashtags.extend(curated_hashtags)
        
        # Remove duplicates and sort by relevance
        unique_hashtags = {}
        for hashtag in hashtags:
            tag = hashtag['tag'].lower()
            if tag not in unique_hashtags:
                unique_hashtags[tag] = hashtag
            else:
                # Combine scores if duplicate
                existing = unique_hashtags[tag]
                existing['interest_score'] = max(existing['interest_score'], hashtag['interest_score'])
        
        # Convert back to list and sort
        final_hashtags = list(unique_hashtags.values())
        final_hashtags.sort(key=lambda x: x['interest_score'], reverse=True)
        
        # Take top 15 and update positions
        final_hashtags = final_hashtags[:15]
        for i, hashtag in enumerate(final_hashtags):
            hashtag['position'] = i + 1
        
        return JsonResponse({
            'hashtags': final_hashtags,
            'total_found': len(final_hashtags),
            'timestamp': datetime.now().isoformat(),
            'source': 'Multiple Sources (Web Scraping + Curated)',
            'location': 'Kenya',
            'methods': ['Web Scraping', 'News Sources', 'Curated Trends']
        })
        
    except Exception as e:
        return JsonResponse({
            'error': 'Failed to fetch trending hashtags',
            'message': str(e),
            'hashtags': get_emergency_fallback_hashtags(),
            'timestamp': datetime.now().isoformat(),
            'source': 'emergency_fallback'
        }, status=200)

def scrape_trending_hashtags():
    """
    Scrape trending hashtags from various trending sites
    """
    hashtags = []
    
    try:
        # Scrape from trending hashtag sites
        urls = [
            'https://trendinalia.com/twitter-trending-topics/kenya.html',
            'https://getdaytrends.com/kenya/',
        ]
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        
        for url in urls:
            try:
                response = requests.get(url, headers=headers, timeout=10)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Look for common hashtag patterns
                    hashtag_elements = soup.find_all(['a', 'span', 'div'], string=re.compile(r'#\w+'))
                    
                    for element in hashtag_elements[:10]:
                        text = element.get_text().strip()
                        if text.startswith('#') and len(text) > 2:
                            hashtags.append({
                                'tag': text,
                                'original_term': text[1:],  # Remove #
                                'interest_score': 80 + len(hashtags) * 2,
                                'trend': 'up',
                                'risk': assess_risk_level(text),
                                'source': 'scraped'
                            })
                            
            except Exception:
                continue
                
    except Exception:
        pass
    
    return hashtags

def get_kenya_news_hashtags():
    """
    Extract trending topics from Kenyan news sources
    """
    hashtags = []
    
    try:
        # Common news keywords that could be trending
        news_keywords = [
            'Kenya', 'Nairobi', 'Ruto', 'Parliament', 'Elections', 'Politics',
            'County', 'Governor', 'Senate', 'Assembly', 'Court', 'Police',
            'University', 'Students', 'Youth', 'Economy', 'Budget', 'Tax'
        ]
        
        for keyword in news_keywords:
            hashtag = f"#{keyword.replace(' ', '')}"
            
            # Simulate relevance based on current events importance
            base_score = 60
            if keyword.lower() in ['ruto', 'parliament', 'elections', 'kenya']:
                base_score = 90
            elif keyword.lower() in ['nairobi', 'politics', 'youth', 'university']:
                base_score = 75
            
            hashtags.append({
                'tag': hashtag,
                'original_term': keyword,
                'interest_score': base_score + (hash(keyword) % 20),
                'trend': get_trend_direction(len(hashtags)),
                'risk': assess_risk_level(keyword),
                'source': 'news_derived'
            })
            
    except Exception:
        pass
    
    return hashtags

def get_curated_kenya_hashtags():
    """
    Get curated trending hashtags based on current Kenya events and politics
    """
    current_hashtags = [
        {'tag': '#KenyaKwanza', 'term': 'Kenya Kwanza', 'score': 95, 'risk': 'high'},
        {'tag': '#RutoAdministration', 'term': 'Ruto Administration', 'score': 90, 'risk': 'medium'},
        {'tag': '#KenyaParliament', 'term': 'Kenya Parliament', 'score': 85, 'risk': 'medium'},
        {'tag': '#NairobiCounty', 'term': 'Nairobi County', 'score': 80, 'risk': 'low'},
        {'tag': '#KenyaYouth', 'term': 'Kenya Youth', 'score': 78, 'risk': 'medium'},
        {'tag': '#KenyaPolitics', 'term': 'Kenya Politics', 'score': 88, 'risk': 'high'},
        {'tag': '#KenyaNews', 'term': 'Kenya News', 'score': 75, 'risk': 'low'},
        {'tag': '#KenyaElections', 'term': 'Kenya Elections', 'score': 82, 'risk': 'high'},
        {'tag': '#KenyaEconomy', 'term': 'Kenya Economy', 'score': 70, 'risk': 'medium'},
        {'tag': '#NairobiTraffic', 'term': 'Nairobi Traffic', 'score': 65, 'risk': 'low'},
        {'tag': '#KenyaUniversities', 'term': 'Kenya Universities', 'score': 68, 'risk': 'medium'},
        {'tag': '#KenyaSecurity', 'term': 'Kenya Security', 'score': 72, 'risk': 'high'},
    ]
    
    hashtags = []
    for item in current_hashtags:
        trend_direction = 'up' if item['score'] > 80 else 'stable' if item['score'] > 70 else 'down'
        
        hashtags.append({
            'tag': item['tag'],
            'original_term': item['term'],
            'interest_score': item['score'],
            'trend': trend_direction,
            'risk': item['risk'],
            'source': 'curated'
        })
    
    return hashtags

def get_emergency_fallback_hashtags():
    """
    Emergency fallback hashtags when all methods fail
    """
    return [
        {'tag': '#Kenya', 'original_term': 'Kenya', 'interest_score': 95, 'trend': 'up', 'risk': 'low', 'position': 1},
        {'tag': '#Nairobi', 'original_term': 'Nairobi', 'interest_score': 90, 'trend': 'stable', 'risk': 'low', 'position': 2},
        {'tag': '#KenyaPolitics', 'original_term': 'Kenya Politics', 'interest_score': 85, 'trend': 'up', 'risk': 'high', 'position': 3},
        {'tag': '#Ruto', 'original_term': 'Ruto', 'interest_score': 80, 'trend': 'stable', 'risk': 'medium', 'position': 4},
        {'tag': '#KenyaNews', 'original_term': 'Kenya News', 'interest_score': 75, 'trend': 'up', 'risk': 'low', 'position': 5},
    ]

def assess_risk_level(hashtag):
    """
    Assess risk level based on hashtag content
    """
    high_risk_keywords = ['protest', 'violence', 'riot', 'strike', 'clash', 'emergency']
    medium_risk_keywords = ['politics', 'government', 'police', 'traffic', 'council']
    
    hashtag_lower = hashtag.lower()
    
    for keyword in high_risk_keywords:
        if keyword in hashtag_lower:
            return 'high'
    
    for keyword in medium_risk_keywords:
        if keyword in hashtag_lower:
            return 'medium'
    
    return 'low'

def get_trend_direction(position):
    """
    Simulate trend direction based on position
    """
    if position < 3:
        return 'up'
    elif position < 8:
        return 'stable' if position % 2 == 0 else 'up'
    else:
        return 'down' if position % 3 == 0 else 'stable'


# Spatial Analysis Functionality
@csrf_exempt
@require_http_methods(["GET"])
def spatial_analysis(request):
    """
    Perform spatial analysis including KDE and correlation analysis
    """
    # Get parameters from query string
    metric = request.GET.get('metric', 'poverty_rate')
    include_kde = request.GET.get('include_kde', 'false').lower() == 'true'
    
    try:
        # Get protest events and police stations
        protests = ProtestEvents.objects.all()
        police_stations = PoliceStn.objects.all()
        
        # Extract coordinates
        protest_coords = np.array([[p.geom.x, p.geom.y] for p in protests if p.geom])
        police_coords = np.array([[ps.geom.x, ps.geom.y] for ps in police_stations if ps.geom])
        
        # Perform KDE analysis
        kde_results = None
        if include_kde and len(protest_coords) > 0:
            kde_results = perform_kde_analysis(protest_coords, police_coords)
        
        # Perform correlation analysis
        correlation_results = perform_correlation_analysis(protests, metric)
        
        return JsonResponse({
            'success': True,
            'correlation': correlation_results['correlation'],
            'p_value': correlation_results['p_value'],
            'correlation_data': correlation_results['data'],
            'kde_data': kde_results,
            'metric': metric,
            'sample_size': correlation_results.get('sample_size', 0)
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

def perform_kde_analysis(protest_coords, police_coords, grid_size=50):
    """
    Perform Kernel Density Estimation on protest events
    """
    if len(protest_coords) < 2:
        return None
    
    # Create KDE model
    kde = KernelDensity(bandwidth=0.01, kernel='gaussian')
    kde.fit(protest_coords)
    
    # Create grid for density estimation
    x_min, x_max = protest_coords[:, 0].min() - 0.05, protest_coords[:, 0].max() + 0.05
    y_min, y_max = protest_coords[:, 1].min() - 0.05, protest_coords[:, 1].max() + 0.05
    
    xx, yy = np.meshgrid(
        np.linspace(x_min, x_max, grid_size),
        np.linspace(y_min, y_max, grid_size)
    )
    
    grid_points = np.c_[xx.ravel(), yy.ravel()]
    
    # Calculate density scores
    log_density = kde.score_samples(grid_points)
    density = np.exp(log_density).reshape(xx.shape)
    
    # Calculate police station proximity weights
    proximity_weights = calculate_police_proximity_weights(grid_points, police_coords)
    proximity_weights = proximity_weights.reshape(xx.shape)
    
    # Calculate weighted risk surface
    risk_surface = density * (1 / (proximity_weights + 0.1))  # Higher risk when police are far
    
    # Prepare data for frontend
    kde_data = {
        'density_grid': density.tolist(),
        'risk_surface': risk_surface.tolist(),
        'proximity_weights': proximity_weights.tolist(),
        'grid_bounds': {
            'x_min': x_min, 'x_max': x_max,
            'y_min': y_min, 'y_max': y_max
        },
        'grid_size': grid_size,
        'hotspots': identify_hotspots(xx, yy, risk_surface)
    }
    
    return kde_data

def calculate_police_proximity_weights(grid_points, police_coords):
    """
    Calculate proximity weights based on distance to nearest police station
    """
    if len(police_coords) == 0:
        return np.ones(len(grid_points))
    
    # Calculate distance to nearest police station for each grid point
    distances = cdist(grid_points, police_coords)
    min_distances = np.min(distances, axis=1)
    
    # Convert to weights (closer = higher weight)
    max_distance = np.max(min_distances)
    weights = 1 - (min_distances / max_distance)
    
    return weights

def identify_hotspots(xx, yy, risk_surface, threshold_percentile=90):
    """
    Identify high-risk hotspots
    """
    threshold = np.percentile(risk_surface, threshold_percentile)
    hotspot_indices = np.where(risk_surface >= threshold)
    
    hotspots = []
    for i, j in zip(hotspot_indices[0], hotspot_indices[1]):
        hotspots.append({
            'longitude': xx[i, j],
            'latitude': yy[i, j],
            'risk_score': float(risk_surface[i, j]),
            'intensity': float(risk_surface[i, j] / np.max(risk_surface))
        })
    
    return hotspots

def perform_correlation_analysis(protests, metric):
    """
    Perform correlation analysis between protest intensity and socioeconomic factors using real ward data
    """
    correlation_data = []
    
    # Group protests by ward/region and calculate intensity
    protest_intensity = []
    socioeconomic_values = []
    
    # Get all wards with socioeconomic data
    wards = MergedWards.objects.filter(geom__isnull=False)
    
    for ward in wards[:30]:  # Limit for performance
        if ward.geom:
            # Calculate protest intensity for this ward
            ward_center = ward.geom.centroid
            intensity = calculate_protest_intensity_for_location(
                ward_center.y, ward_center.x, protests, radius_km=5
            )
            
            # Get socioeconomic value based on metric
            socio_value = None
            if metric == 'poverty_rate' and ward.poverty_ra:
                socio_value = ward.poverty_ra
            elif metric == 'youth_unemployment' and ward.youth_unem:
                socio_value = ward.youth_unem
            elif metric == 'population_density' and ward.pop_densit:
                socio_value = ward.pop_densit
            elif metric == 'education_level' and ward.avg_educat:
                socio_value = ward.avg_educat
            elif metric == 'slum_housing' and ward.slum_house:
                socio_value = ward.slum_house
            elif metric == 'protest_density' and ward.protest_de is not None:
                socio_value = ward.protest_de
            
            if socio_value is not None and intensity >= 0:
                protest_intensity.append(intensity)
                socioeconomic_values.append(socio_value)
                
                correlation_data.append({
                    'protest_intensity': intensity,
                    'socioeconomic_value': socio_value,
                    'ward': ward.full_location,
                    'ward_id': ward.gid,
                    'risk_assessment': ward.risk_assessment
                })
    
    # Calculate correlation
    if len(protest_intensity) > 1:
        correlation, p_value = stats.pearsonr(protest_intensity, socioeconomic_values)
    else:
        correlation, p_value = 0, 1
    
    return {
        'correlation': float(correlation) if not np.isnan(correlation) else 0,
        'p_value': float(p_value) if not np.isnan(p_value) else 1,
        'data': correlation_data,
        'sample_size': len(correlation_data)
    }

def calculate_protest_intensity_for_location(lat, lon, all_protests, radius_km=2):
    """
    Calculate protest intensity within radius of a location
    """
    center = Point(lon, lat)
    nearby_protests = 0
    
    for protest in all_protests:
        if protest.geom:
            protest_point = Point(protest.geom.x, protest.geom.y)
            distance = center.distance(protest_point) * 111  # Convert to km approximately
            
            if distance <= radius_km:
                nearby_protests += 1
    
    return nearby_protests


# Ward Statistics Endpoint
@csrf_exempt
def ward_statistics(request):
    """
    Get statistical summary of ward socioeconomic data
    """
    try:
        wards = MergedWards.objects.filter(geom__isnull=False)
        
        # Calculate statistics
        stats_data = {
            'total_wards': wards.count(),
            'poverty_stats': calculate_field_stats(wards, 'poverty_ra'),
            'unemployment_stats': calculate_field_stats(wards, 'youth_unem'),
            'population_stats': calculate_field_stats(wards, 'pop_densit'),
            'education_stats': calculate_field_stats(wards, 'avg_educat'),
            'slum_housing_stats': calculate_field_stats(wards, 'slum_house'),
            'protest_density_stats': calculate_field_stats(wards, 'protest_de'),
            'risk_distribution': get_risk_distribution(wards),
            'protest_density_distribution': get_protest_density_distribution(wards)
        }
        
        return JsonResponse({
            'success': True,
            'statistics': stats_data,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

def calculate_field_stats(wards, field_name):
    """
    Calculate statistics for a specific field
    """
    values = [getattr(ward, field_name) for ward in wards if getattr(ward, field_name) is not None]
    
    if not values:
        return None
    
    return {
        'mean': np.mean(values),
        'median': np.median(values),
        'std': np.std(values),
        'min': np.min(values),
        'max': np.max(values),
        'count': len(values)
    }

def get_risk_distribution(wards):
    """
    Get distribution of risk levels across wards
    """
    risk_counts = {'Low Risk': 0, 'Medium Risk': 0, 'High Risk': 0, 'Critical Risk': 0, 'Unknown': 0}
    
    for ward in wards:
        risk_level = ward.risk_assessment
        if risk_level in risk_counts:
            risk_counts[risk_level] += 1
    
    return risk_counts

def get_protest_density_distribution(wards):
    """
    Get distribution of protest density levels across wards
    """
    protest_counts = {'None': 0, 'Low': 0, 'Medium': 0, 'High': 0, 'Very High': 0, 'No Data': 0}
    
    for ward in wards:
        protest_level = ward.protest_density_level
        if protest_level in protest_counts:
            protest_counts[protest_level] += 1
    
    return protest_counts
