import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, MapPin, Activity } from 'lucide-react';

const RiskSurfaceMap = () => {
    const [selectedView, setSelectedView] = useState('risk_surface');
    const [kdeData, setKdeData] = useState(null);
    const [hotspots, setHotspots] = useState([]);
    const [loading, setLoading] = useState(false);
    const canvasRef = useRef(null);

    const viewOptions = [
        { key: 'risk_surface', label: 'Weighted Risk Surface', color: '#ef4444', icon: AlertTriangle },
        { key: 'density_grid', label: 'Protest Density', color: '#f59e0b', icon: Activity },
        { key: 'proximity_weights', label: 'Police Proximity', color: '#3b82f6', icon: Shield }
    ];

    const fetchKdeData = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/spatial-analysis/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    metric: 'risk_analysis',
                    include_kde: true
                })
            });

            if (response.ok) {
                const results = await response.json();
                setKdeData(results.kde_data);
                setHotspots(results.kde_data?.hotspots || []);
            }
        } catch (error) {
            console.error('Failed to fetch KDE data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKdeData();
    }, []);

    useEffect(() => {
        if (kdeData && canvasRef.current) {
            drawHeatmap();
        }
    }, [kdeData, selectedView]);

    const drawHeatmap = () => {
        const canvas = canvasRef.current;
        if (!canvas || !kdeData) return;

        const ctx = canvas.getContext('2d');
        const data = kdeData[selectedView];
        
        if (!data) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const maxValue = Math.max(...data.flat());
        const minValue = Math.min(...data.flat());
        
        for (let i = 0; i < canvas.height; i++) {
            for (let j = 0; j < canvas.width; j++) {
                const dataI = Math.floor((i / canvas.height) * data.length);
                const dataJ = Math.floor((j / canvas.width) * data[0].length);
                
                const value = data[dataI] && data[dataI][dataJ] ? data[dataI][dataJ] : 0;
                const normalized = maxValue > minValue ? (value - minValue) / (maxValue - minValue) : 0;
                
                const pixelIndex = (i * canvas.width + j) * 4;
                
                // Color mapping based on view type
                if (selectedView === 'risk_surface') {
                    imageData.data[pixelIndex] = Math.floor(255 * normalized);
                    imageData.data[pixelIndex + 1] = Math.floor(100 * (1 - normalized));
                    imageData.data[pixelIndex + 2] = 0;
                } else if (selectedView === 'density_grid') {
                    imageData.data[pixelIndex] = Math.floor(255 * normalized);
                    imageData.data[pixelIndex + 1] = Math.floor(165 * normalized);
                    imageData.data[pixelIndex + 2] = 0;
                } else {
                    imageData.data[pixelIndex] = 0;
                    imageData.data[pixelIndex + 1] = Math.floor(150 * normalized);
                    imageData.data[pixelIndex + 2] = Math.floor(255 * normalized);
                }
                
                imageData.data[pixelIndex + 3] = Math.floor(180 * normalized + 50);
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    };

    return (
        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-slate-200/50">
                <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg">
                        <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Weighted Risk Surface Analysis</h3>
                        <p className="text-sm text-slate-600 font-normal">
                            Kernel Density Estimation with police proximity weighting
                        </p>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-6">
                    {/* View Controls */}
                    <div className="flex flex-wrap gap-3">
                        {viewOptions.map(option => {
                            const IconComponent = option.icon;
                            return (
                                <Button
                                    key={option.key}
                                    variant={selectedView === option.key ? "default" : "outline"}
                                    onClick={() => setSelectedView(option.key)}
                                    className="text-sm flex items-center gap-2"
                                    style={{
                                        backgroundColor: selectedView === option.key ? option.color : 'transparent',
                                        borderColor: option.color,
                                        color: selectedView === option.key ? 'white' : option.color
                                    }}
                                >
                                    <IconComponent className="h-4 w-4" />
                                    {option.label}
                                </Button>
                            );
                        })}
                    </div>

                    {/* Heatmap Canvas */}
                    <div className="relative">
                        <div className="relative w-full h-96 bg-slate-900 rounded-xl overflow-hidden border border-slate-300">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-white">Loading risk surface...</div>
                                </div>
                            ) : (
                                <>
                                    <canvas
                                        ref={canvasRef}
                                        width={400}
                                        height={300}
                                        className="w-full h-full"
                                        style={{ imageRendering: 'pixelated' }}
                                    />
                                    
                                    {/* Overlay hotspots for risk surface view */}
                                    {selectedView === 'risk_surface' && kdeData && hotspots.map((hotspot, index) => (
                                        <div
                                            key={index}
                                            className="absolute w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white shadow-lg"
                                            style={{
                                                left: `${((hotspot.longitude - kdeData.grid_bounds.x_min) / 
                                                         (kdeData.grid_bounds.x_max - kdeData.grid_bounds.x_min)) * 100}%`,
                                                top: `${((kdeData.grid_bounds.y_max - hotspot.latitude) / 
                                                        (kdeData.grid_bounds.y_max - kdeData.grid_bounds.y_min)) * 100}%`,
                                                transform: 'translate(-50%, -50%)'
                                            }}
                                            title={`Risk Score: ${hotspot.risk_score.toFixed(2)}`}
                                        />
                                    ))}
                                </>
                            )}
                        </div>

                        {/* Legend */}
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-slate-200">
                            <h4 className="font-semibold text-xs text-slate-700 mb-2">Intensity Scale</h4>
                            <div className="flex items-center gap-2">
                                <div className="w-20 h-3 bg-gradient-to-r from-transparent via-yellow-500 to-red-500 rounded"></div>
                                <span className="text-xs text-slate-600">High</span>
                            </div>
                        </div>
                    </div>

                    {/* Hotspots Summary */}
                    {selectedView === 'risk_surface' && hotspots.length > 0 && (
                        <Card className="bg-red-50 border border-red-200">
                            <CardContent className="p-4">
                                <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-800">
                                    <MapPin className="h-4 w-4" />
                                    High-Risk Hotspots ({hotspots.length})
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {hotspots.slice(0, 6).map((hotspot, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                                            <div>
                                                <div className="text-sm font-medium text-slate-800">
                                                    Lat: {hotspot.latitude.toFixed(4)}
                                                </div>
                                                <div className="text-sm text-slate-600">
                                                    Lng: {hotspot.longitude.toFixed(4)}
                                                </div>
                                            </div>
                                            <Badge className="bg-red-100 text-red-700 border border-red-200">
                                                {(hotspot.intensity * 100).toFixed(0)}%
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Generate New Analysis Button */}
                    <Button 
                        onClick={fetchKdeData} 
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : 'Generate New Risk Analysis'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default RiskSurfaceMap;