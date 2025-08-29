import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Activity, 
    TrendingUp, 
    Users, 
    AlertTriangle, 
    Brain, 
    Eye,
    MessageSquare,
    Target,
    Zap,
    Shield
} from 'lucide-react';

const SocialMediaIntelligence = ({ metrics }) => {
    const [hashtagData, setHashtagData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch hashtag data for analysis
    useEffect(() => {
        const fetchHashtagAnalytics = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/trending-hashtags/');
                if (response.ok) {
                    const data = await response.json();
                    const hashtags = data.hashtags || data || [];
                    setHashtagData(hashtags);
                }
            } catch (error) {
                console.warn('Could not fetch hashtag data for analysis:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHashtagAnalytics();
    }, []);

    // Calculate social intelligence metrics
    const socialMetrics = {
        totalHashtags: hashtagData.length,
        highRiskTags: hashtagData.filter(tag => tag.risk === 'high').length,
        viralPotential: hashtagData.filter(tag => (tag.interest_score || 0) > 500).length,
        emergingTrends: hashtagData.filter(tag => tag.trend === 'up').length,
        threatLevel: hashtagData.filter(tag => tag.risk === 'high').length > 3 ? 'high' : 
                    hashtagData.filter(tag => tag.risk === 'medium').length > 5 ? 'medium' : 'low',
        engagementScore: hashtagData.reduce((sum, tag) => sum + (tag.interest_score || 0), 0) / Math.max(hashtagData.length, 1)
    };

    // Get top influential hashtags
    const topInfluential = hashtagData
        .sort((a, b) => (b.interest_score || 0) - (a.interest_score || 0))
        .slice(0, 3);

    // Calculate protest correlation
    const protestCorrelation = {
        activeEvents: metrics.activeProtests || 0,
        socialBuzz: socialMetrics.totalHashtags,
        riskAlignment: socialMetrics.highRiskTags > 0 && metrics.highRiskEvents > 0,
        predictiveScore: Math.min(100, Math.round(
            (socialMetrics.viralPotential * 20) + 
            (socialMetrics.emergingTrends * 15) + 
            (socialMetrics.highRiskTags * 25)
        ))
    };

    return (
        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-slate-200/50">
                <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                        <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Social Intelligence</h3>
                        <p className="text-sm text-slate-600 font-normal">
                            AI-powered social media insights
                        </p>
                    </div>
                </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
                {/* Threat Assessment */}
                <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        socialMetrics.threatLevel === 'high' ? 'bg-red-50 border-red-200 shadow-red-100' :
                        socialMetrics.threatLevel === 'medium' ? 'bg-yellow-50 border-yellow-200 shadow-yellow-100' :
                        'bg-green-50 border-green-200 shadow-green-100'
                    }`}>
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className={`h-4 w-4 ${
                                socialMetrics.threatLevel === 'high' ? 'text-red-600' :
                                socialMetrics.threatLevel === 'medium' ? 'text-yellow-600' :
                                'text-green-600'
                            }`} />
                            <span className="text-sm font-semibold text-slate-700">Threat Level</span>
                        </div>
                        <div className={`text-2xl font-bold ${
                            socialMetrics.threatLevel === 'high' ? 'text-red-700' :
                            socialMetrics.threatLevel === 'medium' ? 'text-yellow-700' :
                            'text-green-700'
                        }`}>
                            {socialMetrics.threatLevel.toUpperCase()}
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                            Based on {socialMetrics.highRiskTags} high-risk hashtags
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-semibold text-slate-700">Prediction Score</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-700">
                            {protestCorrelation.predictiveScore}%
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                            Protest escalation likelihood
                        </div>
                    </div>
                </div>

                {/* Social Metrics Grid */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-3 border border-indigo-200">
                        <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="h-3 w-3 text-indigo-600" />
                            <span className="text-xs font-medium text-indigo-800">Active Tags</span>
                        </div>
                        <div className="text-lg font-bold text-indigo-700">{socialMetrics.totalHashtags}</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 border border-orange-200">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="h-3 w-3 text-orange-600" />
                            <span className="text-xs font-medium text-orange-800">Viral</span>
                        </div>
                        <div className="text-lg font-bold text-orange-700">{socialMetrics.viralPotential}</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <span className="text-xs font-medium text-green-800">Trending</span>
                        </div>
                        <div className="text-lg font-bold text-green-700">{socialMetrics.emergingTrends}</div>
                    </div>
                </div>

                {/* Top Influential Hashtags */}
                {topInfluential.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Most Influential
                        </h4>
                        <div className="space-y-2">
                            {topInfluential.map((tag, index) => (
                                <div key={tag.tag || index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${
                                            tag.risk === 'high' ? 'bg-red-500' :
                                            tag.risk === 'medium' ? 'bg-yellow-500' :
                                            'bg-green-500'
                                        }`}></div>
                                        <span className="font-medium text-slate-800">{tag.tag}</span>
                                        {tag.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                                    </div>
                                    <div className="text-sm font-semibold text-slate-600">
                                        {(tag.interest_score || 0).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Correlation Analysis */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Social-Physical Correlation
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Physical Events:</span>
                                <span className="font-semibold">{protestCorrelation.activeEvents}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Social Buzz:</span>
                                <span className="font-semibold">{protestCorrelation.socialBuzz}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Risk Alignment:</span>
                                <Badge variant={protestCorrelation.riskAlignment ? "destructive" : "secondary"} className="text-xs">
                                    {protestCorrelation.riskAlignment ? 'MATCHED' : 'DIVERGENT'}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Engagement:</span>
                                <span className="font-semibold">{Math.round(socialMetrics.engagementScore)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alert if high correlation */}
                {protestCorrelation.riskAlignment && socialMetrics.threatLevel === 'high' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        <div>
                            <div className="text-sm font-semibold text-red-800">High Correlation Alert</div>
                            <div className="text-xs text-red-600">
                                Social media activity aligns with physical protest risks
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default SocialMediaIntelligence;
