import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AlertTriangle, MapPin, Shield, Zap, Activity, Brain, Target, Settings, Map, Filter, BarChart3 } from 'lucide-react';

const RiskSurfaceMap = () => {
    const { data } = useData();
    const canvasRef = useRef(null);
    const [analyticsData, setAnalyticsData] = useState({
        spatialAnalysis: null,
        wardStatistics: null,
        mergedWards: null,
        loading: true,
        error: null
    });

    // API endpoints
    const API_BASE_URL = 'http://127.0.0.1:8000/api';

    // Fetch comprehensive analytics data with full endpoint capabilities
    const fetchAnalyticsData = useCallback(async () => {
        setAnalyticsData(prev => ({ ...prev, loading: true, error: null }));

        try {
            console.log('Fetching comprehensive analytics from backend...');
            
            let spatial = null;
            let stats = null;
            let mergedWards = null;

            // Fetch ward statistics with full statistical measures
            try {
                const statsRes = await fetch(`${API_BASE_URL}/ward-statistics/`);
                if (statsRes.ok) {
                    const rawStats = await statsRes.json();
                    // Extract the actual statistics from the response structure
                    stats = rawStats.success ? rawStats.statistics : rawStats;
                    console.log('Ward statistics loaded with', stats.total_wards, 'wards:', {
                        poverty_stats: stats.poverty_stats,
                        unemployment_stats: stats.unemployment_stats,
                        population_stats: stats.population_stats,
                        education_stats: stats.education_stats,
                        slum_housing_stats: stats.slum_housing_stats,
                        protest_density_stats: stats.protest_density_stats,
                        risk_distribution: stats.risk_distribution,
                        protest_density_distribution: stats.protest_density_distribution
                    });
                } else {
                    console.warn('Ward statistics endpoint failed:', statsRes.status);
                }
            } catch (err) {
                console.warn('Ward statistics error:', err.message);
            }

            // Fetch merged wards with integrated socioeconomic data (better than basic nairobi-wards)
            try {
                const wardsRes = await fetch(`${API_BASE_URL}/merged-wards/`);
                if (wardsRes.ok) {
                    mergedWards = await wardsRes.json();
                    console.log('Merged wards loaded with', mergedWards.features?.length, 'wards with integrated socioeconomic data');
                } else {
                    console.warn('Merged wards endpoint failed, falling back to basic wards:', wardsRes.status);
                    // Fallback to basic nairobi-wards if merged-wards fails
                    try {
                        const basicWardsRes = await fetch(`${API_BASE_URL}/nairobi-wards/`);
                        if (basicWardsRes.ok) {
                            mergedWards = await basicWardsRes.json();
                            console.log('Basic nairobi wards loaded as fallback:', mergedWards.features?.length);
                        }
                    } catch (fallbackErr) {
                        console.warn('Basic wards fallback also failed:', fallbackErr.message);
                    }
                }
            } catch (err) {
                console.warn('Merged wards error:', err.message);
            }

            // Fetch comprehensive spatial analysis with KDE and correlation analysis
            try {
                // Request full spatial analysis with KDE for hotspot identification
                const spatialRes = await fetch(`${API_BASE_URL}/spatial-analysis/?metric=poverty_rate&include_kde=true`);
                if (spatialRes.ok) {
                    spatial = await spatialRes.json();
                    console.log('Comprehensive spatial analysis loaded:', {
                        success: spatial.success,
                        correlation: spatial.correlation,
                        p_value: spatial.p_value,
                        sample_size: spatial.sample_size,
                        correlation_data_points: spatial.correlation_data?.length || 0,
                        kde_data_available: spatial.kde_data ? 'Yes' : 'No'
                    });
                } else {
                    console.warn('Spatial analysis with KDE failed, trying basic analysis:', spatialRes.status);
                    // Try without KDE if the full analysis fails
                    try {
                        const basicSpatialRes = await fetch(`${API_BASE_URL}/spatial-analysis/?metric=poverty_rate`);
                        if (basicSpatialRes.ok) {
                            spatial = await basicSpatialRes.json();
                            console.log('Basic spatial analysis loaded (no KDE):', {
                                correlation: spatial.correlation,
                                p_value: spatial.p_value,
                                sample_size: spatial.sample_size
                            });
                        }
                    } catch (basicErr) {
                        console.warn('Basic spatial analysis also failed:', basicErr.message);
                    }
                }
            } catch (err) {
                console.warn('Spatial analysis error:', err.message);
            }

            setAnalyticsData({
                spatialAnalysis: spatial,
                wardStatistics: stats,
                mergedWards: mergedWards,
                loading: false,
                error: null
            });

            console.log('Analytics data successfully integrated from comprehensive backend endpoints');
        } catch (error) {
            console.error('Error fetching comprehensive analytics:', error);
            setAnalyticsData(prev => ({
                ...prev,
                loading: false,
                error: error.message
            }));
        }
    }, []);

    // Nairobi bounds for mapping - expanded slightly for better coverage
    const nairobiBounds = useMemo(() => ({
        minLat: -1.45,    // Slightly expanded south
        maxLat: -1.16,    // Slightly expanded north  
        minLng: 36.64,    // Slightly expanded west
        maxLng: 37.11     // Slightly expanded east
    }), []);



    // Helper function to get polygon center
    const getPolygonCenter = (geometry) => {
        if (!geometry || !geometry.coordinates) return null;
        
        let coords = [];
        if (geometry.type === 'Polygon') {
            coords = geometry.coordinates[0];
        } else if (geometry.type === 'MultiPolygon') {
            coords = geometry.coordinates[0][0];
        }
        
        if (coords.length === 0) return null;
        
        let sumLat = 0, sumLng = 0;
        coords.forEach(coord => {
            sumLng += coord[0];
            sumLat += coord[1];
        });
        
        return {
            lat: sumLat / coords.length,
            lng: sumLng / coords.length
        };
    };

    // Draw legend function - defined first to avoid hoisting issues
    const drawLegend = useCallback((ctx, canvas) => {
        const legendX = canvas.width - 180;
        const legendY = 20;
        
        // Legend background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(legendX - 10, legendY - 10, 170, 180);
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 1;
        ctx.strokeRect(legendX - 10, legendY - 10, 170, 180);
        
        // Legend title
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Risk Assessment', legendX, legendY + 15);
        
        // Risk levels
        const riskLevels = [
            { level: 'Critical', color: '#dc2626', bgColor: 'rgba(220, 38, 38, 0.4)' },
            { level: 'High', color: '#ea580c', bgColor: 'rgba(249, 115, 22, 0.4)' },
            { level: 'Medium', color: '#d97706', bgColor: 'rgba(245, 158, 11, 0.4)' },
            { level: 'Low', color: '#16a34a', bgColor: 'rgba(34, 197, 94, 0.4)' }
        ];
        
        ctx.font = '12px Arial';
        riskLevels.forEach((risk, index) => {
            const y = legendY + 35 + (index * 20);
            
            // Risk level color box
            ctx.fillStyle = risk.bgColor;
            ctx.fillRect(legendX, y - 8, 15, 12);
            ctx.strokeStyle = risk.color;
            ctx.strokeRect(legendX, y - 8, 15, 12);
            
            // Risk level text
            ctx.fillStyle = '#374151';
            ctx.fillText(risk.level, legendX + 20, y + 2);
        });
        
        // Symbols
        ctx.fillStyle = '#374151';
        ctx.fillText('Symbols:', legendX, legendY + 125);
        
        // Protest events
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(legendX + 8, legendY + 138, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#374151';
        ctx.fillText('Protest Events', legendX + 20, legendY + 142);
        
        // Police stations
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(legendX + 4, legendY + 148, 8, 8);
        ctx.fillStyle = '#374151';
        ctx.fillText('Police Stations', legendX + 20, legendY + 155);
        
        // KDE Hotspots
        ctx.fillStyle = 'rgba(220, 38, 38, 0.6)';
        ctx.beginPath();
        ctx.arc(legendX + 8, legendY + 165, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#374151';
        ctx.fillText('KDE Hotspots', legendX + 20, legendY + 169);
    }, []);

    // Enhanced canvas drawing with proper scaling
    const drawComprehensiveAnalysis = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || analyticsData.loading) return;

        const ctx = canvas.getContext('2d');
        
        // Calculate proper aspect ratio based on Nairobi's actual geographic bounds
        const lngRange = nairobiBounds.maxLng - nairobiBounds.minLng; // ~0.453514
        const latRange = nairobiBounds.maxLat - nairobiBounds.minLat; // ~0.281277
        
        // Account for latitude distortion (at Nairobi's latitude ~-1.29°)
        const latCorrectionFactor = Math.cos((nairobiBounds.minLat + nairobiBounds.maxLat) / 2 * Math.PI / 180);
        const adjustedLngRange = lngRange * latCorrectionFactor;
        
        // Calculate proper aspect ratio
        const geographicAspectRatio = adjustedLngRange / latRange; // width/height
        
        // Set canvas dimensions to use full container while maintaining geographic proportions
        const container = canvas.parentElement;
        const containerWidth = container?.clientWidth || 800;
        const containerHeight = container?.clientHeight || 600;
        
        // Calculate dimensions to fit container while maintaining aspect ratio
        let canvasWidth, canvasHeight;
        const containerAspectRatio = containerWidth / containerHeight;
        
        if (containerAspectRatio > geographicAspectRatio) {
            // Container is wider than needed, fit to height
            canvasHeight = Math.min(containerHeight - 20, 600); // Account for padding
            canvasWidth = canvasHeight * geographicAspectRatio;
        } else {
            // Container is taller than needed, fit to width
            canvasWidth = Math.min(containerWidth - 20, 800); // Account for padding
            canvasHeight = canvasWidth / geographicAspectRatio;
        }
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.width = `${canvasWidth}px`;
        canvas.style.height = `${canvasHeight}px`;
        
        // Clear canvas with light background
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const mapWidth = canvas.width;
        const mapHeight = canvas.height;

        // Convert lat/lng to canvas coordinates - now using full canvas area
        const latLngToCanvas = (lat, lng) => {
            const x = ((lng - nairobiBounds.minLng) / (nairobiBounds.maxLng - nairobiBounds.minLng)) * mapWidth;
            const y = ((nairobiBounds.maxLat - lat) / (nairobiBounds.maxLat - nairobiBounds.minLat)) * mapHeight;
            return { x, y };
        };

        // Debug information
        console.log('Canvas dimensions:', { canvasWidth, canvasHeight, mapWidth, mapHeight });
        console.log('Geographic bounds:', nairobiBounds);
        console.log('Ward data available:', analyticsData.mergedWards?.features?.length || 0);

        // Draw ward boundaries with basic visualization
        if (analyticsData.mergedWards?.features) {
            analyticsData.mergedWards.features.forEach(ward => {
                if (ward.geometry && ward.geometry.coordinates) {
                    // Use basic ward colors since risk assessment might not be available
                    const riskLevel = ward.properties?.risk_level || ward.properties?.RISK_LEVEL || 'unknown';
                    
                    // Color based on available risk level or default to basic ward outline
                    let fillColor, strokeColor;
                    switch (riskLevel.toLowerCase()) {
                        case 'critical':
                        case 'high':
                            fillColor = 'rgba(220, 38, 38, 0.3)'; // Red
                            strokeColor = '#dc2626';
                            break;
                        case 'medium':
                        case 'moderate':
                            fillColor = 'rgba(245, 158, 11, 0.3)'; // Yellow
                            strokeColor = '#d97706';
                            break;
                        case 'low':
                            fillColor = 'rgba(34, 197, 94, 0.3)'; // Green
                            strokeColor = '#16a34a';
                            break;
                        default:
                            // Default ward boundary visualization
                            fillColor = 'rgba(99, 102, 241, 0.2)'; // Light blue
                            strokeColor = '#6366f1';
                    }

                    ctx.fillStyle = fillColor;
                    ctx.strokeStyle = strokeColor;
                    ctx.lineWidth = 2;

                    ctx.beginPath();
                    
                    if (ward.geometry.type === 'Polygon') {
                        const coords = ward.geometry.coordinates[0];
                        coords.forEach((coord, index) => {
                            const { x, y } = latLngToCanvas(coord[1], coord[0]);
                            if (index === 0) {
                                ctx.moveTo(x, y);
                            } else {
                                ctx.lineTo(x, y);
                            }
                        });
                    } else if (ward.geometry.type === 'MultiPolygon') {
                        ward.geometry.coordinates.forEach(polygon => {
                            const coords = polygon[0];
                            coords.forEach((coord, index) => {
                                const { x, y } = latLngToCanvas(coord[1], coord[0]);
                                if (index === 0) {
                                    ctx.moveTo(x, y);
                                } else {
                                    ctx.lineTo(x, y);
                                }
                            });
                        });
                    }
                    
                    ctx.fill();
                    ctx.stroke();

                    // Add ward labels
                    const wardName = ward.properties?.name || ward.properties?.NAME || ward.properties?.ward_name || ward.properties?.WARD_NAME;
                    if (wardName) {
                        const center = getPolygonCenter(ward.geometry);
                        if (center) {
                            const { x, y } = latLngToCanvas(center.lat, center.lng);
                            
                            // Label background
                            ctx.font = 'bold 11px Arial';
                            const textWidth = ctx.measureText(wardName).width;
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                            ctx.fillRect(x - textWidth/2 - 4, y - 8, textWidth + 8, 16);
                            
                            // Label text
                            ctx.fillStyle = '#1f2937';
                            ctx.textAlign = 'center';
                            ctx.fillText(wardName, x, y + 4);
                        }
                    }
                }
            });
        }

        // Draw spatial correlation data points and ward-level analysis
        // Note: Correlation data is now visualized in the detailed statistics section below the map
        // This prevents random point placement outside ward boundaries
        
        // Draw KDE data if available (currently null but structure prepared)
        if (analyticsData.spatialAnalysis?.kde_data) {
            console.log('KDE data available for advanced visualization');
            // Future implementation for when KDE data is returned
        }

        // Draw protest events from main data
        if (data?.protests) {
            const protestFeatures = data.protests.features || data.protests || [];
            ctx.fillStyle = '#dc2626';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            
            protestFeatures.forEach(protest => {
                const lat = protest.geometry?.coordinates?.[1] || protest.latitude;
                const lng = protest.geometry?.coordinates?.[0] || protest.longitude;
                
                if (lat && lng && lat >= nairobiBounds.minLat && lat <= nairobiBounds.maxLat && 
                    lng >= nairobiBounds.minLng && lng <= nairobiBounds.maxLng) {
                    const { x, y } = latLngToCanvas(lat, lng);
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.stroke();
                }
            });
        }

        // Draw police stations
        if (data?.police) {
            const policeFeatures = data.police.features || data.police || [];
            ctx.fillStyle = '#2563eb';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            
            policeFeatures.forEach(station => {
                const lat = station.geometry?.coordinates?.[1] || station.latitude;
                const lng = station.geometry?.coordinates?.[0] || station.longitude;
                
                if (lat && lng && lat >= nairobiBounds.minLat && lat <= nairobiBounds.maxLat && 
                    lng >= nairobiBounds.minLng && lng <= nairobiBounds.maxLng) {
                    const { x, y } = latLngToCanvas(lat, lng);
                    ctx.beginPath();
                    ctx.rect(x - 4, y - 4, 8, 8);
                    ctx.fill();
                    ctx.stroke();
                }
            });
        }

        // Add legend
        drawLegend(ctx, canvas);
        
    }, [data, analyticsData, nairobiBounds, drawLegend]);

    // Fetch analytics data on component mount
    useEffect(() => {
        fetchAnalyticsData();
    }, [fetchAnalyticsData]);

    // Redraw when data changes
    useEffect(() => {
        if (!analyticsData.loading) {
            drawComprehensiveAnalysis();
        }
    }, [analyticsData, data, drawComprehensiveAnalysis]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (!analyticsData.loading) {
                drawComprehensiveAnalysis();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [analyticsData.loading, drawComprehensiveAnalysis]);

    if (analyticsData.error) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-center text-red-600">
                    <h3 className="text-lg font-semibold mb-2">Error Loading Analytics</h3>
                    <p>{analyticsData.error}</p>
                    <button 
                        onClick={fetchAnalyticsData}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }
            
    return (
        <div className="space-y-8">
            {/* Hero Section - No purple colors */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-orange-600 to-amber-800 p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                            <Brain className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Comprehensive Risk Surface Analysis</h1>
                            <p className="text-red-100 text-lg">
                                Integrated spatial analysis with real ward boundaries and socioeconomic indicators
                            </p>
                        </div>
                    </div>
                    
                    {/* Summary Cards - Enhanced with comprehensive analytics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-6 w-6 text-red-200" />
                                <div>
                                    <div className="text-2xl font-bold">
                                        {analyticsData.spatialAnalysis?.correlation?.toFixed(3) || '--'}
                                    </div>
                                    <div className="text-red-200 text-sm">Spatial Correlation</div>
                                    <div className="text-red-300 text-xs">
                                        {analyticsData.spatialAnalysis?.p_value 
                                            ? `p=${analyticsData.spatialAnalysis.p_value.toFixed(4)}`
                                            : 'Statistical Analysis'
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <Target className="h-6 w-6 text-orange-200" />
                                <div>
                                    <div className="text-2xl font-bold">
                                        {analyticsData.spatialAnalysis?.correlation_data?.length || 0}
                                    </div>
                                    <div className="text-orange-200 text-sm">Data Points</div>
                                    <div className="text-orange-300 text-xs">
                                        {analyticsData.spatialAnalysis?.kde_data 
                                            ? 'KDE Analysis Available'
                                            : 'Correlation Analysis Only'
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <Shield className="h-6 w-6 text-amber-200" />
                                <div>
                                    <div className="text-2xl font-bold">
                                        {analyticsData.wardStatistics?.total_wards || (data.police?.features || data.police || []).length}
                                    </div>
                                    <div className="text-amber-200 text-sm">
                                        {analyticsData.wardStatistics?.total_wards ? 'Total Wards' : 'Police Stations'}
                                    </div>
                                    <div className="text-amber-300 text-xs">
                                        {analyticsData.wardStatistics?.risk_distribution?.['High Risk'] || 0} High Risk
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <MapPin className="h-6 w-6 text-yellow-200" />
                                <div>
                                    <div className="text-2xl font-bold">
                                        {analyticsData.wardStatistics?.poverty_stats?.mean?.toFixed(1) || 
                                         (analyticsData.mergedWards?.features?.length || 0)}
                                    </div>
                                    <div className="text-yellow-200 text-sm">
                                        {analyticsData.wardStatistics?.poverty_stats?.mean 
                                            ? 'Avg Poverty %' 
                                            : 'Ward Areas'
                                        }
                                    </div>
                                    <div className="text-yellow-300 text-xs">
                                        {analyticsData.wardStatistics?.protest_density_distribution?.['Very High'] || 0} Very High Activity
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-24 -translate-x-24"></div>
            </div>

            {/* Main Visualization */}
            <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white to-slate-50">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200/50 pb-6">
                    <CardTitle className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-600 to-blue-600 shadow-lg">
                            <Map className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Risk Surface Visualization</h3>
                            <p className="text-slate-600 font-normal mt-1">
                                Integrated view of ward boundaries, risk assessment, and KDE hotspots
                            </p>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="relative min-h-[500px]">
                        {analyticsData.loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg z-10">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                    <p className="text-sm text-gray-600">Loading comprehensive analytics...</p>
                                </div>
                            </div>
                        )}
                        
                        <div className="bg-slate-100 rounded-2xl overflow-hidden shadow-inner border-2 border-slate-200 p-4 min-h-[480px] flex items-center justify-center">
                            <canvas
                                ref={canvasRef}
                                className="rounded-lg shadow-lg max-w-full max-h-full"
                                style={{ display: 'block' }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Comprehensive Analytics Summary */}
            {(analyticsData.spatialAnalysis || analyticsData.wardStatistics) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Spatial Correlation Analysis */}
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-blue-900 text-sm">Spatial Correlation</h4>
                                    <p className="text-2xl font-bold text-blue-700">
                                        {analyticsData.spatialAnalysis?.correlation?.toFixed(3) || 'N/A'}
                                    </p>
                                    <p className="text-xs text-blue-600">
                                        {analyticsData.spatialAnalysis?.p_value 
                                            ? `p-value: ${analyticsData.spatialAnalysis.p_value.toFixed(4)}`
                                            : 'Protest-Poverty Correlation'
                                        }
                                    </p>
                                </div>
                                <Activity className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Correlation Data Analysis */}
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-green-900 text-sm">Ward Analysis</h4>
                                    <p className="text-2xl font-bold text-green-700">
                                        {analyticsData.spatialAnalysis?.sample_size || analyticsData.spatialAnalysis?.correlation_data?.length || 0}
                                    </p>
                                    <p className="text-xs text-green-600">
                                        {analyticsData.spatialAnalysis?.kde_data 
                                            ? 'Sample with KDE Analysis'
                                            : 'Correlation Sample Size'
                                        }
                                    </p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Ward Statistics Overview */}
                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-orange-900 text-sm">Ward Analysis</h4>
                                    <p className="text-2xl font-bold text-orange-700">
                                        {analyticsData.wardStatistics?.total_wards || analyticsData.mergedWards?.features?.length || 0}
                                    </p>
                                    <p className="text-xs text-orange-600">
                                        {analyticsData.wardStatistics?.risk_distribution?.['High Risk'] || 0} High Risk Wards
                                    </p>
                                </div>
                                <MapPin className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Socioeconomic Statistics */}
                    <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-red-900 text-sm">Poverty Analysis</h4>
                                    <p className="text-2xl font-bold text-red-700">
                                        {analyticsData.wardStatistics?.poverty_stats?.mean?.toFixed(1) || 'N/A'}%
                                    </p>
                                    <p className="text-xs text-red-600">
                                        {analyticsData.wardStatistics?.poverty_stats?.std 
                                            ? `±${analyticsData.wardStatistics.poverty_stats.std.toFixed(1)}% std dev`
                                            : 'Average Poverty Rate'
                                        }
                                    </p>
                                </div>
                                <Target className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
            
            {/* Detailed Statistics Panel */}
            {analyticsData.wardStatistics && (
                <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <BarChart3 className="h-6 w-6 text-slate-600" />
                            Comprehensive Ward Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Poverty Statistics */}
                            {analyticsData.wardStatistics.poverty_stats && (
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h5 className="font-semibold text-gray-800 mb-2">Poverty Rate (%)</h5>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Mean:</span>
                                            <span className="font-medium">{analyticsData.wardStatistics.poverty_stats.mean?.toFixed(2)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Median:</span>
                                            <span className="font-medium">{analyticsData.wardStatistics.poverty_stats.median?.toFixed(2)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Std Dev:</span>
                                            <span className="font-medium">{analyticsData.wardStatistics.poverty_stats.std?.toFixed(2)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Range:</span>
                                            <span className="font-medium">
                                                {analyticsData.wardStatistics.poverty_stats.min}% - {analyticsData.wardStatistics.poverty_stats.max}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Count:</span>
                                            <span className="font-medium">{analyticsData.wardStatistics.poverty_stats.count}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Unemployment Statistics */}
                            {analyticsData.wardStatistics.unemployment_stats && (
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h5 className="font-semibold text-gray-800 mb-2">Youth Unemployment (%)</h5>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Mean:</span>
                                            <span className="font-medium">{analyticsData.wardStatistics.unemployment_stats.mean?.toFixed(2)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Median:</span>
                                            <span className="font-medium">{analyticsData.wardStatistics.unemployment_stats.median?.toFixed(2)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Std Dev:</span>
                                            <span className="font-medium">{analyticsData.wardStatistics.unemployment_stats.std?.toFixed(2)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Range:</span>
                                            <span className="font-medium">
                                                {analyticsData.wardStatistics.unemployment_stats.min}% - {analyticsData.wardStatistics.unemployment_stats.max}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Count:</span>
                                            <span className="font-medium">{analyticsData.wardStatistics.unemployment_stats.count}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Population Statistics */}
                            {analyticsData.wardStatistics.population_stats && (
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h5 className="font-semibold text-gray-800 mb-2">Population Density</h5>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Mean:</span>
                                            <span className="font-medium">{analyticsData.wardStatistics.population_stats.mean?.toFixed(0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Median:</span>
                                            <span className="font-medium">{analyticsData.wardStatistics.population_stats.median?.toFixed(0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Std Dev:</span>
                                            <span className="font-medium">{analyticsData.wardStatistics.population_stats.std?.toFixed(0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Range:</span>
                                            <span className="font-medium">
                                                {analyticsData.wardStatistics.population_stats.min?.toLocaleString()} - {analyticsData.wardStatistics.population_stats.max?.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Count:</span>
                                            <span className="font-medium">{analyticsData.wardStatistics.population_stats.count}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Education Statistics */}
                            {analyticsData.wardStatistics.education_stats && (
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h5 className="font-semibold text-gray-800 mb-2">Education Level (Years)</h5>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Mean:</span>
                                            <span className="font-medium">{parseFloat(analyticsData.wardStatistics.education_stats.mean)?.toFixed(1)} years</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Median:</span>
                                            <span className="font-medium">{parseFloat(analyticsData.wardStatistics.education_stats.median)?.toFixed(1)} years</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Std Dev:</span>
                                            <span className="font-medium">{parseFloat(analyticsData.wardStatistics.education_stats.std)?.toFixed(1)} years</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Range:</span>
                                            <span className="font-medium">
                                                {parseFloat(analyticsData.wardStatistics.education_stats.min)?.toFixed(1)} - {parseFloat(analyticsData.wardStatistics.education_stats.max)?.toFixed(1)} years
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Count:</span>
                                            <span className="font-medium">{analyticsData.wardStatistics.education_stats.count}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Slum Housing Statistics */}
                            {analyticsData.wardStatistics.slum_housing_stats && (
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h5 className="font-semibold text-gray-800 mb-2">Slum Housing (%)</h5>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Mean:</span>
                                            <span className="font-medium">{analyticsData.wardStatistics.slum_housing_stats.mean?.toFixed(2)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Median:</span>
                                            <span className="font-medium">{analyticsData.wardStatistics.slum_housing_stats.median?.toFixed(2)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Std Dev:</span>
                                            <span className="font-medium">{analyticsData.wardStatistics.slum_housing_stats.std?.toFixed(2)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Range:</span>
                                            <span className="font-medium">
                                                {analyticsData.wardStatistics.slum_housing_stats.min}% - {analyticsData.wardStatistics.slum_housing_stats.max}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Count:</span>
                                            <span className="font-medium">{analyticsData.wardStatistics.slum_housing_stats.count}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Protest Density Statistics */}
                            {analyticsData.wardStatistics.protest_density_stats && (
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h5 className="font-semibold text-gray-800 mb-2">Protest Density</h5>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Mean:</span>
                                            <span className="font-medium">{analyticsData.wardStatistics.protest_density_stats.mean?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Median:</span>
                                            <span className="font-medium">{analyticsData.wardStatistics.protest_density_stats.median?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Std Dev:</span>
                                            <span className="font-medium">{analyticsData.wardStatistics.protest_density_stats.std?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Range:</span>
                                            <span className="font-medium">
                                                {analyticsData.wardStatistics.protest_density_stats.min} - {analyticsData.wardStatistics.protest_density_stats.max}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Count:</span>
                                            <span className="font-medium">{analyticsData.wardStatistics.protest_density_stats.count}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Risk Distribution */}
                        {analyticsData.wardStatistics.risk_distribution && (
                            <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
                                <h5 className="font-semibold text-gray-800 mb-3">Risk Level Distribution</h5>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {Object.entries(analyticsData.wardStatistics.risk_distribution).map(([level, count]) => (
                                        <div key={level} className="text-center">
                                            <div className="text-lg font-bold text-gray-800">{count}</div>
                                            <div className="text-sm text-gray-600">{level}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Protest Density Distribution */}
                        {analyticsData.wardStatistics.protest_density_distribution && (
                            <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
                                <h5 className="font-semibold text-gray-800 mb-3">Protest Activity Distribution</h5>
                                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                    {Object.entries(analyticsData.wardStatistics.protest_density_distribution).map(([level, count]) => (
                                        <div key={level} className="text-center">
                                            <div className="text-lg font-bold text-gray-800">{count}</div>
                                            <div className="text-sm text-gray-600">{level.replace('_', ' ')}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
            
            {/* Spatial Correlation Data Visualization */}
            {analyticsData.spatialAnalysis?.correlation_data && (
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-100 border-indigo-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Target className="h-6 w-6 text-indigo-600" />
                            Spatial Correlation Analysis Results
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                            Ward-level correlation between protest intensity and {analyticsData.spatialAnalysis.metric?.replace('_', ' ')} 
                            (Sample: {analyticsData.spatialAnalysis.sample_size} wards)
                        </p>
                    </CardHeader>
                    <CardContent>
                        {/* Summary Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                                <div className="text-2xl font-bold text-indigo-700">
                                    {analyticsData.spatialAnalysis.correlation?.toFixed(3)}
                                </div>
                                <div className="text-sm text-gray-600">Correlation Coefficient</div>
                                <div className="text-xs text-gray-500">
                                    {analyticsData.spatialAnalysis.correlation > 0 ? 'Positive' : 'Negative'} Correlation
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                                <div className="text-2xl font-bold text-green-700">
                                    {analyticsData.spatialAnalysis.p_value?.toFixed(4)}
                                </div>
                                <div className="text-sm text-gray-600">P-Value</div>
                                <div className="text-xs text-gray-500">
                                    {analyticsData.spatialAnalysis.p_value < 0.05 ? 'Statistically Significant' : 'Not Significant'}
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                                <div className="text-2xl font-bold text-orange-700">
                                    {analyticsData.spatialAnalysis.correlation_data.length}
                                </div>
                                <div className="text-sm text-gray-600">Data Points</div>
                                <div className="text-xs text-gray-500">Ward Samples</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                                <div className="text-2xl font-bold text-red-700">
                                    {analyticsData.spatialAnalysis.correlation_data.filter(d => d.risk_assessment === 'High Risk').length}
                                </div>
                                <div className="text-sm text-gray-600">High Risk Wards</div>
                                <div className="text-xs text-gray-500">In Sample</div>
                            </div>
                        </div>

                        {/* Top Wards by Risk */}
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <h5 className="font-semibold text-gray-800 mb-4">Top Wards by Protest Intensity</h5>
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {analyticsData.spatialAnalysis.correlation_data
                                    .sort((a, b) => b.protest_intensity - a.protest_intensity)
                                    .slice(0, 10)
                                    .map((ward) => (
                                        <div key={ward.ward_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <div className="font-medium text-sm text-gray-800">
                                                    {ward.ward.split(',')[0]} {/* Ward name only */}
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    {ward.ward.split(',').slice(1).join(',').trim()} {/* Sub-county and county */}
                                                </div>
                                            </div>
                                            <div className="text-right ml-4">
                                                <div className="font-bold text-sm text-gray-800">
                                                    {ward.protest_intensity}
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    Poverty: {ward.socioeconomic_value}%
                                                </div>
                                            </div>
                                            <div className="ml-3">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    ward.risk_assessment === 'Critical Risk' ? 'bg-red-100 text-red-800' :
                                                    ward.risk_assessment === 'High Risk' ? 'bg-orange-100 text-orange-800' :
                                                    ward.risk_assessment === 'Medium Risk' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {ward.risk_assessment}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                        {/* Risk Assessment Distribution from Correlation Data */}
                        <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
                            <h5 className="font-semibold text-gray-800 mb-3">Risk Assessment Distribution (Sample)</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(
                                    analyticsData.spatialAnalysis.correlation_data.reduce((acc, ward) => {
                                        acc[ward.risk_assessment] = (acc[ward.risk_assessment] || 0) + 1;
                                        return acc;
                                    }, {})
                                ).map(([riskLevel, count]) => (
                                    <div key={riskLevel} className="text-center">
                                        <div className="text-lg font-bold text-gray-800">{count}</div>
                                        <div className="text-sm text-gray-600">{riskLevel}</div>
                                        <div className="text-xs text-gray-500">
                                            {((count / analyticsData.spatialAnalysis.correlation_data.length) * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default RiskSurfaceMap;
