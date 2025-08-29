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
    AreaChart,
    BarChart,
    Bar
} from 'recharts';

const FatalityTrendsChart = ({ data = [] }) => {
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-slate-200/50">
                    <p className="font-semibold text-slate-700">{`Date: ${label}`}</p>
                    <p className="text-red-600">
                        {`Fatalities: ${payload[0].value}`}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-6">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    Fatality Trends Over Time
                </h3>
                <p className="text-sm text-slate-600">Daily fatality counts from protest events</p>
            </div>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorFatalities" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
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
                            dataKey="fatalities"
                            stroke="#ef4444"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorFatalities)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default FatalityTrendsChart;