import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '../contexts/DataContext';
import Header from './Header';
import TabNavigation from './TabNavigation';
import KeyMetrics from '../metrics/KeyMetrics';
import IncidentTrendsChart from '../charts/IncidentTrendsChart';
import FatalityTrendsChart from '../charts/FatalityTrendsChart';
import RegionalDistributionChart from '../charts/RegionalDistributionChart';
import InteractiveMap from '../map/InteractiveMap';
import EnhancedNairobiMap from '../map/EnhancedMap';
import RiskAssessmentPie from '../charts/RiskAssessmentPie';
import HotspotList from '../map/HotspotList';
import TrendingHashtags from '../analytics/TrendingHashtags';
import SocialMediaIntelligence from '../analytics/SocialMediaIntelligence';
import ReportButtonsGrid from '../reports/ReportButtonsGrid';
import ParticipantGrowthChart from '../charts/ParticipantGrowthChart';
import SpatialAnalysis from '../analysis/SpatialAnalysis';
import RiskSurfaceMap from '../analysis/RiskSurfaceMap';
import PredictiveModelCards from '../analytics/PredictiveModelCards';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertTriangle,
    TrendingUp,
    Map,
    FileText,
    BarChart3,
    RefreshCw,
    Bell,
    Settings,
    Download,
    Share2,
    Filter,
    Calendar,
    Clock,
    Activity,
    User,
    Users
} from 'lucide-react';

const ProtestDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [notifications, setNotifications] = useState(3);

    // Get data from context
    const { data, metrics, chartData, refetch } = useData();

    // Manual refresh function
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setLastUpdated(new Date());
        setIsRefreshing(false);
    };

    // Tab configuration with enhanced metadata using real data
    const tabConfig = {
        overview: {
            icon: TrendingUp,
            label: 'Overview',
            description: 'Key metrics and trends',
            badge: metrics.activeProtests > 0 ? metrics.activeProtests : null,
            badgeColor: 'bg-blue-500'
        },
        spatial: {
            icon: Map,
            label: 'Spatial',
            description: 'Geographic insights',
            badge: metrics.highRiskEvents > 0 ? metrics.highRiskEvents : null,
            badgeColor: 'bg-red-500'
        },
        analysis: {
            icon: BarChart3,
            label: 'Analysis',
            description: 'Spatial Analysis',
            badge: null,
            badgeColor: 'bg-purple-500'
        },
        reports: {
            icon: FileText,
            label: 'Reports',
            description: 'Generate reports',
            badge: null,
            badgeColor: 'bg-green-500'
        },
        analytics: {
            icon: Activity,
            label: 'Analytics',
            description: 'Advanced analysis',
            badge: null,
            badgeColor: 'bg-indigo-500'
        }
    };

    if (data.loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <RefreshCw className="h-12 w-12 animate-spin mx-auto text-blue-600" />
                    <h2 className="text-xl font-semibold text-slate-700">Loading Dashboard Data...</h2>
                    <p className="text-slate-500">Fetching latest protest monitoring data</p>
                </div>
            </div>
        );
    }

    if (data.error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
                <Alert className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        Error loading data: {data.error}
                        <Button onClick={handleRefresh} className="mt-2 w-full">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
            {/* Enhanced Header with real-time status */}
            <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200/60 shadow-sm">
                <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* <Header /> */}

                        {/* Enhanced Header Controls */}
                        <div className="flex items-center gap-4">
                            {/* System Status Indicator */}
                            <div className="flex items-center gap-3">
                                      <div className="p-2 bg-blue-600 rounded-lg">
                                        <Map className="w-6 h-6 text-white" />
                                      </div>
                                      <div>
                                        <h1 className="text-2xl font-bold text-slate-900">Spatial Protest Management</h1>
                                        <p className="text-slate-600">Monitoring and analytics platform</p>
                                      </div>
                                    </div>
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-green-700">
                                    {(data.protests?.features || data.protests || []).length} Events Loaded
                                </span>
                            </div>

                            {/* Last Updated Time */}
                            <div className="hidden md:flex items-center gap-2 text-sm text-slate-600">
                                <Clock className="h-4 w-4" />
                                <span>Updated {lastUpdated.toLocaleTimeString()}</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="relative">
                                    <Bell className="h-4 w-4" />
                                    {notifications > 0 && (
                                        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                                            {notifications}
                                        </Badge>
                                    )}
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                >
                                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                </Button>

                                <Button variant="ghost" size="sm">
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Bar with Real Data */}
            <div className="bg-white/60 backdrop-blur-sm border-b border-slate-200/50">
                <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-slate-700">
                                    {metrics.activeProtests} Active Events
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                <span className="text-sm font-medium text-slate-700">
                                    {metrics.highRiskEvents} High Risk
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-purple-600" />  {/* Changed from Users to User */}
                                <span className="text-sm font-medium text-slate-700">
                                    {Math.round(metrics.averageParticipants)} Avg Participants
                                </span>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="gap-2">
                                <Download className="h-3 w-3" />
                                Export Data
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Share2 className="h-3 w-3" />
                                Share Report
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Container */}
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    {/* Enhanced Tab Navigation with Real Data Badges */}
                    <div className="flex justify-center">
                        <TabsList className="inline-flex h-16 items-center justify-center rounded-2xl bg-white/80 backdrop-blur-xl p-2 shadow-xl border border-slate-200/50">
                            {Object.entries(tabConfig).map(([key, config]) => {
                                const Icon = config.icon;
                                return (
                                    <TabsTrigger
                                        key={key}
                                        value={key}
                                        className="relative inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-100/80 gap-3 group min-w-[120px]"
                                    >
                                        <Icon className="h-5 w-5 transition-transform group-data-[state=active]:scale-110" />
                                        <div className="flex flex-col items-start">
                                            <span className="font-semibold">{config.label}</span>
                                            <span className="text-xs opacity-70 hidden sm:block">
                                                {config.description}
                                            </span>
                                        </div>

                                        {config.badge && (
                                            <Badge className={`absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs ${config.badgeColor} text-white`}>
                                                {config.badge}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </div>

                    {/* Rest of your existing tabs content */}
                    <TabsContent value="overview" className="space-y-8 animate-in fade-in-50 duration-500">
                        <div className="transform hover:scale-[1.01] transition-all duration-300">
                            <KeyMetrics isRefreshing={isRefreshing} />
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <div className="group">
                                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02]">
                                    <div className="p-6 border-b border-slate-200/50 bg-gradient-to-r from-red-50 to-rose-50">
                                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-red-600" />
                                            Fatality Trends
                                        </h3>
                                    </div>
                                    <FatalityTrendsChart data={chartData.fatalityTrends} />
                                </div>
                            </div>

                            <div className="group">
                                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02]">
                                    <div className="p-6 border-b border-slate-200/50 bg-gradient-to-r from-green-50 to-emerald-50">
                                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                            <Map className="h-5 w-5 text-green-600" />
                                            Regional Distribution
                                        </h3>
                                    </div>
                                    <RegionalDistributionChart data={chartData.regionalDistribution} />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            <div className="xl:col-span-2">
                                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 hover:shadow-2xl transition-all duration-300">
                                    <ParticipantGrowthChart data={chartData.participantGrowth} />
                                </div>
                            </div>
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 hover:shadow-2xl transition-all duration-300">
                                <RiskAssessmentPie data={chartData.riskAssessment} />
                            </div>
                        </div>

                        {/* Enhanced Social Media Intelligence Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <TrendingHashtags />
                            <SocialMediaIntelligence metrics={metrics} />
                        </div>

                        {/* System Status Panel */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 hover:shadow-2xl transition-all duration-300">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                                        <Activity className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">System Analytics</h3>
                                        <p className="text-sm text-slate-600">Real-time performance metrics</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-sm font-medium text-green-800">System Status</span>
                                        </div>
                                        <div className="text-2xl font-bold text-green-700">ACTIVE</div>
                                        <div className="text-xs text-green-600">All services operational</div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users className="h-3 w-3 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-800">Data Sources</span>
                                        </div>
                                        <div className="text-2xl font-bold text-blue-700">4</div>
                                        <div className="text-xs text-blue-600">APIs connected</div>
                                    </div>
                                </div>

                                {/* Real-time Status Indicators */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Bell className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-semibold text-blue-800">System Status</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-blue-700">Database Events Loaded</span>
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                                {metrics.totalProtests} Records
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-blue-700">Risk Assessment Coverage</span>
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                                {((metrics.eventsWithFatalities / metrics.totalProtests) * 100).toFixed(1)}% Fatal Events
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-blue-700">Recent Activity (30 days)</span>
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                metrics.activeProtests > 10 ? 'bg-red-100 text-red-800' :
                                                metrics.activeProtests > 5 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {metrics.activeProtests > 10 ? 'High Activity' :
                                                 metrics.activeProtests > 5 ? 'Moderate' : 'Low Activity'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Spatial Tab */}
                    <TabsContent
                        value="spatial"
                        className="relative h-[calc(100vh-16rem)] animate-in fade-in-50 duration-500"
                    >
                        <div className="relative h-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 group">
                            <EnhancedNairobiMap />
                        </div>
                    </TabsContent>

                    {/* New Spatial Analysis Tab */}
                    <TabsContent value="analysis" className="space-y-8 animate-in fade-in-50 duration-500">
                        <div className="space-y-8">
                            <SpatialAnalysis />
                            <RiskSurfaceMap />
                        </div>
                    </TabsContent>

                    {/* Reports Tab */}
                    <TabsContent value="reports" className="space-y-8 animate-in fade-in-50 duration-500">
                        <div className="text-center space-y-2 mb-8">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                                Generate Reports
                            </h2>
                            <p className="text-slate-600 max-w-2xl mx-auto">
                                Create comprehensive reports with {metrics.totalProtests} events and real-time data
                            </p>
                        </div>

                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50 p-8">
                            <ReportButtonsGrid data={data} metrics={metrics} />
                        </div>
                    </TabsContent>

                    {/* Analytics Tab */}
                    {/* <TabsContent value="analytics" className="space-y-8 animate-in fade-in-50 duration-500">
                        <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/60 rounded-2xl shadow-lg">
                            <AlertTriangle className="h-5 w-5 text-blue-600" />
                            <AlertDescription className="text-blue-800 font-medium">
                                Analytics based on {metrics.totalProtests} events with {Math.round(metrics.averageParticipants)} average participants
                            </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 transform hover:scale-[1.02] transition-all duration-300">
                                    <ParticipantGrowthChart data={chartData.participantGrowth} />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 transform hover:scale-[1.02] transition-all duration-300">
                                    <PredictiveModelCards data={data} metrics={metrics} />
                                </div>
                            </div>
                        </div>

                        {/* Analytics Statistics */}
                       {/*  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 group hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 transition-all duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                                    <h3 className="font-semibold text-slate-700">Model Accuracy</h3>
                                </div>
                                <div className="text-3xl font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform">94.7%</div>
                                <p className="text-sm text-slate-600">Prediction accuracy this month</p>
                            </div>

                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 group hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 transition-all duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full animate-pulse"></div>
                                    <h3 className="font-semibold text-slate-700">Data Processing</h3>
                                </div>
                                <div className="text-3xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform">2.3M</div>
                                <p className="text-sm text-slate-600">Data points processed today</p>
                            </div>

                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 group hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-pulse"></div>
                                    <h3 className="font-semibold text-slate-700">AI Insights</h3>
                                </div>
                                <div className="text-3xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform">47</div>
                                <p className="text-sm text-slate-600">New insights generated</p>
                            </div>
                        </div>
                    </TabsContent> */}
                </Tabs>
            </div>
        </div>
    );
};

export default ProtestDashboard;