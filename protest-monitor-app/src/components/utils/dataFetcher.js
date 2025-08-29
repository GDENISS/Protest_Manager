import axios from 'axios';
import { mapDataStore } from './mapDataStore';
import { calculateSpatialMetrics } from './spatialAnalysis';

export const fetchMapData = async (setLoading, setError, setData, setLayers, layers, setSpatialMetrics) => {
  try {
    setLoading(true);
    setError(null);
    
    const endpoints = [
      { key: 'roads', url: 'http://127.0.0.1:8000/api/nairobi-roads/' },
      { key: 'wards', url: 'http://127.0.0.1:8000/api/nairobi-wards/' },
      { key: 'hospitals', url: 'http://127.0.0.1:8000/api/nairobi-hospitals/' },
      { key: 'police', url: 'http://127.0.0.1:8000/api/police-stations/' },
      { key: 'protests', url: 'http://127.0.0.1:8000/api/protest-events/' }
    ];

    const promises = endpoints.map(endpoint =>
      axios.get(endpoint.url)
        .then(res => ({ key: endpoint.key, data: res.data }))
        .catch(err => {
          console.error(`Failed to load ${endpoint.key}:`, err);
          return { key: endpoint.key, data: null, error: err.message };
        })
    );

    const results = await Promise.allSettled(promises);
    const newData = {};
    const newLayers = { ...layers };
    const errors = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.data) {
        const { key, data } = result.value;
        newData[key] = data;
        
        if (data.features) {
          newLayers[key] = {
            ...newLayers[key],
            count: data.features.length,
            loaded: true,
            lastUpdated: new Date().toISOString()
          };
        }
        
        // Store data in mapDataStore for caching
        mapDataStore.setData(key, data);
        
      } else if (result.status === 'fulfilled' && result.value.error) {
        errors.push(`${result.value.key}: ${result.value.error}`);
        newLayers[result.value.key] = {
          ...newLayers[result.value.key],
          loaded: false,
          error: result.value.error
        };
      } else if (result.status === 'rejected') {
        const endpoint = endpoints[index];
        errors.push(`${endpoint.key}: ${result.reason.message}`);
        newLayers[endpoint.key] = {
          ...newLayers[endpoint.key],
          loaded: false,
          error: result.reason.message
        };
      }
    });

    // Update mapDataStore with the loaded data and layers
    mapDataStore.data = newData;
    mapDataStore.layers = newLayers;
    mapDataStore.isLoaded = true; // IMPORTANT: Set this to true
    mapDataStore.error = errors.length > 0 ? `Some data failed to load: ${errors.join(', ')}` : null;

    // Update component state
    setData(newData);
    setLayers(newLayers);

    // Calculate spatial metrics if we have the necessary data
    if (newData.protests && newData.hospitals && newData.police) {
      try {
        const metrics = await calculateSpatialMetrics(newData);
        setSpatialMetrics(metrics);
      } catch (metricsError) {
        console.error('Failed to calculate spatial metrics:', metricsError);
        errors.push(`Spatial metrics calculation failed: ${metricsError.message}`);
      }
    }

    // Set errors if any occurred, but don't fail the entire operation
    if (errors.length > 0) {
      setError(`Some data failed to load: ${errors.join(', ')}`);
      console.warn('Data loading completed with errors:', errors);
    }

    console.log('Data loading completed successfully:', {
      loadedDatasets: Object.keys(newData),
      totalFeatures: Object.values(newData).reduce((total, dataset) => 
        total + (dataset?.features?.length || 0), 0
      ),
      mapDataStoreLoaded: mapDataStore.isLoaded
    });

  } catch (error) {
    console.error('Critical error in fetchMapData:', error);
    mapDataStore.error = `Failed to load map data: ${error.message}`;
    mapDataStore.isLoaded = false;
    setError(`Failed to load map data: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

// Helper function to retry failed endpoints
export const retryFailedEndpoints = async (layers, setLoading, setError, setData, setLayers, setSpatialMetrics) => {
  const failedEndpoints = Object.entries(layers)
    .filter(([key, layer]) => layer.error)
    .map(([key]) => key);

  if (failedEndpoints.length === 0) {
    console.log('No failed endpoints to retry');
    return;
  }

  console.log('Retrying failed endpoints:', failedEndpoints);
  
  // Reset mapDataStore loading state before retry
  mapDataStore.isLoaded = false;
  
  // Re-fetch only the failed endpoints
  await fetchMapData(setLoading, setError, setData, setLayers, layers, setSpatialMetrics);
};

// Helper function to refresh specific dataset
export const refreshDataset = async (datasetKey, setLoading, setError, setData, setLayers, layers) => {
  const endpoints = {
    'roads': 'http://127.0.0.1:8000/api/nairobi-roads/',
    'wards': 'http://127.0.0.1:8000/api/nairobi-wards/',
    'hospitals': 'http://127.0.0.1:8000/api/nairobi-hospitals/',
    'police': 'http://127.0.0.1:8000/api/police-stations/',
    'protests': 'http://127.0.0.1:8000/api/protest-events/'
  };

  if (!endpoints[datasetKey]) {
    setError(`Unknown dataset: ${datasetKey}`);
    return;
  }

  try {
    setLoading(true);
    const response = await axios.get(endpoints[datasetKey]);
    
    // Update only this specific dataset
    setData(prevData => ({
      ...prevData,
      [datasetKey]: response.data
    }));

    setLayers(prevLayers => ({
      ...prevLayers,
      [datasetKey]: {
        ...prevLayers[datasetKey],
        count: response.data?.features?.length || 0,
        loaded: true,
        error: null,
        lastUpdated: new Date().toISOString()
      }
    }));

    // Update cache
    mapDataStore.setData(datasetKey, response.data);
    mapDataStore.setLayer(datasetKey, {
      count: response.data?.features?.length || 0,
      loaded: true,
      error: null,
      lastUpdated: new Date().toISOString()
    });

    console.log(`Successfully refreshed ${datasetKey} dataset`);
    
  } catch (error) {
    console.error(`Failed to refresh ${datasetKey}:`, error);
    setError(`Failed to refresh ${datasetKey}: ${error.message}`);
    
    setLayers(prevLayers => ({
      ...prevLayers,
      [datasetKey]: {
        ...prevLayers[datasetKey],
        loaded: false,
        error: error.message
      }
    }));
  } finally {
    setLoading(false);
  }
};