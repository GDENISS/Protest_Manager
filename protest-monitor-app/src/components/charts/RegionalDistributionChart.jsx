// src/components/charts/RegionalDistributionChart.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { regionData } from '@/data/regionData';

const RegionalDistributionChart = () => (
  <Card className="bg-white/60 backdrop-blur border-slate-200">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-green-600" />
        City Distribution
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={regionData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e2e8f0', borderRadius: '8px', backdropFilter: 'blur(10px)' }} />
          <Bar dataKey="incidents" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default RegionalDistributionChart;
