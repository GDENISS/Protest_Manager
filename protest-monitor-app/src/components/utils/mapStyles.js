export const getLayerStyle = (layerType, feature) => {
  const styles = {
    roads: {
      color: feature?.properties?.highway === 'primary' ? '#1e40af' : 
             feature?.properties?.highway === 'secondary' ? '#3b82f6' : '#60a5fa',
      weight: feature?.properties?.highway === 'motorway' ? 6 :
              feature?.properties?.highway === 'trunk' ? 5 :
              feature?.properties?.highway === 'primary' ? 4 : 
              feature?.properties?.highway === 'secondary' ? 3 : 2,
      opacity: 0.8,
      dashArray: feature?.properties?.surface === 'unpaved' ? '5, 5' : null
    },
    wards: {
      color: '#f97316',
      weight: 2,
      fillOpacity: 0.05,
      fillColor: '#fed7aa',
      dashArray: '8, 4'
    },
    hospitals: {
      color: '#059669',
      fillColor: '#34d399',
      fillOpacity: 0.9,
      radius: feature?.properties?.capacity > 200 ? 14 : 
              feature?.properties?.capacity > 100 ? 12 : 10,
      weight: 3
    },
    police: {
      color: '#1f2937',
      fillColor: feature?.properties?.type === 'headquarters' ? '#374151' : '#6b7280',
      fillOpacity: 0.9,
      radius: feature?.properties?.type === 'headquarters' ? 12 : 8,
      weight: 3
    },
    protests: {
      color: feature?.properties?.severity === 'high' ? '#991b1b' :
             feature?.properties?.severity === 'medium' ? '#dc2626' : '#ef4444',
      fillColor: feature?.properties?.severity === 'high' ? '#fca5a5' :
                 feature?.properties?.severity === 'medium' ? '#fecaca' : '#fed7d7',
      fillOpacity: 0.9,
      radius: feature?.properties?.participants > 1000 ? 16 :
              feature?.properties?.participants > 500 ? 14 :
              feature?.properties?.participants > 100 ? 12 : 10,
      weight: 3,
      className: feature?.properties?.severity === 'high' ? 'pulse-marker' : ''
    }
  };
  return styles[layerType] || {};
};

export const getPopupContent = (feature, layerType) => {
  const props = feature.properties || {};
  const templates = {
    roads: `
      <div class="p-4 min-w-[200px]">
        <div class="flex items-center gap-2 mb-3 pb-2 border-b border-blue-100">
          <span class="text-2xl">🛣️</span>
          <h4 class="font-bold text-blue-700 text-lg">Road Information</h4>
        </div>
        <div class="space-y-2">
          <p><span class="font-semibold text-gray-700">Name:</span> <span class="text-gray-900">${props.name || 'Unnamed Road'}</span></p>
          <p><span class="font-semibold text-gray-700">Type:</span> <span class="text-gray-900">${props.type || props.highway || 'Unknown'}</span></p>
          ${props.surface ? `<p><span class="font-semibold text-gray-700">Surface:</span> <span class="text-gray-900">${props.surface}</span></p>` : ''}
          ${props.maxspeed ? `<p><span class="font-semibold text-gray-700">Speed Limit:</span> <span class="text-gray-900">${props.maxspeed} km/h</span></p>` : ''}
        </div>
      </div>
    `,
    hospitals: `
      <div class="p-4 min-w-[200px]">
        <div class="flex items-center gap-2 mb-3 pb-2 border-b border-purple-100">
          <span class="text-2xl">🏥</span>
          <h4 class="font-bold text-purple-700 text-lg">Hospital</h4>
        </div>
        <div class="space-y-2">
          <p><span class="font-semibold text-gray-700">Name:</span> <span class="text-gray-900">${props.name || 'Medical Facility'}</span></p>
          ${props.beds ? `<p><span class="font-semibold text-gray-700">Capacity:</span> <span class="text-gray-900">${props.beds} beds</span></p>` : ''}
          ${props.phone ? `<p><span class="font-semibold text-gray-700">Phone:</span> <span class="text-blue-600">${props.phone}</span></p>` : ''}
          ${props.emergency ? `<p><span class="font-semibold text-red-600">24/7 Emergency Services</span></p>` : ''}
        </div>
      </div>
    `,
    police: `
      <div class="p-4 min-w-[200px]">
        <div class="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
          <span class="text-2xl">👮</span>
          <h4 class="font-bold text-gray-700 text-lg">Police Station</h4>
        </div>
        <div class="space-y-2">
          <p><span class="font-semibold text-gray-700">Station:</span> <span class="text-gray-900">${props.name || 'Police Station'}</span></p>
          ${props.contact ? `<p><span class="font-semibold text-gray-700">Contact:</span> <span class="text-blue-600">${props.contact}</span></p>` : ''}
          <p class="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">Emergency: 999 or 112</p>
        </div>
      </div>
    `,
    protests: `
      <div class="p-4 min-w-[200px]">
        <div class="flex items-center gap-2 mb-3 pb-2 border-b border-red-100">
          <span class="text-2xl">📢</span>
          <h4 class="font-bold text-red-700 text-lg">Protest Event</h4>
        </div>
        <div class="space-y-2">
          <p><span class="font-semibold text-gray-700">Location:</span> <span class="text-gray-900">${props.location || 'Event Location'}</span></p>
          ${props.date ? `<p><span class="font-semibold text-gray-700">Date:</span> <span class="text-gray-900">${props.date}</span></p>` : ''}
          ${props.description ? `<p><span class="font-semibold text-gray-700">Details:</span> <span class="text-gray-900">${props.description}</span></p>` : ''}
          <div class="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            ⚠️ Check local traffic conditions
          </div>
        </div>
      </div>
    `,
    wards: `
      <div class="p-4 min-w-[200px]">
        <div class="flex items-center gap-2 mb-3 pb-2 border-b border-orange-100">
          <span class="text-2xl">🏛️</span>
          <h4 class="font-bold text-orange-700 text-lg">Administrative Ward</h4>
        </div>
        <div class="space-y-2">
          <p><span class="font-semibold text-gray-700">Ward:</span> <span class="text-gray-900">${props.ward_name || props.name || 'Ward'}</span></p>
          ${props.constituency ? `<p><span class="font-semibold text-gray-700">Constituency:</span> <span class="text-gray-900">${props.constituency}</span></p>` : ''}
          ${props.population ? `<p><span class="font-semibold text-gray-700">Population:</span> <span class="text-gray-900">${props.population.toLocaleString()}</span></p>` : ''}
        </div>
      </div>
    `
  };
  return templates[layerType] || '<div class="p-3"><p>Feature Information</p></div>';
};