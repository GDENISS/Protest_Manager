import React from 'react';
import { GeoJSON } from 'react-leaflet';
import * as turf from '@turf/turf';

const PriorityDeploymentZones = ({ protests, policeStations, showZones }) => {
  if (!showZones || !protests?.features || !policeStations?.features) {
    return null;
  }

  const createDeploymentZones = () => {
    const zones = [];

    protests.features.forEach((protest, index) => {
      const protestPoint = protest.geometry.coordinates;
      
      // Create priority zones around protest
      const highPriorityZone = turf.circle(
        turf.point(protestPoint), 
        1, 
        { units: 'kilometers' }
      );
      
      const mediumPriorityZone = turf.circle(
        turf.point(protestPoint), 
        2, 
        { units: 'kilometers' }
      );

      const lowPriorityZone = turf.circle(
        turf.point(protestPoint), 
        3, 
        { units: 'kilometers' }
      );

      zones.push(
        {
          zone: highPriorityZone,
          priority: 'high',
          protest: protest,
          id: `high_${index}`
        },
        {
          zone: mediumPriorityZone,
          priority: 'medium',
          protest: protest,
          id: `medium_${index}`
        },
        {
          zone: lowPriorityZone,
          priority: 'low',
          protest: protest,
          id: `low_${index}`
        }
      );
    });

    return zones;
  };

  const getZoneStyle = (priority) => {
    const styles = {
      high: {
        color: '#dc2626',
        fillColor: '#fecaca',
        fillOpacity: 0.3,
        weight: 2,
        dashArray: '5, 5'
      },
      medium: {
        color: '#f59e0b',
        fillColor: '#fed7aa',
        fillOpacity: 0.2,
        weight: 2,
        dashArray: '10, 5'
      },
      low: {
        color: '#10b981',
        fillColor: '#bbf7d0',
        fillOpacity: 0.1,
        weight: 1,
        dashArray: '15, 10'
      }
    };

    return styles[priority];
  };

  const getZonePopup = (zoneData) => {
    const { priority, protest } = zoneData;
    
    return `
      <div class="p-3 min-w-[200px] font-sans">
        <h4 class="font-bold text-gray-800 mb-2 flex items-center gap-2">🚨 ${priority.toUpperCase()} Priority Zone</h4>
        <div class="space-y-1 text-sm text-gray-600">
          <p><strong>Protest:</strong> ${protest.properties?.location || 'Protest Event'}</p>
          <p><strong>Deployment Priority:</strong> ${priority}</p>
          <p><strong>Response Time:</strong> ${
            priority === 'high' ? '< 5 minutes' :
            priority === 'medium' ? '5-10 minutes' :
            '10-15 minutes'
          }</p>
        </div>
        <div class="mt-2 p-2 rounded text-xs font-medium ${
          priority === 'high' ? 'bg-red-50 text-red-700 border border-red-200' :
          priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
          'bg-green-50 text-green-700 border border-green-200'
        }">
          ${priority === 'high' ? '🔴 Immediate Response Required' :
            priority === 'medium' ? '🟡 Elevated Response' :
            '🟢 Standard Response'}
        </div>
      </div>
    `;
  };

  const zones = createDeploymentZones();

  return (
    <>
      {zones.map((zoneData) => (
        <GeoJSON
          key={zoneData.id}
          data={zoneData.zone}
          style={() => getZoneStyle(zoneData.priority)}
          onEachFeature={(feature, layer) => {
            layer.bindPopup(getZonePopup(zoneData));
            
            layer.on({
              mouseover: (e) => {
                e.target.setStyle({
                  fillOpacity: 0.5,
                  weight: 3
                });
              },
              mouseout: (e) => {
                e.target.setStyle(getZoneStyle(zoneData.priority));
              }
            });
          }}
        />
      ))}
    </>
  );
};

export default PriorityDeploymentZones;