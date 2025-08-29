import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, LayersControl, Marker, Popup } from 'react-leaflet';
import { Search, Download, Maximize, Minimize, Navigation, Crosshair } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Components
import MapStatistics from './MapStatistics';
import LayerControlPanel from './LayerControlPanel';
import LocationControl from './LocationControl';
import MapClickHandler from './MapClickHandler';
import QuickActionsPanel from './QuickActionsPanel';
import SearchResultsPanel from './SearchResultsPanel';
import MapLayers from './MapLayers';
import LoadingScreen from './LoadingScreen';
import AnalysisVisualization from './AnalysisVisualization';
import AnalysisControlPanel from './AnalysisControlPanel';
import RouteControlPanel from './RouteControlPanel';
import PriorityDeploymentZones from './PriorityDeploymentZones';
import RouteSummaryDisplay from './RouteSummaryDisplay';

// Utils
import { mapDataStore } from '../utils/mapDataStore';
import { routingService } from '../utils/routingService';
import { basemaps } from '../utils/mapConstants';
import { calculateSpatialMetrics } from '../utils/spatialAnalysis';
import { runSpatialAnalysis } from '../utils/spatialAnalysisRunner';
import { fetchMapData } from '../utils/dataFetcher';

import './routing-styles.css';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const EnhancedNairobiMap = () => {
    // State management
    const [data, setData] = useState(mapDataStore.data || {
        roads: null, wards: null, hospitals: null, police: null, protests: null
    });

    const [layers, setLayers] = useState(mapDataStore.layers || {
        roads: { visible: true, icon: '🛣️', label: 'Road Network', count: 0 },
        wards: { visible: true, icon: '🏛️', label: 'Admin Wards', count: 0 },
        hospitals: { visible: false, icon: '🏥', label: 'Hospitals', count: 0 },
        police: { visible: false, icon: '👮', label: 'Police Stations', count: 0 },
        protests: { visible: true, icon: '📢', label: 'Protest Events', count: 0 }
    });

    const [loading, setLoading] = useState(!mapDataStore.isLoaded);
    const [error, setError] = useState(mapDataStore.error);
    const [searchTerm, setSearchTerm] = useState('');
    const [clickedCoords, setClickedCoords] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [basemap, setBasemap] = useState('osm');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [spatialAnalysis, setSpatialAnalysis] = useState({
        isRunning: false, results: null, type: null
    });
    const [spatialMetrics, setSpatialMetrics] = useState(null);
    const [showDeploymentZones, setShowDeploymentZones] = useState(false);
    const [selectedProtest, setSelectedProtest] = useState(null);
    const [routeSummaries, setRouteSummaries] = useState([]);
    const [activeRoutes, setActiveRoutes] = useState(new Set());

    const mapRef = useRef();

    // Data fetching effect
    useEffect(() => {
        if (mapDataStore.isLoaded) {
            setData(mapDataStore.data);
            setLayers(mapDataStore.layers);
            setLoading(false);
            setError(mapDataStore.error);
            if (mapDataStore.data) {
                const metrics = calculateSpatialMetrics(mapDataStore.data);
                setSpatialMetrics(metrics);
            }
            return;
        }

        fetchMapData(setLoading, setError, setData, setLayers, layers, setSpatialMetrics);
    }, [layers]);

    useEffect(() => {
        // Set up routing service callback to update route summaries
        routingService.setRouteCallback((routeId, summary) => {
            setRouteSummaries(prev => {
                // Check if route already exists, if so update it, otherwise add it
                const existingIndex = prev.findIndex(route => route.id === routeId);
                if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = { ...summary, id: routeId };
                    return updated;
                } else {
                    return [...prev, { ...summary, id: routeId }];
                }
            });
        });

        // Cleanup function
        return () => {
            routingService.setRouteCallback(null);
        };
    }, []);

    // Event handlers
    const handleMapClick = useCallback((latlng) => {
        setClickedCoords(latlng);
    }, []);

    const handleLayerToggle = useCallback((layerKey) => {
        setLayers(prev => {
            const newLayers = {
                ...prev,
                [layerKey]: { ...prev[layerKey], visible: !prev[layerKey].visible }
            };
            mapDataStore.layers = newLayers;
            return newLayers;
        });
    }, []);

    const handleSpatialAnalysis = useCallback(async (analysisType) => {
        await runSpatialAnalysis(analysisType, data, spatialMetrics, setSpatialAnalysis);
    }, [data, spatialMetrics]);

    const handleExportData = useCallback(() => {
        const exportData = {
            timestamp: new Date().toISOString(),
            location: 'Nairobi, Kenya',
            statistics: Object.fromEntries(Object.entries(layers).map(([key, layer]) => [key, layer.count])),
            spatialMetrics,
            clickedLocation: clickedCoords ? {
                latitude: clickedCoords.lat.toFixed(6),
                longitude: clickedCoords.lng.toFixed(6)
            } : null,
            userLocation: userLocation ? {
                latitude: userLocation.lat.toFixed(6),
                longitude: userLocation.lng.toFixed(6)
            } : null,
            activeLayers: Object.entries(layers).filter(([, layer]) => layer.visible).map(([key]) => key),
            analysisResults: spatialAnalysis.results
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nairobi-gis-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [layers, spatialMetrics, clickedCoords, userLocation, spatialAnalysis]);

    const toggleFullscreen = useCallback(() => {
        if (!isFullscreen) {
            const element = document.documentElement;
            if (element.requestFullscreen) element.requestFullscreen();
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
        setIsFullscreen(prev => !prev);
    }, [isFullscreen]);

    const handleProtestSelect = useCallback((protest) => {
        setSelectedProtest(protest);
        setClickedCoords({
            lat: protest.geometry.coordinates[1],
            lng: protest.geometry.coordinates[0]
        });
        console.log('Protest selected for routing:', protest);
    }, []);

    const handleRouteCreated = useCallback((routeId) => {
        setActiveRoutes(prev => new Set([...prev, routeId]));
    }, []);

    const handleRoutesCleared = useCallback(() => {
        setActiveRoutes(new Set());
        setRouteSummaries([]);
    }, []);

    // Fullscreen event listeners
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    if (loading) {
        return <LoadingScreen />;
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-rose-50">
                <Alert className="max-w-md bg-white/90 backdrop-blur-xl border-red-200/50 shadow-2xl">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                    <AlertDescription>
                        <div className="space-y-4">
                            <h3 className="font-bold text-red-700 text-lg">Connection Error</h3>
                            <p className="text-red-600">{error}</p>
                            <p className="text-sm text-gray-600">Please check your connection and ensure the GIS server is running.</p>
                            <button
                                onClick={() => {
                                    mapDataStore.isLoaded = false;
                                    mapDataStore.error = null;
                                    window.location.reload();
                                }}
                                className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                            >
                                Retry Loading
                            </button>
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        );


    }

    return (
        <div className={`relative w-full  h-full bg-gradient-to-br from-slate-50 to-slate-100 ${isFullscreen ? 'fixed inset-0 z-[9999] bg-black' : ''}`}>
            {/* Enhanced Control Bar */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1001]">
                <div className="flex items-center gap-4 bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl p-4 border border-white/30">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search locations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-64 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm"
                        />
                    </div>

                    {/* Basemap Selector */}
                    <select
                        value={basemap}
                        onChange={(e) => setBasemap(e.target.value)}
                        className="px-4 py-2 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white/80 backdrop-blur-sm font-medium"
                    >
                        {Object.entries(basemaps).map(([key, map]) => (
                            <option key={key} value={key}>{map.label}</option>
                        ))}
                    </select>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportData}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium group"
                        >
                            <Download size={16} className="group-hover:scale-110 transition-transform" />
                            Export
                        </button>
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl group"
                        >
                            {isFullscreen ? <Minimize size={16} className="group-hover:scale-110 transition-transform" /> : <Maximize size={16} className="group-hover:scale-110 transition-transform" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Map Container */}
            <div className="relative w-full h-full">
                <MapContainer
                    center={[-1.2921, 36.8219]}
                    zoom={11}
                    scrollWheelZoom={true}
                    style={{ height: '110%', width: '100%' }}
                    ref={mapRef}
                    className="rounded-2xl"
                    zoomControl={false}
                    attributionControl={false}
                >
                    <TileLayer
                        attribution={basemaps[basemap]}
                        url={basemaps[basemap].url}
                    />

                    <MapClickHandler onMapClick={handleMapClick} />
                    <LocationControl onLocationFound={setUserLocation} />
                    <MapLayers data={data} layers={layers} onProtestSelect={handleProtestSelect} selectedProtest={selectedProtest} />
                    <AnalysisVisualization spatialAnalysis={spatialAnalysis} />
                    <PriorityDeploymentZones
                        protests={data.protests}
                        policeStations={data.police}
                        showZones={showDeploymentZones}
                    />
                    {/* User Location Marker */}
                    {userLocation && (
                        <Marker position={[userLocation.lat, userLocation.lng]}>
                            <Popup className="custom-popup">
                                <div className="p-3 min-w-[180px]">
                                    <h4 className="font-bold text-green-600 mb-2 flex items-center gap-2">
                                        <Navigation size={16} />
                                        Your Location
                                    </h4>
                                    <div className="space-y-1 text-sm">
                                        <p><strong>Lat:</strong> {userLocation.lat.toFixed(6)}</p>
                                        <p><strong>Lng:</strong> {userLocation.lng.toFixed(6)}</p>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Clicked Location Marker */}
                    {clickedCoords && (
                        <Marker position={[clickedCoords.lat, clickedCoords.lng]}>
                            <Popup className="custom-popup">
                                <div className="p-3 min-w-[200px]">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-bold text-blue-600 flex items-center gap-2">
                                            <Crosshair size={16} />
                                            Selected Point
                                        </h4>
                                        <button
                                            onClick={() => setClickedCoords(null)}
                                            className="text-red-500 hover:text-red-700 transition-colors text-lg font-bold"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-semibold">Latitude:</span> {clickedCoords.lat.toFixed(6)}</p>
                                        <p><span className="font-semibold">Longitude:</span> {clickedCoords.lng.toFixed(6)}</p>
                                    </div>
                                    <div className="mt-3 pt-2 border-t border-gray-200">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${clickedCoords.lat.toFixed(6)}, ${clickedCoords.lng.toFixed(6)}`);
                                                alert('Coordinates copied to clipboard!');
                                            }}
                                            className="text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium"
                                        >
                                            📋 Copy coordinates
                                        </button>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>

                {/* Component Panels */}
                <MapStatistics data={data} isLoading={loading} spatialMetrics={spatialMetrics} />
                <LayerControlPanel
                    layers={layers}
                    onLayerToggle={handleLayerToggle}
                    spatialAnalysis={spatialAnalysis}
                    onSpatialAnalysis={handleSpatialAnalysis}
                />
                <QuickActionsPanel
                    mapRef={mapRef}
                    setClickedCoords={setClickedCoords}
                    setUserLocation={setUserLocation}
                />
                <SearchResultsPanel searchTerm={searchTerm} />
                <AnalysisControlPanel
                    spatialAnalysis={spatialAnalysis}
                    onClearAnalysis={() => setSpatialAnalysis({ isRunning: false, results: null, type: null })}
                />
                <RouteControlPanel
                    data={data}
                    mapRef={mapRef}
                    clickedCoords={clickedCoords}
                    selectedProtest={selectedProtest}
                    showDeploymentZones={showDeploymentZones}
                    setShowDeploymentZones={setShowDeploymentZones}
                    onRouteCreated={handleRouteCreated}
                    onRoutesCleared={handleRoutesCleared}
                    activeRoutes={activeRoutes}
                    setActiveRoutes={setActiveRoutes}
                />
                <RouteSummaryDisplay
                    activeRoutes={activeRoutes}
                    routeSummaries={routeSummaries}
                />
                {/* Bottom Status Panel */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[1000]">
                    <div className="bg-slate-900/95 backdrop-blur-xl rounded-xl px-4 py-2 flex items-center gap-3 shadow-lg border border-slate-700/50">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-white text-xs font-medium">Live</span>
                        </div>
                        <div className="h-4 w-px bg-slate-600"></div>
                        <div className="text-slate-300 text-xs">
                            <span className="text-white font-medium">
                                {Object.values(layers).reduce((sum, layer) => sum + layer.count, 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedNairobiMap;