import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Navigation, MapPin, AlertTriangle } from 'lucide-react';

const RouteSummaryDisplay = ({ activeRoutes, routeSummaries }) => {
  if (!activeRoutes || activeRoutes.size === 0) {
    return null;
  }

  return (
    <div className="absolute top-32 left-4 z-[1000] max-w-sm">
      <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-white/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Navigation className="h-4 w-4" />
            Active Routes ({activeRoutes.size})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {routeSummaries.map((summary, index) => (
            <div key={index} className={`p-3 rounded-lg border ${
              summary.type === 'hospital' 
                ? 'bg-red-50 border-red-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {summary.type === 'hospital' ? '🚑' : '👮‍♂️'}
                  </span>
                  <span className="font-medium text-sm">
                    {summary.type === 'hospital' ? 'Emergency Route' : `Police Route ${index + 1}`}
                  </span>
                </div>
                {summary.priority && (
                  <Badge variant={
                    summary.priority === 'High' ? 'destructive' :
                    summary.priority === 'Medium' ? 'default' : 'secondary'
                  } className="text-xs">
                    {summary.priority}
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{summary.distance} km</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{summary.formattedTime}</span>
                </div>
              </div>
              
              <div className="mt-2 text-xs text-gray-600">
                <span>ETA: {summary.arrivalTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default RouteSummaryDisplay;