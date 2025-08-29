import * as turf from '@turf/turf';

export const calculateSpatialMetrics = (mapData) => {
  try {
    let totalArea = 0;
    let roadLength = 0;
    let hospitalDensity = 0;
    let policeDensity = 0;
    let avgHospitalDistance = 0;
    let highRiskAreas = 0;
    let protestHotspots = 0;

    // Calculate total area from wards
    if (mapData.wards?.features) {
      totalArea = mapData.wards.features.reduce((sum, feature) => {
        try {
          const area = turf.area(feature) / 1000000; // Convert to km²
          return sum + area;
        } catch (e) {
          return sum;
        }
      }, 0);

      if (mapData.hospitals?.features) {
        hospitalDensity = mapData.hospitals.features.length / totalArea;
      }
      if (mapData.police?.features) {
        policeDensity = mapData.police.features.length / totalArea;
      }
    }

    // Calculate total road length
    if (mapData.roads?.features) {
      roadLength = mapData.roads.features.reduce((sum, feature) => {
        try {
          const length = turf.length(feature, { units: 'kilometers' });
          return sum + length;
        } catch (e) {
          return sum;
        }
      }, 0);
    }

    // Calculate average hospital distance
    if (mapData.hospitals?.features && mapData.hospitals.features.length > 1) {
      const distances = [];
      const hospitals = mapData.hospitals.features;

      for (let i = 0; i < Math.min(hospitals.length, 10); i++) {
        for (let j = i + 1; j < Math.min(hospitals.length, 10); j++) {
          try {
            const from = turf.point(hospitals[i].geometry.coordinates);
            const to = turf.point(hospitals[j].geometry.coordinates);
            const distance = turf.distance(from, to, { units: 'kilometers' });
            distances.push(distance);
          } catch (e) {
            // Skip invalid geometries
          }
        }
      }

      if (distances.length > 0) {
        avgHospitalDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
      }
    }

    // Analyze protest hotspots
    if (mapData.protests?.features && mapData.protests.features.length > 0) {
      try {
        const protestPoints = turf.featureCollection(
          mapData.protests.features
            .filter(f => f.geometry && f.geometry.coordinates)
            .map(f => turf.point(f.geometry.coordinates))
        );

        if (protestPoints.features.length > 1) {
          let hotspotCount = 0;
          const processed = new Set();

          protestPoints.features.forEach((point, i) => {
            if (!processed.has(i)) {
              const nearby = [];
              protestPoints.features.forEach((other, j) => {
                if (i !== j && !processed.has(j)) {
                  try {
                    const distance = turf.distance(point, other, { units: 'kilometers' });
                    if (distance < 2) {
                      nearby.push(j);
                    }
                  } catch (e) {
                    // Skip invalid calculations
                  }
                }
              });

              if (nearby.length >= 2) {
                hotspotCount++;
                nearby.forEach(idx => processed.add(idx));
                processed.add(i);
              }
            }
          });

          protestHotspots = hotspotCount;
        }
      } catch (e) {
        console.warn('Error calculating protest hotspots:', e);
      }
    }

    highRiskAreas = Math.floor(protestHotspots * 1.5 + (hospitalDensity < 0.5 ? 2 : 0));

    return {
      totalArea,
      roadLength,
      hospitalDensity,
      policeDensity,
      avgHospitalDistance,
      highRiskAreas,
      protestHotspots
    };
  } catch (error) {
    console.error('Error calculating spatial metrics:', error);
    return {
      totalArea: 0,
      roadLength: 0,
      hospitalDensity: 0,
      policeDensity: 0,
      avgHospitalDistance: 0,
      highRiskAreas: 0,
      protestHotspots: 0
    };
  }
};