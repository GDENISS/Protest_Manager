import L from 'leaflet';
import 'leaflet-routing-machine';

export class RoutingService {
  constructor() {
    this.activeRoutes = new Map();
    this.routeAnimations = new Map();
    this.routeSummaries = new Map(); // Store route summaries for callbacks
    this.onRouteCalculated = null; // Callback for when route is calculated
  }

  // Set callback for route calculation updates
  setRouteCallback(callback) {
    this.onRouteCalculated = callback;
  }

  // Find quickest route to hospital from protest location
  async findQuickestHospitalRoute(protestLocation, hospitals, map) {
    if (!hospitals?.features?.length) return null;

    const protestPoint = protestLocation.geometry ? 
      protestLocation.geometry.coordinates : 
      [protestLocation.lng, protestLocation.lat];

    let quickestRoute = null;
    let shortestDistance = Infinity;

    // Find nearest hospital
    hospitals.features.forEach(hospital => {
      const hospitalCoords = hospital.geometry.coordinates;
      const distance = this.calculateDistance(
        protestPoint[1], protestPoint[0],
        hospitalCoords[1], hospitalCoords[0]
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        quickestRoute = {
          hospital,
          distance,
          start: [protestPoint[1], protestPoint[0]],
          end: [hospitalCoords[1], hospitalCoords[0]]
        };
      }
    });

    return quickestRoute;
  }

