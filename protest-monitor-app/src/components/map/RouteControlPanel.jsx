import React, { useState, useEffect } from 'react';
import { Navigation, Truck, Shield, MapPin, X, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { routingService } from '../utils/routingService';

const RouteControlPanel = ({
  data,
  mapRef,
  clickedCoords,
  selectedProtest = null,
  showDeploymentZones,
  setShowDeploymentZones,
  onRouteCreated,
  onRoutesCleared,
  activeRoutes = new Set(), // Add default value
  setActiveRoutes
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [routeSummaries, setRouteSummaries] = useState([]);
  const [routingMode, setRoutingMode] = useState('hospital');
  const [isLoading, setIsLoading] = useState(false);

  // Set up routing service callback when component mounts
  useEffect(() => {
    const handleRouteCalculated = (routeId, summary) => {
      setRouteSummaries(prev => {
        const existingIndex = prev.findIndex(route => route.id === routeId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = { ...summary, id: routeId };
          return updated;
        } else {
          return [...prev, { ...summary, id: routeId }];
        }
      });
    };

    routingService.setRouteCallback(handleRouteCalculated);

    return () => {
      routingService.setRouteCallback(null);
    };
  }, []);

  const handleCreateHospitalRoute = async () => {
    if (!selectedProtest && !clickedCoords) {
      alert('Please select a protest location or click on the map');
      return;
    }

    const map = mapRef.current;
    if (!map) return;

    setIsLoading(true);

    const protestLocation = selectedProtest || {
      geometry: {
        coordinates: [clickedCoords.lng, clickedCoords.lat]
      }
    };

    try {
      const quickestRoute = await routingService.findQuickestHospitalRoute(
        protestLocation,
        data.hospitals,
        map
      );

      if (quickestRoute) {
        const routeId = routingService.createAnimatedRoute(quickestRoute, map, {
          color: '#ef4444',
          weight: 4,
          opacity: 0.8,
          animationSpeed: 3000,
          routeType: 'hospital'
        });

        // Update active routes safely
        if (setActiveRoutes) {
          setActiveRoutes(prev => new Set([...(prev || []), routeId]));
        }
        
        // Notify parent component if callback exists
        if (onRouteCreated) {
          onRouteCreated(routeId);
        }
      }
    } catch (error) {
      console.error('Failed to create hospital route:', error);
      alert('Failed to create hospital route');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePoliceRoutes = async () => {
    if (!selectedProtest && !clickedCoords) {
      alert('Please select a protest location or click on the map');
      return;
    }

    const map = mapRef.current;
    if (!map) return;

    setIsLoading(true);

    const protestLocation = selectedProtest || {
      geometry: {
        coordinates: [clickedCoords.lng, clickedCoords.lat]
      }
    };

    try {
      const deploymentRoutes = await routingService.findPoliceDeploymentRoutes(
        protestLocation,
        data.police,
        map
      );

      const newRouteIds = [];

      deploymentRoutes.forEach((route, index) => {
        const color = route.priority === 'High' ? '#dc2626' :
          route.priority === 'Medium' ? '#f59e0b' : '#10b981';

        const routeId = routingService.createAnimatedRoute(route, map, {
          color: color,
          weight: 3 + (2 - index),
          opacity: 0.8,
          animationSpeed: 2000 + (index * 500),
          routeType: 'police'
        });

        newRouteIds.push(routeId);
        
        // Notify parent component if callback exists
        if (onRouteCreated) {
          onRouteCreated(routeId);
        }
      });

      // Update active routes safely
      if (setActiveRoutes) {
        setActiveRoutes(prev => new Set([...(prev || []), ...newRouteIds]));
      }
    } catch (error) {
      console.error('Failed to create police routes:', error);
      alert('Failed to create police deployment routes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllRoutes = () => {
    const map = mapRef.current;
    if (!map) return;

    routingService.clearAllRoutes(map);
    
    // Update state safely
    if (setActiveRoutes) {
      setActiveRoutes(new Set());
    }
    setRouteSummaries([]);
    
    // Notify parent component if callback exists
    if (onRoutesCleared) {
      onRoutesCleared();
    }
  };

  // Handle clearing individual route
  const handleClearRoute = (routeId) => {
    const map = mapRef.current;
    if (!map) return;

    routingService.clearRoute(routeId, map);
    
    // Update state safely
    if (setActiveRoutes) {
      setActiveRoutes(prev => {
        const newSet = new Set(prev || []);
        newSet.delete(routeId);
        return newSet;
      });
    }
    setRouteSummaries(prev => prev.filter(route => route.id !== routeId));
  };

  // Safe getter for activeRoutes size
  const getActiveRoutesSize = () => {
    return activeRoutes && typeof activeRoutes.size !== 'undefined' ? activeRoutes.size : 0;
  };

  if (!isOpen) {
    return (
      <div className="absolute bottom-2 left-4 z-[1000]">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg"
        >
          <Navigation className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute bottom-2 left-4 z-[1000] w-80">
      <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-white/30">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                <Navigation className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-gray-800">Emergency Routing</CardTitle>
                <p className="text-sm text-gray-600">Response & Deployment</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Route Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Routing Mode</label>
            <div className="flex gap-2">
              <Button
                variant={routingMode === 'hospital' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRoutingMode('hospital')}
                className="flex-1"
              >
                🚑 Hospital
              </Button>
              <Button
                variant={routingMode === 'police' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRoutingMode('police')}
                className="flex-1"
              >
                👮‍♂️ Police
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {routingMode === 'hospital' && (
              <Button
                onClick={handleCreateHospitalRoute}
                disabled={isLoading || !data?.hospitals?.features?.length}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              >
                <Truck className="h-4 w-4 mr-2" />
                {isLoading ? 'Finding Route...' : 'Find Quickest Hospital Route'}
              </Button>
            )}

            {routingMode === 'police' && (
              <Button
                onClick={handleCreatePoliceRoutes}
                disabled={isLoading || !data?.police?.features?.length}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Shield className="h-4 w-4 mr-2" />
                {isLoading ? 'Calculating Routes...' : 'Deploy Police Units'}
              </Button>
            )}

            <Button
              onClick={() => setShowDeploymentZones && setShowDeploymentZones(!showDeploymentZones)}
              variant={showDeploymentZones ? 'default' : 'outline'}
              className="w-full"
              disabled={!setShowDeploymentZones}
            >
              <MapPin className="h-4 w-4 mr-2" />
              {showDeploymentZones ? 'Hide' : 'Show'} Priority Zones
            </Button>

            {getActiveRoutesSize() > 0 && (
              <Button
                onClick={handleClearAllRoutes}
                variant="destructive"
                className="w-full"
              >
                <Square className="h-4 w-4 mr-2" />
                Clear All Routes ({getActiveRoutesSize()})
              </Button>
            )}
          </div>

          {/* Route Summaries */}
          {routeSummaries.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 text-sm">Route Summary</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {routeSummaries.map((summary, index) => (
                  <div key={summary.id} className={`p-2 rounded text-xs ${
                    summary.type === 'hospital' 
                      ? 'bg-red-50 border border-red-200' 
                      : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">
                        {summary.type === 'hospital' ? '🚑' : '👮‍♂️'} 
                        {summary.destination || `Route ${index + 1}`}
                      </span>
                      <div className="flex items-center gap-1">
                        {summary.priority && (
                          <Badge variant="secondary" className="text-xs">
                            {summary.priority}
                          </Badge>
                        )}
                        <button
                          onClick={() => handleClearRoute(summary.id)}
                          className="text-red-500 hover:text-red-700 ml-1"
                          title="Clear this route"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-gray-600">
                      📍 {summary.distance} km • ⏱️ {summary.formattedTime}
                    </div>
                    {summary.arrivalTime && (
                      <div className="text-gray-500 text-xs mt-1">
                        ETA: {summary.arrivalTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Location Status */}
          {(selectedProtest || clickedCoords) && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-2 text-green-700 text-sm">
                <MapPin className="h-4 w-4" />
                <div className="flex-1">
                  {selectedProtest ? (
                    <div>
                      <span className="font-medium">
                        📢 {selectedProtest.properties?.location || selectedProtest.properties?.name || 'Protest Event'}
                      </span>
                      {selectedProtest.properties?.date && (
                        <div className="text-xs text-green-600">
                          Date: {selectedProtest.properties.date}
                        </div>
                      )}
                      {selectedProtest.properties?.severity && (
                        <div className="text-xs text-green-600">
                          Severity: {selectedProtest.properties.severity}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="font-medium">
                      Coordinates: {clickedCoords.lat.toFixed(4)}, {clickedCoords.lng.toFixed(4)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Data Status */}
          {(!data?.hospitals?.features?.length || !data?.police?.features?.length) && (
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              ⚠️ {!data?.hospitals?.features?.length && 'Hospital data'} 
              {!data?.hospitals?.features?.length && !data?.police?.features?.length && ' and '}
              {!data?.police?.features?.length && 'Police data'} not loaded
            </div>
          )}

          {/* Active Routes Info */}
          {getActiveRoutesSize() > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700">Statistics</h4>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary">{getActiveRoutesSize()} route(s) active</Badge>
                {routeSummaries.length > 0 && (
                  <Badge variant="outline">
                    {routeSummaries.reduce((sum, route) => sum + parseFloat(route.distance || 0), 0).toFixed(1)} km total
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RouteControlPanel;