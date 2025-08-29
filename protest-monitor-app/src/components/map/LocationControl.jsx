import React, { useCallback } from 'react';
import { useMap } from 'react-leaflet';
import { Navigation } from 'lucide-react';

const LocationControl = ({ onLocationFound }) => {
  const map = useMap();

  const handleLocateUser = useCallback(() => {
    map.locate({
      setView: true,
      maxZoom: 16,
      enableHighAccuracy: true
    });

    map.on('locationfound', (e) => {
      onLocationFound && onLocationFound(e.latlng);
    });

    map.on('locationerror', (e) => {
      console.warn('Location access denied:', e.message);
    });
  }, [map, onLocationFound]);

  return (
    <div className="absolute top-4 right-4 z-[1000]">
      <button
        onClick={handleLocateUser}
        className="group p-4 bg-white/95 hover:bg-white shadow-2xl rounded-2xl border border-white/50 transition-all duration-300 hover:scale-105 backdrop-blur-xl"
        title="Find My Location"
      >
        <Navigation size={20} className="text-blue-600 group-hover:text-blue-700 transition-colors" />
      </button>
    </div>
  );
};

export default LocationControl;