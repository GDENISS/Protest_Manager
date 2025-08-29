import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';

const IncidentTrendsChart = ({ data = [] }) => {
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-slate-200/50">
                    <p className="font-semibold text-slate-700">{`Date: ${label}`}</p>
                    <p className="text-blue-600">
                        {`Incidents: ${payload[0].value}`}
                    </p>
                    <p className="text-green-600">
                        {`Participants: ${payload[1]?.value || 0}`}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-6">
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                            dataKey="date" 
                            stroke="#64748b"
                            fontSize={12}
                            tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="incidents"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorIncidents)"
                        />
                        <Line
                            type="monotone"
                            dataKey="participants"
                            stroke="#10b981"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default IncidentTrendsChart;