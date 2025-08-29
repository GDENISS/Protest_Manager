# protest/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NairobiRoadsViewSet, 
    NairobiViewSet, 
    PoliceStnViewSet, 
    ProtestEventsViewSet, 
    HospitalViewSet,
    MergedWardsViewSet,
    trending_hashtags,
    spatial_analysis,
    ward_statistics
)

router = DefaultRouter()
router.register(r'nairobi-roads', NairobiRoadsViewSet)
router.register(r'nairobi-wards', NairobiViewSet)
router.register(r'police-stations', PoliceStnViewSet)
router.register(r'protest-events', ProtestEventsViewSet)
router.register(r'nairobi-hospitals', HospitalViewSet)
router.register(r'merged-wards', MergedWardsViewSet)




urlpatterns = [
    path('', include(router.urls)),
    path('trending-hashtags/', trending_hashtags, name='trending-hashtags'),
    path('spatial-analysis/', spatial_analysis, name='spatial-analysis'),
    path('ward-statistics/', ward_statistics, name='ward-statistics'),
]
