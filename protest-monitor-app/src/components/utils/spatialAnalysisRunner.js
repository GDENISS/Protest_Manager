import * as turf from '@turf/turf';

export const runSpatialAnalysis = async (analysisType, data, spatialMetrics, setSpatialAnalysis) => {
  setSpatialAnalysis({ isRunning: true, results: null, type: analysisType });

  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    let results = { 
      message: 'Analysis completed successfully',
      geometries: [],
      metadata: {}
    };

    switch (analysisType) {
      case 'buffer': {
        if (data.hospitals?.features) {
          const buffers = [];
          data.hospitals.features.forEach((hospital, index) => {
            try {
              const buffer = turf.buffer(hospital, 1, { units: 'kilometers' });
              buffer.properties = {
                ...buffer.properties,
                analysisType: 'buffer',
                hospitalName: hospital.properties?.name || `Hospital ${index + 1}`,
                bufferRadius: '1km',
                id: `buffer_${index}`
              };
              buffers.push(buffer);
            } catch (e) {
              console.warn('Failed to create buffer for hospital:', e);
            }
          });
          
          results.geometries = buffers;
          results.message = `Created ${buffers.length} buffer zones around hospitals`;
          results.metadata = {
            count: buffers.length,
            radius: '1km',
            type: 'Hospital Coverage Areas'
          };
        }
        break;
      }

      case 'proximity': {
        if (data.protests?.features && data.police?.features) {
          const proximityLines = [];
          let nearbyProtests = 0;
          
          data.protests.features.forEach((protest, protestIndex) => {
            data.police.features.forEach((station, stationIndex) => {
              try {
                const protestPoint = turf.point(protest.geometry.coordinates);
                const stationPoint = turf.point(station.geometry.coordinates);
                const distance = turf.distance(protestPoint, stationPoint, { units: 'kilometers' });
                
                if (distance < 2) {
                  nearbyProtests++;
                  // Create a line connecting protest to nearest police station
                  const line = turf.lineString([
                    protest.geometry.coordinates,
                    station.geometry.coordinates
                  ]);
                  
                  line.properties = {
                    analysisType: 'proximity',
                    protestLocation: protest.properties?.location || `Protest ${protestIndex + 1}`,
                    policeStation: station.properties?.name || `Station ${stationIndex + 1}`,
                    distance: distance.toFixed(2),
                    id: `proximity_${protestIndex}_${stationIndex}`
                  };
                  
                  proximityLines.push(line);
                }
              } catch (e) {
                console.warn('Failed to calculate proximity:', e);
              }
            });
          });
          
          results.geometries = proximityLines;
          results.message = `Found ${nearbyProtests} protests within 2km of police stations`;
          results.metadata = {
            count: nearbyProtests,
            maxDistance: '2km',
            type: 'Protest-Police Proximity'
          };
        }
        break;
      }

      case 'density': {
        if (data.protests?.features) {
          const densityPolygons = [];
          
          // Create a grid and calculate point density
          const bbox = turf.bbox(turf.featureCollection(data.protests.features));
          const grid = turf.hexGrid(bbox, 2, { units: 'kilometers' });
          
          grid.features.forEach((cell, index) => {
            const pointsWithin = turf.pointsWithinPolygon(
              turf.featureCollection(data.protests.features),
              cell
            );
            
            if (pointsWithin.features.length > 0) {
              cell.properties = {
                analysisType: 'density',
                density: pointsWithin.features.length,
                area: turf.area(cell) / 1000000, // Convert to km²
                densityPerKm2: (pointsWithin.features.length / (turf.area(cell) / 1000000)).toFixed(2),
                id: `density_${index}`
              };
              densityPolygons.push(cell);
            }
          });
          
          results.geometries = densityPolygons;
          results.message = `Created density analysis with ${densityPolygons.length} density zones`;
          results.metadata = {
            count: densityPolygons.length,
            gridSize: '2km',
            type: 'Protest Density Analysis'
          };
        }
        break;
      }

      case 'hotspot': {
        if (data.protests?.features && data.protests.features.length > 1) {
          const hotspotCircles = [];
          const protestPoints = turf.featureCollection(
            data.protests.features
              .filter(f => f.geometry && f.geometry.coordinates)
              .map(f => turf.point(f.geometry.coordinates))
          );

          if (protestPoints.features.length > 1) {
            const processed = new Set();
            let hotspotCount = 0;

            protestPoints.features.forEach((point, i) => {
              if (!processed.has(i)) {
                const nearby = [];
                protestPoints.features.forEach((other, j) => {
                  if (i !== j && !processed.has(j)) {
                    try {
                      const distance = turf.distance(point, other, { units: 'kilometers' });
                      if (distance < 1.5) {
                        nearby.push({ index: j, point: other, distance });
                      }
                    } catch (e) {
                      // Skip invalid calculations
                    }
                  }
                });

                if (nearby.length >= 2) {
                  hotspotCount++;
                  // Create hotspot circle
                  const center = point.geometry.coordinates;
                  const hotspotCircle = turf.circle(center, 1.5, { units: 'kilometers' });
                  
                  hotspotCircle.properties = {
                    analysisType: 'hotspot',
                    hotspotId: hotspotCount,
                    protestCount: nearby.length + 1,
                    radius: '1.5km',
                    intensity: nearby.length + 1 > 3 ? 'High' : 'Medium',
                    id: `hotspot_${hotspotCount}`
                  };
                  
                  hotspotCircles.push(hotspotCircle);
                  
                  // Mark as processed
                  nearby.forEach(n => processed.add(n.index));
                  processed.add(i);
                }
              }
            });

            results.geometries = hotspotCircles;
            results.message = `Identified ${hotspotCount} protest hotspots using clustering analysis`;
            results.metadata = {
              count: hotspotCount,
              radius: '1.5km',
              type: 'Protest Hotspots'
            };
          }
        }
        break;
      }

      default:
        results.message = 'Analysis type not implemented';
    }

    setSpatialAnalysis({ isRunning: false, results, type: analysisType });
  } catch (error) {
    console.error('Spatial analysis error:', error);
    setSpatialAnalysis({
      isRunning: false,
      results: { 
        message: 'Analysis failed: ' + error.message,
        geometries: [],
        metadata: {}
      },
      type: analysisType
    });
  }
};