import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

export const DataProvider = ({ children }) => {
    const [data, setData] = useState({
        protests: null,
        hospitals: null,
        police: null,
        wards: null,
        roads: null,
        loading: true,
        error: null
    });

    // Your actual API endpoints
    const API_BASE_URL = 'http://127.0.0.1:8000/api';

    const fetchData = async () => {
        try {
            setData(prev => ({ ...prev, loading: true, error: null }));

            // Fetch from your actual API endpoints
            const [protestsRes, hospitalsRes, policeRes, wardsRes, roadsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/protest-events/`),
                fetch(`${API_BASE_URL}/nairobi-hospitals/`),
                fetch(`${API_BASE_URL}/police-stations/`),
                fetch(`${API_BASE_URL}/nairobi-wards/`),
                fetch(`${API_BASE_URL}/nairobi-roads/`)
            ]);

            // Check if all requests were successful
            if (!protestsRes.ok || !hospitalsRes.ok || !policeRes.ok || !wardsRes.ok || !roadsRes.ok) {
                throw new Error('One or more API requests failed');
            }

            const [protests, hospitals, police, wards, roads] = await Promise.all([
                protestsRes.json(),
                hospitalsRes.json(),
                policeRes.json(),
                wardsRes.json(),
                roadsRes.json()
            ]);

            console.log('Fetched data:', { protests, hospitals, police, wards, roads });

            setData({
                protests: protests,
                hospitals: hospitals,
                police: police,
                wards: wards,
                roads: roads,
                loading: false,
                error: null
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            setData(prev => ({
                ...prev,
                loading: false,
                error: error.message
            }));
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Extract real protest data based on your database structure
    const getProtestFeatures = () => {
        if (!data.protests) return [];
        
        // Handle both GeoJSON format and direct array
        if (data.protests.features) {
            return data.protests.features;
        } else if (Array.isArray(data.protests)) {
            return data.protests;
        } else if (data.protests.results) {
            return data.protests.results;
        }
        return [];
    };

    const getHospitalFeatures = () => {
        if (!data.hospitals) return [];
        return data.hospitals.features || data.hospitals.results || data.hospitals || [];
    };

    const getPoliceFeatures = () => {
        if (!data.police) return [];
        return data.police.features || data.police.results || data.police || [];
    };

    const protestFeatures = getProtestFeatures();
    const hospitalFeatures = getHospitalFeatures();
    const policeFeatures = getPoliceFeatures();

    // Calculate metrics based on actual database fields
    const metrics = {
        totalProtests: protestFeatures.length,
        activeProtests: protestFeatures.filter(protest => {
            // Check if event is recent (within last 30 days) to consider it "active"
            const eventDate = getEventDate(protest);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return eventDate >= thirtyDaysAgo;
        }).length,
        highRiskEvents: protestFeatures.filter(protest => {
            // Consider events with fatalities > 0 as high risk
            const fatalities = getEventFatalities(protest);
            return fatalities > 0;
        }).length,
        totalHospitals: hospitalFeatures.length,
        totalPoliceStations: policeFeatures.length,
        averageParticipants: protestFeatures.length > 0 
            ? protestFeatures.reduce((sum, protest) => {
                // Since there's no participants field in your data, we'll estimate based on fatalities
                // or use a default calculation
                const fatalities = getEventFatalities(protest);
                const estimatedParticipants = fatalities > 0 ? fatalities * 50 : 100; // Rough estimate
                return sum + estimatedParticipants;
            }, 0) / protestFeatures.length
            : 0,
        totalFatalities: protestFeatures.reduce((sum, protest) => sum + getEventFatalities(protest), 0),
        eventsWithFatalities: protestFeatures.filter(protest => getEventFatalities(protest) > 0).length,
        yearRange: getYearRange(protestFeatures)
    };

    // Process data for charts using real database fields
    const chartData = {
        incidentTrends: processIncidentTrends(protestFeatures),
        regionalDistribution: processRegionalDistribution(protestFeatures),
        riskAssessment: processRiskAssessment(protestFeatures),
        participantGrowth: processParticipantGrowth(protestFeatures),
        fatalityTrends: processFatalityTrends(protestFeatures),
        yearlyDistribution: processYearlyDistribution(protestFeatures),
        geographicHotspots: processGeographicHotspots(protestFeatures)
    };

    const value = {
        data,
        metrics,
        chartData,
        refetch: fetchData
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

// Helper functions to extract data from your database structure
function getEventDate(protest) {
    const properties = protest.properties || protest;
    const eventDate = properties.event_date || properties.timestamp || properties.date;
    return eventDate ? new Date(eventDate) : new Date();
}

function getEventFatalities(protest) {
    const properties = protest.properties || protest;
    return properties.fatalities || 0;
}

function getEventYear(protest) {
    const properties = protest.properties || protest;
    return properties.year || getEventDate(protest).getFullYear();
}

function getEventLocation(protest) {
    const properties = protest.properties || protest;
    // Extract coordinates from geometry or properties
    if (protest.geometry && protest.geometry.coordinates) {
        return {
            longitude: protest.geometry.coordinates[0],
            latitude: protest.geometry.coordinates[1]
        };
    }
    return {
        longitude: properties.longitude || 0,
        latitude: properties.latitude || 0
    };
}

function getYearRange(protestFeatures) {
    if (protestFeatures.length === 0) return { min: new Date().getFullYear(), max: new Date().getFullYear() };
    
    const years = protestFeatures.map(protest => getEventYear(protest));
    return {
        min: Math.min(...years),
        max: Math.max(...years)
    };
}

// Updated processing functions using real data
function processIncidentTrends(protestFeatures) {
    if (!protestFeatures || protestFeatures.length === 0) {
        return [];
    }
    
    const trendData = {};
    
    protestFeatures.forEach(protest => {
        const eventDate = getEventDate(protest);
        const dateStr = eventDate.toISOString().split('T')[0];
        const fatalities = getEventFatalities(protest);
        
        if (!trendData[dateStr]) {
            trendData[dateStr] = {
                incidents: 0,
                fatalities: 0,
                estimatedParticipants: 0
            };
        }
        
        trendData[dateStr].incidents += 1;
        trendData[dateStr].fatalities += fatalities;
        trendData[dateStr].estimatedParticipants += (fatalities > 0 ? fatalities * 50 : 100);
    });

    return Object.entries(trendData)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([date, data]) => ({
            date,
            incidents: data.incidents,
            fatalities: data.fatalities,
            participants: data.estimatedParticipants
        }));
}

function processRegionalDistribution(protestFeatures) {
    if (!protestFeatures || protestFeatures.length === 0) {
        return [];
    }
    
    const distribution = {};
    
    protestFeatures.forEach(protest => {
        const location = getEventLocation(protest);
        // Group by latitude/longitude regions or use ward data if available
        const region = getRegionFromCoordinates(location.latitude, location.longitude);
        
        if (!distribution[region]) {
            distribution[region] = {
                incidents: 0,
                fatalities: 0
            };
        }
        
        distribution[region].incidents += 1;
        distribution[region].fatalities += getEventFatalities(protest);
    });

    const total = protestFeatures.length;
    return Object.entries(distribution).map(([region, data]) => ({
        ward: region,
        incidents: data.incidents,
        fatalities: data.fatalities,
        percentage: ((data.incidents / total) * 100).toFixed(1)
    }));
}

function processRiskAssessment(protestFeatures) {
    if (!protestFeatures || protestFeatures.length === 0) {
        return [];
    }
    
    const riskLevels = {
        low: 0,      // 0 fatalities
        medium: 0,   // 1-2 fatalities
        high: 0,     // 3-5 fatalities
        critical: 0  // 6+ fatalities
    };

    protestFeatures.forEach(protest => {
        const fatalities = getEventFatalities(protest);
        
        if (fatalities === 0) {
            riskLevels.low++;
        } else if (fatalities <= 2) {
            riskLevels.medium++;
        } else if (fatalities <= 5) {
            riskLevels.high++;
        } else {
            riskLevels.critical++;
        }
    });

    return Object.entries(riskLevels).map(([level, count]) => ({
        level,
        count,
        percentage: protestFeatures.length > 0 ? (count / protestFeatures.length * 100).toFixed(1) : '0'
    }));
}

function processParticipantGrowth(protestFeatures) {
    if (!protestFeatures || protestFeatures.length === 0) {
        return [];
    }
    
    const growthData = {};
    
    protestFeatures.forEach(protest => {
        const eventDate = getEventDate(protest);
        const dateStr = eventDate.toISOString().split('T')[0];
        const fatalities = getEventFatalities(protest);
        const estimatedParticipants = fatalities > 0 ? fatalities * 50 : 100;
        
        growthData[dateStr] = (growthData[dateStr] || 0) + estimatedParticipants;
    });

    return Object.entries(growthData)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([date, participants]) => ({ date, participants }));
}

function processFatalityTrends(protestFeatures) {
    if (!protestFeatures || protestFeatures.length === 0) {
        return [];
    }
    
    const fatalityData = {};
    
    protestFeatures.forEach(protest => {
        const eventDate = getEventDate(protest);
        const dateStr = eventDate.toISOString().split('T')[0];
        const fatalities = getEventFatalities(protest);
        
        fatalityData[dateStr] = (fatalityData[dateStr] || 0) + fatalities;
    });

    return Object.entries(fatalityData)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([date, fatalities]) => ({ date, fatalities }));
}

function processYearlyDistribution(protestFeatures) {
    if (!protestFeatures || protestFeatures.length === 0) {
        return [];
    }
    
    const yearlyData = {};
    
    protestFeatures.forEach(protest => {
        const year = getEventYear(protest);
        const fatalities = getEventFatalities(protest);
        
        if (!yearlyData[year]) {
            yearlyData[year] = {
                incidents: 0,
                fatalities: 0
            };
        }
        
        yearlyData[year].incidents += 1;
        yearlyData[year].fatalities += fatalities;
    });

    return Object.entries(yearlyData)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([year, data]) => ({
            year: parseInt(year),
            incidents: data.incidents,
            fatalities: data.fatalities
        }));
}

function processGeographicHotspots(protestFeatures) {
    if (!protestFeatures || protestFeatures.length === 0) {
        return [];
    }
    
    const hotspots = {};
    
    protestFeatures.forEach(protest => {
        const location = getEventLocation(protest);
        const fatalities = getEventFatalities(protest);
        
        // Create a grid-based hotspot system
        const latGrid = Math.floor(location.latitude * 100) / 100;
        const lngGrid = Math.floor(location.longitude * 100) / 100;
        const gridKey = `${latGrid},${lngGrid}`;
        
        if (!hotspots[gridKey]) {
            hotspots[gridKey] = {
                latitude: latGrid,
                longitude: lngGrid,
                incidents: 0,
                fatalities: 0,
                intensity: 0
            };
        }
        
        hotspots[gridKey].incidents += 1;
        hotspots[gridKey].fatalities += fatalities;
        hotspots[gridKey].intensity = hotspots[gridKey].incidents + (hotspots[gridKey].fatalities * 2);
    });

    return Object.values(hotspots)
        .sort((a, b) => b.intensity - a.intensity)
        .slice(0, 20); // Top 20 hotspots
}

function getRegionFromCoordinates(latitude, longitude) {
    // Simple region mapping based on Nairobi coordinates
    // You can make this more sophisticated based on actual ward boundaries
    if (latitude > -1.25) {
        if (longitude > 36.85) return 'North East';
        else return 'North West';
    } else if (latitude > -1.30) {
        if (longitude > 36.85) return 'Central East';
        else return 'Central West';
    } else {
        if (longitude > 36.85) return 'South East';
        else return 'South West';
    }
}

export default DataProvider;