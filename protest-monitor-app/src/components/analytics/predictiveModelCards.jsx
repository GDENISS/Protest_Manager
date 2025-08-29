// src/components/analytics/PredictiveModelCards.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BrainCircuit, LocateFixed, ShieldAlert } from 'lucide-react';

const models = [
  {
    title: 'Protest Density Forecast',
    description: 'Predicts future protest hotspots based on historical and spatial data.',
    icon: <LocateFixed className="w-6 h-6 text-rose-600" />,
  },
  {
    title: 'Risk Factor Estimator',
    description: 'Estimates risk levels by analyzing socio-economic indicators.',
    icon: <ShieldAlert className="w-6 h-6 text-yellow-600" />,
  },
  {
    title: 'AI Protest Dynamics Model',
    description: 'Machine learning model for dynamic protest behavior simulation.',
    icon: <BrainCircuit className="w-6 h-6 text-purple-600" />,
  },
];

const PredictiveModelCards = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {models.map((model, index) => (
      <Card key={index} className="bg-white/60 backdrop-blur border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {model.icon}
            {model.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700">{model.description}</p>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default PredictiveModelCards;
