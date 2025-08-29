import React from 'react';
import { GeoJSON } from 'react-leaflet';
import L from 'leaflet';

const AnalysisVisualization = ({ spatialAnalysis }) => {
  if (!spatialAnalysis.results?.geometries || spatialAnalysis.results.geometries.length === 0) {
    return null;
  }

  const getAnalysisStyle = (feature) => {
    const { analysisType } = feature.properties;
    
    const styles = {
      buffer: {
        color: '#3b82f6',
        fillColor: '#93c5fd',
        fillOpacity: 0.3,
        weight: 2,
        dashArray: '5, 5'
      },
      proximity: {
        color: '#ef4444',
        weight: 3,
        opacity: 0.8,
        dashArray: '10, 5'
      },
      density: (feature) => {
        const density = feature.properties.density;
        const maxDensity = 10; // Adjust based on your data
        const opacity = Math.min(density / maxDensity, 1);
        
        return {
          color: '#f59e0b',
          fillColor: density > 5 ? '#dc2626' : density > 2 ? '#f59e0b' : '#10b981',
          fillOpacity: 0.4 + (opacity * 0.4),
          weight: 2,
          opacity: 0.8
        };
      },
      hotspot: {
        color: '#dc2626',
        fillColor: '#fca5a5',
        fillOpacity: 0.4,
        weight: 3,
        dashArray: '8, 4'
      }
    };

    if (analysisType === 'density' && typeof styles[analysisType] === 'function') {
      return styles[analysisType](feature);
    }
    
    return styles[analysisType] || styles.buffer;
  };

  const getPopupContent = (feature) => {
    const { properties } = feature;
    const { analysisType } = properties;

    const popupTemplates = {
      buffer: `
        <div class="p-3 min-w-[200px]">
          <h4 class="font-bold text-blue-600 mb-2">🛡️ Hospital Buffer Zone</h4>
          <div class="space-y-1 text-sm">
            <p><strong>Hospital:</strong> ${properties.hospitalName}</p>
            <p><strong>Coverage Radius:</strong> ${properties.bufferRadius}</p>
            <p class="text-blue-600 text-xs mt-2">This area is within ${properties.bufferRadius} of hospital services</p>
          </div>
        </div>
      `,
      proximity: `
        <div class="p-3 min-w-[200px]">
          <h4 class="font-bold text-red-600 mb-2">🔗 Proximity Connection</h4>
          <div class="space-y-1 text-sm">
            <p><strong>Protest:</strong> ${properties.protestLocation}</p>
            <p><strong>Police Station:</strong> ${properties.policeStation}</p>
            <p><strong>Distance:</strong> ${properties.distance} km</p>
            <p class="text-red-600 text-xs mt-2">⚠️ Protest within 2km of police station</p>
          </div>
        </div>
      `,
      density: `
        <div class="p-3 min-w-[200px]">
          <h4 class="font-bold text-orange-600 mb-2">📊 Density Zone</h4>
          <div class="space-y-1 text-sm">
            <p><strong>Protest Count:</strong> ${properties.density}</p>
            <p><strong>Density:</strong> ${properties.densityPerKm2} protests/km²</p>
            <p><strong>Area:</strong> ${properties.area?.toFixed(2)} km²</p>
            <div class="mt-2 p-2 rounded text-xs ${
              properties.density > 5 ? 'bg-red-50 text-red-700' :
              properties.density > 2 ? 'bg-yellow-50 text-yellow-700' :
              'bg-green-50 text-green-700'
            }">
              ${properties.density > 5 ? '🔥 High Density' :
                properties.density > 2 ? '⚠️ Medium Density' :
                '✅ Low Density'}
            </div>
          </div>
        </div>
      `,
      hotspot: `
        <div class="p-3 min-w-[200px]">
          <h4 class="font-bold text-red-600 mb-2">🔥 Protest Hotspot</h4>
          <div class="space-y-1 text-sm">
            <p><strong>Hotspot #:</strong> ${properties.hotspotId}</p>
            <p><strong>Protests in Area:</strong> ${properties.protestCount}</p>
            <p><strong>Intensity:</strong> ${properties.intensity}</p>
            <p><strong>Radius:</strong> ${properties.radius}</p>
            <div class="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              🚨 High concentration of protest activity
            </div>
          </div>
        </div>
      `
    };

    return popupTemplates[analysisType] || '<div class="p-3"><p>Analysis Result</p></div>';
  };

  return (
    <>
      {spatialAnalysis.results.geometries.map((geometry, index) => (
        <GeoJSON
          key={`${spatialAnalysis.type}_${geometry.properties.id || index}`}
          data={geometry}
          style={getAnalysisStyle}
          onEachFeature={(feature, layer) => {
            layer.bindPopup(getPopupContent(feature));
            
            // Add hover effects
            layer.on({
              mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                  weight: 4,
                  opacity: 1,
                  fillOpacity: 0.6
                });
              },
              mouseout: (e) => {
                const layer = e.target;
                layer.setStyle(getAnalysisStyle(feature));
              }
            });
          }}
        />
      ))}
    </>
  );
};

export default AnalysisVisualization;