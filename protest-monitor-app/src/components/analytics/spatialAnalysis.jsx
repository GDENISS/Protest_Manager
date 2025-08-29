import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, TrendingUp, BarChart3, Calculator, AlertTriangle } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SpatialAnalysis = () => {
    const [analysisResults, setAnalysisResults] = useState(null);
    const [selectedMetric, setSelectedMetric] = useState('poverty_rate');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const socioeconomicMetrics = [
        { key: 'poverty_rate', label: 'Poverty Rate (%)', color: '#ef4444' },
        { key: 'unemployment', label: 'Unemployment Rate (%)', color: '#f59e0b' },
        { key: 'population_density', label: 'Population Density', color: '#3b82f6' },
        { key: 'education_level', label: 'Education Index', color: '#10b981' },
        { key: 'income_level', label: 'Average Income (KES)', color: '#8b5cf6' }
    ];

    const performSpatialAnalysis = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch('http://127.0.0.1:8000/api/spatial-analysis/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    metric: selectedMetric,
                    include_kde: true
                })
            });

            if (!response.ok) {
                throw new Error('Failed to perform spatial analysis');
            }

            const results = await response.json();
            setAnalysisResults(results);
        } catch (error) {
            console.error('Spatial analysis failed:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Analysis Controls */}
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200/50">
                    <CardTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                            <Calculator className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Spatial Correlation Analysis</h3>
                            <p className="text-sm text-slate-600 font-normal">
                                Analyze correlation between protest events and socioeconomic factors
                            </p>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-3">
                            {socioeconomicMetrics.map(metric => (
                                <Button
                                    key={metric.key}
                                    variant={selectedMetric === metric.key ? "default" : "outline"}
                                    onClick={() => setSelectedMetric(metric.key)}
                                    className="text-sm"
                                    style={{
                                        backgroundColor: selectedMetric === metric.key ? metric.color : 'transparent',
                                        borderColor: metric.color,
                                        color: selectedMetric === metric.key ? 'white' : metric.color
                                    }}
                                >
                                    {metric.label}
                                </Button>
                            ))}
                        </div>
                        <Button 
                            onClick={performSpatialAnalysis} 
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Analyzing...' : 'Run Spatial Analysis'}
                        </Button>
                        
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysisResults && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Correlation Scatter Plot */}
                    <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-xl">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200/50">
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-green-600" />
                                Correlation Scatter Plot
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <ResponsiveContainer width="100%" height={300}>
                                <ScatterChart data={analysisResults.correlation_data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis 
                                        dataKey="socioeconomic_value" 
                                        name={selectedMetric}
                                        label={{ value: selectedMetric, position: 'insideBottom', offset: -5 }}
                                        stroke="#64748b"
                                    />
                                    <YAxis 
                                        dataKey="protest_intensity" 
                                        name="Protest Intensity"
                                        label={{ value: 'Protest Intensity', angle: -90, position: 'insideLeft' }}
                                        stroke="#64748b"
                                    />
                                    <Tooltip 
                                        cursor={{ strokeDasharray: '3 3' }}
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Scatter fill="#3b82f6" stroke="#1e40af" strokeWidth={1} />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Statistical Summary */}
                    <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-xl">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200/50">
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                                Statistical Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                                    <span className="font-medium text-slate-700">Correlation Coefficient:</span>
                                    <Badge className={`text-sm px-3 py-1 ${
                                        Math.abs(analysisResults.correlation) > 0.7 ? 'bg-red-100 text-red-700 border border-red-200' :
                                        Math.abs(analysisResults.correlation) > 0.5 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                        'bg-green-100 text-green-700 border border-green-200'
                                    }`}>
                                        {analysisResults.correlation.toFixed(3)}
                                    </Badge>
                                </div>
                                
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                                    <span className="font-medium text-slate-700">P-value:</span>
                                    <Badge className="bg-blue-100 text-blue-700 border border-blue-200 text-sm px-3 py-1">
                                        {analysisResults.p_value.toFixed(4)}
                                    </Badge>
                                </div>
                                
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                                    <span className="font-medium text-slate-700">Statistical Significance:</span>
                                    <Badge className={`text-sm px-3 py-1 ${
                                        analysisResults.p_value < 0.05 ? 
                                        'bg-green-100 text-green-700 border border-green-200' : 
                                        'bg-red-100 text-red-700 border border-red-200'
                                    }`}>
                                        {analysisResults.p_value < 0.05 ? 'Significant' : 'Not Significant'}
                                    </Badge>
                                </div>

                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-semibold text-blue-800 mb-2">Interpretation:</h4>
                                    <p className="text-sm text-blue-700">
                                        {Math.abs(analysisResults.correlation) > 0.7 ? 'Strong correlation detected' :
                                         Math.abs(analysisResults.correlation) > 0.5 ? 'Moderate correlation detected' :
                                         'Weak correlation detected'} between {selectedMetric.replace('_', ' ')} and protest intensity.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default SpatialAnalysis;