// src/components/charts/ParticipantGrowthChart.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { ResponsiveContainer, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area } from 'recharts';
import { participantGrowth } from '@/data/participantData';

const ParticipantGrowthChart = () => (
  <Card className="bg-white/60 backdrop-blur border-slate-200">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="w-5 h-5 text-indigo-600" />
        Participant Growth
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={participantGrowth}>
          <defs>
            <linearGradient id="colorParticipants" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e2e8f0', borderRadius: '8px', backdropFilter: 'blur(10px)' }} />
          <Area type="monotone" dataKey="participants" stroke="#6366f1" fillOpacity={1} fill="url(#colorParticipants)" />
        </AreaChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default ParticipantGrowthChart;
