import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '../contexts/DataContext';
import { 
    AlertTriangle, 
    TrendingUp, 
    Users, 
    MapPin, 
    Shield, 
    Hospital,
    Activity,
    Clock,
    Skull,
    Calendar
} from 'lucide-react';

const KeyMetrics = ({ isRefreshing = false }) => {
    const { metrics, data } = useData();

    const metricCards = [
        {
            title: "Total Events",
            value: metrics.totalProtests,
            icon: Activity,
            change: metrics.yearRange ? `${metrics.yearRange.min}-${metrics.yearRange.max}` : "All Time",
            changeType: "neutral",
            color: "blue",
            description: "All recorded protest events"
        },
        {
            title: "Recent Events",
            value: metrics.activeProtests,
            icon: Clock,
            change: "Last 30 days",
            changeType: "increase",
            color: "orange",
            description: "Events in past month"
        },
        {
            title: "High Risk Events",
            value: metrics.highRiskEvents,
            icon: AlertTriangle,
            change: `${((metrics.highRiskEvents / metrics.totalProtests) * 100).toFixed(1)}%`,
            changeType: "decrease",
            color: "red",
            description: "Events with fatalities"
        },
        {
            title: "Total Fatalities",
            value: metrics.totalFatalities,
            icon: Skull,
            change: `${metrics.eventsWithFatalities} events`,
            changeType: "decrease",
            color: "purple",
            description: "Across all recorded events"
        },
        {
            title: "Hospitals",
            value: metrics.totalHospitals,
            icon: Hospital,
            change: "Available",
            changeType: "neutral",
            color: "green",
            description: "Emergency facilities"
        },
        {
            title: "Police Stations",
            value: metrics.totalPoliceStations,
            icon: Shield,
            change: "Response units",
            changeType: "neutral",
            color: "indigo",
            description: "Security resources"
        }
    ];

    const colorVariants = {
        blue: "from-blue-500 to-blue-600",
        orange: "from-orange-500 to-orange-600",
        red: "from-red-500 to-red-600",
        green: "from-green-500 to-green-600",
        purple: "from-purple-500 to-purple-600",
        indigo: "from-indigo-500 to-indigo-600"
    };

    if (data.loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {metricCards.map((metric, index) => {
                const Icon = metric.icon;
                return (
                    <Card 
                        key={index} 
                        className={`bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 ${isRefreshing ? 'opacity-75' : ''}`}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${colorVariants[metric.color]} shadow-lg group-hover:scale-110 transition-transform`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                                <Badge 
                                    variant="secondary" 
                                    className={`${
                                        metric.changeType === 'increase' 
                                            ? 'bg-green-100 text-green-700' 
                                            : metric.changeType === 'decrease'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-blue-100 text-blue-700'
                                    }`}
                                >
                                    {metric.change}
                                </Badge>
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="font-semibold text-slate-700 text-sm">
                                    {metric.title}
                                </h3>
                                <div className="text-3xl font-bold text-slate-900 group-hover:scale-110 transition-transform">
                                    {metric.value.toLocaleString()}
                                </div>
                                <p className="text-xs text-slate-600">
                                    {metric.description}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default KeyMetrics;