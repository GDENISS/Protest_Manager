import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Hash, RefreshCw, TrendingUp, AlertTriangle, TrendingDown, Minus } from 'lucide-react';

const TrendingHashtags = () => {
    const [hashtags, setHashtags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Use the same API base URL as other components
    const API_BASE_URL = 'http://127.0.0.1:8000/api';

    // Fetch trending hashtags from your API
    const fetchTrendingHashtags = async () => {
        setLoading(true);
        setError(null);
        
        try {
            console.log('Fetching trending hashtags from:', `${API_BASE_URL}/trending-hashtags/`);
            const response = await fetch(`${API_BASE_URL}/trending-hashtags/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Fetched trending hashtags data:', data);
            
            // Handle different response structures
            if (data && data.hashtags && Array.isArray(data.hashtags)) {
                setHashtags(data.hashtags);
                setLastUpdated(new Date(data.timestamp || Date.now()));
                console.log('Successfully loaded', data.hashtags.length, 'hashtags');
            } else if (data && Array.isArray(data)) {
                // Handle case where data is directly an array
                setHashtags(data);
                setLastUpdated(new Date());
                console.log('Successfully loaded', data.length, 'hashtags (direct array)');
            } else {
                console.warn('Unexpected data structure:', data);
                // Set empty array but don't throw error - maybe no data available yet
                setHashtags([]);
                setLastUpdated(new Date());
                setError('No trending hashtags data available at this time');
            }
            
        } catch (err) {
            console.error('Error fetching hashtags:', err);
            const errorMessage = err.message.includes('fetch') ? 
                'Unable to connect to hashtags service. Please check if the backend server is running.' :
                `Failed to fetch trending hashtags: ${err.message}`;
            setError(errorMessage);
            setHashtags([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrendingHashtags();
        
        // Refresh every 10 minutes
        const interval = setInterval(fetchTrendingHashtags, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const getTagSize = (count, maxCount) => {
        const ratio = count / maxCount;
        if (ratio > 0.8) return 'text-2xl';
        if (ratio > 0.6) return 'text-xl';
        if (ratio > 0.4) return 'text-lg';
        if (ratio > 0.2) return 'text-base';
        return 'text-sm';
    };

    const getRiskColor = (risk) => {
        switch (risk) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
            case 'down': return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
            case 'stable': return <div className="h-3 w-3 bg-gray-400 rounded-full"></div>;
            default: return null;
        }
    };

    const maxCount = hashtags.length > 0 ? Math.max(...hashtags.map(h => h.interest_score || 0)) : 1;

    return (
        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200/50">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                            <Hash className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Trending Hashtags</h3>
                            <p className="text-sm text-slate-600 font-normal">
                                Social media trends from Nairobi
                            </p>
                        </div>
                    </CardTitle>
                    
                    <div className="flex items-center gap-2">
                        {lastUpdated && (
                            <span className="text-xs text-slate-500">
                                {lastUpdated.toLocaleTimeString()}
                            </span>
                        )}
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={fetchTrendingHashtags}
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="p-6">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
                        <span className="ml-2 text-slate-600">Loading trends...</span>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-8 text-red-600">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        <span>{error}</span>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Tag Cloud */}
                        <div className="flex flex-wrap gap-3 justify-center items-center min-h-[200px] p-4 bg-gradient-to-br from-slate-50 to-purple-50 rounded-xl border border-slate-200/50">
                            {hashtags && hashtags.length > 0 ? hashtags.map((hashtag, index) => {
                                // Use the correct property names from your API
                                const tagName = hashtag.tag || `#hashtag${index}`;
                                const tagCount = hashtag.interest_score || 0;
                                const tagTrend = hashtag.trend || 'stable';
                                const tagRisk = hashtag.risk || 'low';
                                
                                return (
                                    <div
                                        key={tagName}
                                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer ${getRiskColor(tagRisk)} ${getTagSize(tagCount, maxCount)}`}
                                        style={{
                                            animationDelay: `${index * 100}ms`,
                                            animation: 'fadeInUp 0.6s ease-out forwards'
                                        }}
                                    >
                                        <span className="font-semibold">{tagName}</span>
                                        <div className="flex items-center gap-1">
                                            {getTrendIcon(tagTrend)}
                                            <span className="text-xs font-medium">
                                                {tagCount.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="text-center py-8 text-slate-500">
                                    <p>No trending hashtags available</p>
                                </div>
                            )}
                        </div>

                        {/* Risk Legend */}
                        <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-200/50">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-xs text-slate-600">High Risk</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span className="text-xs text-slate-600">Medium Risk</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-slate-600">Low Risk</span>
                            </div>
                        </div>

                        {/* Top Hashtags List */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-slate-700 text-sm">Top 5 Trending</h4>
                            <div className="space-y-2">
                                {hashtags && hashtags.length > 0 ? hashtags.slice(0, 5).map((hashtag, index) => (
                                    <div key={hashtag.tag} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="text-xs">
                                                #{index + 1}
                                            </Badge>
                                            <span className="font-medium text-slate-700">{hashtag.tag}</span>
                                            {getTrendIcon(hashtag.trend)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-600">
                                                {(hashtag.interest_score || 0).toLocaleString()}
                                            </span>
                                            <Badge className={`text-xs ${getRiskColor(hashtag.risk)}`}>
                                                {hashtag.risk}
                                            </Badge>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-4 text-slate-500">
                                        <p>No hashtags to display</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TrendingHashtags;