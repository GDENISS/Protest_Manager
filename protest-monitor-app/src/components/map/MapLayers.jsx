import React from 'react';
import { GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import './map-animations.css';
const MapLayers = ({ data, layers, onProtestSelect, selectedProtest }) => {
  // Custom icons for different layer types
  const createCustomIcon = (emoji, color = '#3b82f6', isSelected = false) => {
    const borderWidth = isSelected ? '3px' : '1px';
    const pulseAnimation = isSelected ? 'animate-pulse' : '';
    
    return L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          ${isSelected ? `
            <div class="absolute w-10 h-10 bg-red-500 rounded-full opacity-30 animate-ping"></div>
            <div class="absolute w-8 h-8 bg-red-400 rounded-full opacity-50 animate-pulse"></div>
          ` : ''}
          <div class="w-6 h-6 bg-white rounded-full flex items-center justify-center text-sm shadow-lg z-10 ${pulseAnimation}" 
               style="border: ${borderWidth} solid ${isSelected ? '#dc2626' : color};">
            ${emoji}
          </div>
        </div>
      `,
      className: 'custom-marker-container',
      iconSize: [40, 40], // Increased to accommodate pulse rings
      iconAnchor: [20, 20] // Centered anchor
    });
  };

  const handleProtestClick = (protest, layer) => {
    // Call the protest selection handler if provided
    if (onProtestSelect) {
      onProtestSelect(protest);
    }
  };

  const renderLayer = (layerKey, layerData, layerConfig) => {
    if (!layerConfig.visible || !layerData?.features) return null;

    const features = layerData.features;

    // Handle point features (hospitals, police, protests)
    if (features.length > 0 && features[0].geometry?.type === 'Point') {
      return features.map((feature, index) => {
        const coords = feature.geometry.coordinates;
        const position = [coords[1], coords[0]]; // [lat, lng]

        const isSelected = selectedProtest &&
            layerKey === 'protests' &&
            selectedProtest.geometry.coordinates[0] === coords[0] &&
            selectedProtest.geometry.coordinates[1] === coords[1];
        
        // Different colors for different layers
        const colors = {
          hospitals: '#ef4444',
          police: '#3b82f6', 
          protests: isSelected ? '#dc2626' : '#f59e0b' // Red if selected, orange if not
        };

        const icon = createCustomIcon(layerConfig.icon, colors[layerKey], isSelected);

        return (
          <Marker
            key={`${layerKey}-${index}`}
            position={position}
            icon={icon}
            eventHandlers={{
              click: () => {
                // Special handling for protests
                if (layerKey === 'protests') {
                  handleProtestClick(feature);
                }
              }
            }}
          >
            <Popup className="custom-popup">
              <div className="p-3 min-w-[200px] font-sans">
                <h4 className="font-bold mb-2 flex items-center gap-2" style={{ color: colors[layerKey] }}>
                  {layerConfig.icon} {layerConfig.label}
                  {isSelected && <span className="text-red-600 animate-pulse">🎯</span>}
                </h4>
                <div className="space-y-1 text-sm">
                  {feature.properties?.name && (
                    <p><strong>Name:</strong> {feature.properties.name}</p>
                  )}
                  {feature.properties?.location && (
                    <p><strong>Location:</strong> {feature.properties.location}</p>
                  )}
                  {feature.properties?.type && (
                    <p><strong>Type:</strong> {feature.properties.type}</p>
                  )}
                  {feature.properties?.date && (
                    <p><strong>Date:</strong> {feature.properties.date}</p>
                  )}
                  {feature.properties?.severity && (
                    <p><strong>Severity:</strong> {feature.properties.severity}</p>
                  )}
                  {feature.properties?.participants && (
                    <p><strong>Participants:</strong> {feature.properties.participants}</p>
                  )}
                  <p><strong>Coordinates:</strong> {coords[1].toFixed(6)}, {coords[0].toFixed(6)}</p>
                </div>
                
                {/* Special action for protests */}
                {layerKey === 'protests' && (
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    {isSelected ? (
                      <div className="text-center">
                        <div className="text-red-600 font-medium text-sm mb-2 flex items-center justify-center gap-2">
                          <span className="animate-pulse">✅</span>
                          Selected for routing
                          <span className="animate-pulse">🎯</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onProtestSelect(null);
                          }}
                          className="w-full px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                        >
                          Clear Selection
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProtestClick(feature);
                        }}
                        className="w-full px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                      >
                        🎯 Select for Routing
                      </button>
                    )}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      });
    }

    // Handle polygon/linestring features (roads, wards)
    return (
      <GeoJSON
        key={layerKey}
        data={layerData}
        style={() => {
          const styles = {
            roads: { color: '#6b7280', weight: 2, opacity: 0.7 },
            wards: { color: '#8b5cf6', weight: 2, opacity: 0.6, fillOpacity: 0.1 }
          };
          return styles[layerKey] || { color: '#3b82f6', weight: 2, opacity: 0.6 };
        }}
        onEachFeature={(feature, layer) => {
          if (feature.properties) {
            const popupContent = `
              <div class="p-3 min-w-[180px] font-sans">
                <h4 class="font-bold text-purple-600 mb-2">${layerConfig.icon} ${layerConfig.label}</h4>
                <div class="space-y-1 text-sm">
                  ${Object.entries(feature.properties)
                    .slice(0, 5)
                    .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
                    .join('')}
                </div>
              </div>
            `;
            layer.bindPopup(popupContent);
          }
        }}
      />
    );
  };

  if (!data || !layers) {
    return null;
  }

  return (
    <>
      {Object.entries(layers).map(([layerKey, layerConfig]) => {
        const layerData = data[layerKey];
        return renderLayer(layerKey, layerData, layerConfig);
      })}
    </>
  );
};

export default MapLayers;