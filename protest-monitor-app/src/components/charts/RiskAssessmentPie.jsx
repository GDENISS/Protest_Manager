// src/components/charts/RiskAssessmentPie.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { riskDistribution } from '@/data/riskData';

const RiskAssessmentPie = () => (
  <Card className="bg-white/70 backdrop-blur-sm border border-slate-200 shadow-sm rounded-lg text-sm">
    <CardHeader className="py-2 px-3">
      <CardTitle className="flex items-center gap-1 text-sm font-semibold">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        Risk Assessment
      </CardTitle>
    </CardHeader>

    <CardContent className="py-2 px-3">
      {/* Pie Chart - Smaller and Responsive */}
      <div className="w-full h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={riskDistribution}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={50}
              paddingAngle={4}
              dataKey="value"
            >
              {riskDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Labels - Compact */}
      <div className="mt-2 space-y-1">
        {riskDistribution.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span>{item.name}</span>
            </div>
            <span className="font-semibold">{item.value}%</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default RiskAssessmentPie;