  // Find best police deployment routes
  async findPoliceDeploymentRoutes(protestLocation, policeStations, map) {
    if (!policeStations?.features?.length) return [];

    const protestPoint = protestLocation.geometry ? 
      protestLocation.geometry.coordinates : 
      [protestLocation.lng, protestLocation.lat];

    const routes = policeStations.features
      .map(station => {
        const stationCoords = station.geometry.coordinates;
        const distance = this.calculateDistance(
          protestPoint[1], protestPoint[0],
          stationCoords[1], stationCoords[0]
        );

        return {
          station,
          distance,
          start: [stationCoords[1], stationCoords[0]],
          end: [protestPoint[1], protestPoint[0]],
          priority: this.calculatePriority(distance, station.properties)
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3); // Get 3 nearest stations

    return routes;
  }

  // Create animated route
  createAnimatedRoute(routeData, map, options = {}) {
    const {
      color = '#ef4444',
      weight = 4,
      opacity = 0.8,
      animationSpeed = 2000,
      routeType = 'emergency'
    } = options;

    const routeId = `route_${Date.now()}_${Math.random()}`;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(routeData.start[0], routeData.start[1]),
        L.latLng(routeData.end[0], routeData.end[1])
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      createMarker: () => null,
      lineOptions: {
        styles: [{
          color: color,
          weight: weight,
          opacity: 0.2
        }]
      },
      show: false,
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      })
    });

    routingControl.on('routesfound', (e) => {
      const route = e.routes[0];
      
      // Store route summary
      const summary = this.getRouteSummary(route, routeType, routeData);
      this.routeSummaries.set(routeId, summary);
      
      // Call callback if set
      if (this.onRouteCalculated) {
        this.onRouteCalculated(routeId, summary);
      }
      
      this.animateRoute(route, map, {
        color,
        weight,
        opacity,
        animationSpeed,
        routeType,
        routeId,
        routeData
      });
    });

    routingControl.addTo(map);
    this.activeRoutes.set(routeId, routingControl);

    return routeId;
  }

  // Animate route drawing
  animateRoute(route, map, options) {
    const { color, weight, opacity, animationSpeed, routeType, routeId, routeData } = options;
    const coordinates = route.coordinates;

    let currentIndex = 0;
    const animatedCoords = [];

    const animationLine = L.polyline([], {
      color: color,
      weight: weight,
      opacity: opacity,
      className: `route-animation ${routeType}`
    }).addTo(map);

    // Add start marker
    const startMarker = this.createRouteMarker(
      routeData.start, 
      routeType === 'hospital' ? '🚑' : '👮‍♂️', 
      routeType === 'hospital' ? 'Emergency Route Start' : 'Police Deployment'
    ).addTo(map);

    // Add end marker
    const endMarker = this.createRouteMarker(
      routeData.end, 
      routeType === 'hospital' ? '🏥' : '📢', 
      routeType === 'hospital' ? 'Hospital Destination' : 'Protest Location'
    ).addTo(map);

    const animate = () => {
      if (currentIndex < coordinates.length) {
        animatedCoords.push([coordinates[currentIndex].lat, coordinates[currentIndex].lng]);
        animationLine.setLatLngs(animatedCoords);
        currentIndex++;
        
        setTimeout(animate, animationSpeed / coordinates.length);
      } else {
        this.addRouteInfoPopup(animationLine, routeData, route, routeType);
      }
    };

    animate();

    this.routeAnimations.set(routeId, {
      line: animationLine,
      startMarker,
      endMarker,
      routeControl: this.activeRoutes.get(routeId)
    });
  }

  createRouteMarker(coords, icon, title) {
    const customIcon = L.divIcon({
      html: `<div class="w-8 h-8 bg-white border-2 border-gray-800 rounded-full flex items-center justify-center text-lg shadow-lg">${icon}</div>`,
      className: 'custom-route-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    return L.marker(coords, { icon: customIcon, title });
  }

  // Enhanced route info popup with better formatting
  addRouteInfoPopup(polyline, routeData, route, routeType) {
    const distance = (route.summary.totalDistance / 1000).toFixed(2);
    const timeMinutes = Math.round(route.summary.totalTime / 60);
    const timeHours = Math.floor(timeMinutes / 60);
    const remainingMinutes = timeMinutes % 60;
    
    // Format time display
    const formattedTime = timeHours > 0 
      ? `${timeHours}h ${remainingMinutes}m`
      : `${timeMinutes} min`;

    // Calculate estimated arrival time
    const arrivalTime = new Date(Date.now() + route.summary.totalTime * 1000);
    const arrivalTimeString = arrivalTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    const popupContent = routeType === 'hospital' ? 
      `<div class="p-4 min-w-[250px] font-sans">
        <h4 class="font-bold text-red-600 mb-3 flex items-center gap-2 text-lg">
          🚑 Emergency Medical Route
        </h4>
        <div class="space-y-2 text-sm">
          <div class="bg-red-50 p-3 rounded-lg border border-red-200">
            <p class="font-semibold text-red-800">🏥 Destination</p>
            <p class="text-red-700">${routeData.hospital?.properties?.name || 'Nearest Hospital'}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-blue-50 p-2 rounded text-center">
              <p class="text-xs text-blue-600 font-medium">DISTANCE</p>
              <p class="text-lg font-bold text-blue-800">${distance} km</p>
            </div>
            <div class="bg-orange-50 p-2 rounded text-center">
              <p class="text-xs text-orange-600 font-medium">TIME</p>
              <p class="text-lg font-bold text-orange-800">${formattedTime}</p>
            </div>
          </div>
          
          <div class="bg-green-50 p-2 rounded-lg border border-green-200">
            <p class="text-xs text-green-600 font-medium">ESTIMATED ARRIVAL</p>
            <p class="text-green-800 font-bold">${arrivalTimeString}</p>
          </div>
          
          <div class="mt-3 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-800">
            <p class="font-bold">⚠️ EMERGENCY RESPONSE</p>
            <p>Priority medical transport route</p>
          </div>
        </div>
      </div>` :
      `<div class="p-4 min-w-[250px] font-sans">
        <h4 class="font-bold text-blue-600 mb-3 flex items-center gap-2 text-lg">
          👮‍♂️ Police Deployment Route
        </h4>
        <div class="space-y-2 text-sm">
          <div class="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p class="font-semibold text-blue-800">🚔 From Station</p>
            <p class="text-blue-700">${routeData.station?.properties?.name || 'Police Station'}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-green-50 p-2 rounded text-center">
              <p class="text-xs text-green-600 font-medium">DISTANCE</p>
              <p class="text-lg font-bold text-green-800">${distance} km</p>
            </div>
            <div class="bg-purple-50 p-2 rounded text-center">
              <p class="text-xs text-purple-600 font-medium">TIME</p>
              <p class="text-lg font-bold text-purple-800">${formattedTime}</p>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-yellow-50 p-2 rounded text-center">
              <p class="text-xs text-yellow-600 font-medium">PRIORITY</p>
              <p class="text-sm font-bold ${routeData.priority === 'High' ? 'text-red-600' : 
                routeData.priority === 'Medium' ? 'text-orange-600' : 'text-green-600'}">${routeData.priority}</p>
            </div>
            <div class="bg-blue-50 p-2 rounded text-center">
              <p class="text-xs text-blue-600 font-medium">ETA</p>
              <p class="text-sm font-bold text-blue-800">${arrivalTimeString}</p>
            </div>
          </div>
          
          <div class="mt-3 p-2 ${routeData.priority === 'High' ? 'bg-red-100 border-red-300 text-red-800' :
            routeData.priority === 'Medium' ? 'bg-orange-100 border-orange-300 text-orange-800' :
            'bg-green-100 border-green-300 text-green-800'} border rounded text-xs">
            <p class="font-bold">${routeData.priority === 'High' ? '🚨 HIGH PRIORITY DEPLOYMENT' :
              routeData.priority === 'Medium' ? '⚠️ MEDIUM PRIORITY DEPLOYMENT' :
              '✅ STANDARD DEPLOYMENT'}</p>
          </div>
        </div>
      </div>`;

    polyline.bindPopup(popupContent);
  }

  // Get route summary for external use
  getRouteSummary(route, routeType, routeData) {
    const distance = (route.summary.totalDistance / 1000).toFixed(2);
    const timeMinutes = Math.round(route.summary.totalTime / 60);
    const timeHours = Math.floor(timeMinutes / 60);
    const remainingMinutes = timeMinutes % 60;
    
    const formattedTime = timeHours > 0 
      ? `${timeHours}h ${remainingMinutes}m`
      : `${timeMinutes} min`;
    
    const arrivalTime = new Date(Date.now() + route.summary.totalTime * 1000);
    
    return {
      type: routeType,
      distance: distance,
      distanceMeters: route.summary.totalDistance,
      timeMinutes: timeMinutes,
      timeSeconds: route.summary.totalTime,
      formattedTime: formattedTime,
      arrivalTime: arrivalTime,
      destination: routeType === 'hospital' 
        ? routeData.hospital?.properties?.name || 'Nearest Hospital'
        : routeData.station?.properties?.name || 'Police Station',
      priority: routeData.priority || null,
      coordinates: route.coordinates
    };
  }

  // Get all active route summaries
  getAllRouteSummaries() {
    return Array.from(this.routeSummaries.values());
  }

  // Get specific route summary
  getRouteSummaryById(routeId) {
    return this.routeSummaries.get(routeId);
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  calculatePriority(distance, stationProperties) {
    // Enhanced priority calculation
    if (distance < 1.5) return 'High';
    if (distance < 3) return 'Medium';
    if (distance < 5) return 'Low';
    return 'Very Low';
  }

  // Calculate estimated speed based on route type and priority
  calculateEstimatedSpeed(routeType, priority = null) {
    if (routeType === 'hospital') {
      return 60; // Emergency vehicles - 60 km/h average in city
    } else {
      // Police deployment speeds
      switch (priority) {
        case 'High': return 50; // High priority - 50 km/h
        case 'Medium': return 40; // Medium priority - 40 km/h
        default: return 35; // Standard - 35 km/h
      }
    }
  }

  clearRoute(routeId, map) {
    const animation = this.routeAnimations.get(routeId);
    const routeControl = this.activeRoutes.get(routeId);

    if (animation) {
      map.removeLayer(animation.line);
      map.removeLayer(animation.startMarker);
      map.removeLayer(animation.endMarker);
      this.routeAnimations.delete(routeId);
    }

    if (routeControl) {
      map.removeControl(routeControl);
      this.activeRoutes.delete(routeId);
    }

    // Remove route summary
    this.routeSummaries.delete(routeId);
  }

  clearAllRoutes(map) {
    this.routeAnimations.forEach((animation, routeId) => {
      this.clearRoute(routeId, map);
    });
    this.activeRoutes.clear();
    this.routeAnimations.clear();
    this.routeSummaries.clear();
  }

  // Get total statistics for all routes
  getTotalStatistics() {
    const summaries = this.getAllRouteSummaries();
    if (summaries.length === 0) return null;

    const totalDistance = summaries.reduce((sum, route) => sum + parseFloat(route.distance), 0);
    const totalTime = summaries.reduce((sum, route) => sum + route.timeMinutes, 0);
    const hospitalRoutes = summaries.filter(route => route.type === 'hospital').length;
    const policeRoutes = summaries.filter(route => route.type === 'police').length;

    return {
      totalRoutes: summaries.length,
      totalDistance: totalDistance.toFixed(2),
      totalTime: totalTime,
      hospitalRoutes,
      policeRoutes,
      averageDistance: (totalDistance / summaries.length).toFixed(2),
      averageTime: Math.round(totalTime / summaries.length)
    };
  }
}

export const routingService = new RoutingService();