import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const InteractiveMap = () => {
  const [roads, setRoads] = useState(null);
  const [wards, setWards] = useState(null);
  const [hospitals, setHospitals] = useState(null);
  const [police, setPolice] = useState(null);
  const [protests, setProtests] = useState(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/nairobi-roads/')
      .then(res => {
        const firstFeature = res.data.features[0];
        
        console.log("=== 🚧 MULTILINESTRING DEBUG ===");
        console.log("Geometry Type:", firstFeature.geometry.type);
        console.log("Coordinates structure:", firstFeature.geometry.coordinates);
        console.log("Number of LineStrings:", firstFeature.geometry.coordinates.length);
        console.log("First few points:", firstFeature.geometry.coordinates[0]?.slice(0, 3));
        
        // Check if the first & last point are in Nairobi bounds
        const [lon, lat] = firstFeature.geometry.coordinates[0][0];
        const boundsCheck = (lon >= 36.5 && lon <= 37.2 && lat >= -1.6 && lat <= -0.9);
        console.log("First point in Nairobi bounds:", boundsCheck);
        
        setRoads(res.data);
      })
      .catch(err => console.error("Roads API Error:", err));
      
    axios.get('http://127.0.0.1:8000/api/nairobi-wards/').then(res => setWards(res.data));
    axios.get('http://127.0.0.1:8000/api/nairobi-hospitals/').then(res => setHospitals(res.data));
    axios.get('http://127.0.0.1:8000/api/police-stations/').then(res => setPolice(res.data));
    axios.get('http://127.0.0.1:8000/api/protest-events/').then(res => setProtests(res.data));
  }, []);

  const style = {
    roads: { color: 'blue', weight: 2 },
    nairobi: { color: 'orange', weight: 1, fillOpacity: 0.2 },
    hospitals: { color: 'purple', radius: 6 },
    police: { color: 'black', radius: 5 },
    protests: { color: 'red', radius: 5 }
  };

  // Custom styling function for roads to ensure they render
  const roadsStyleFunction = (feature) => {
    console.log("Styling feature:", feature.geometry.type); // Debug log
    return {
      color: 'blue',
      weight: 3,
      opacity: 0.8
    };
  };

  // Alternative: Custom onEachFeature for roads
  const onEachRoadFeature = (feature, layer) => {
    console.log("Processing road feature:", feature.geometry.type);
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(`Road: ${feature.properties.name}`);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-10rem)] rounded-md overflow-hidden">
      <MapContainer 
        center={[-1.2921, 36.8219]} 
        zoom={11} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LayersControl position="topleft">
          {roads && (
            <LayersControl.Overlay checked name="roads">
              <GeoJSON 
                data={roads} 
                style={roadsStyleFunction}
                onEachFeature={onEachRoadFeature}
                key={`roads-${Date.now()}`} // Force re-render
              />
            </LayersControl.Overlay>
          )}
          {wards && (
            <LayersControl.Overlay checked name="Nairobi">
              <GeoJSON data={wards} style={style.nairobi} />
            </LayersControl.Overlay>
          )}
          {hospitals && (
            <LayersControl.Overlay name="Hospitals">
              <GeoJSON 
                data={hospitals} 
                pointToLayer={(feature, latlng) => L.circleMarker(latlng, style.hospitals)} 
              />
            </LayersControl.Overlay>
          )}
          {police && (
            <LayersControl.Overlay name="Police Stations">
              <GeoJSON 
                data={police} 
                pointToLayer={(feature, latlng) => L.circleMarker(latlng, style.police)} 
              />
            </LayersControl.Overlay>
          )}
          {protests && (
            <LayersControl.Overlay checked name="Protest Events">
              <GeoJSON 
                data={protests} 
                pointToLayer={(feature, latlng) => L.circleMarker(latlng, style.protests)} 
              />
            </LayersControl.Overlay>
          )}
        </LayersControl>
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;
