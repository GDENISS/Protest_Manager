export const mapDataStore = {
  data: {
    roads: null,
    wards: null,
    hospitals: null,
    police: null,
    protests: null
  },
  layers: {
    roads: { visible: true, icon: '🛣️', label: 'Road Network', count: 0 },
    wards: { visible: true, icon: '🏛️', label: 'Admin Wards', count: 0 },
    hospitals: { visible: false, icon: '🏥', label: 'Hospitals', count: 0 },
    police: { visible: false, icon: '👮', label: 'Police Stations', count: 0 },
    protests: { visible: true, icon: '📢', label: 'Protest Events', count: 0 }
  },
  isLoaded: false,
  error: null,
  
  // Add the missing setData method
  setData(key, data) {
    this.data[key] = data;
  },
  
  // Helper methods
  getData(key) {
    return this.data[key];
  },
  
  getAllData() {
    return this.data;
  },
  
  setLayer(key, layerData) {
    this.layers[key] = { ...this.layers[key], ...layerData };
  },
  
  getLayer(key) {
    return this.layers[key];
  },
  
  getAllLayers() {
    return this.layers;
  },
  
  reset() {
    this.data = {
      roads: null,
      wards: null,
      hospitals: null,
      police: null,
      protests: null
    };
    this.isLoaded = false;
    this.error = null;
  }
};