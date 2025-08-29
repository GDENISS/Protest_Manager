// src/components/map/HotspotList.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { regionData } from '@/data/regionData';

const HotspotList = () => (
  <Card className="bg-white/70 backdrop-blur-sm border border-slate-200 shadow-sm rounded-lg text-sm">
    <CardHeader className="py-2 px-3">
      <CardTitle className="text-sm font-semibold">Active Hotspots</CardTitle>
    </CardHeader>

    <CardContent className="py-2 px-3 space-y-2">
      {regionData.slice(0, 3).map((region, index) => (
        <div
          key={index}
          className="flex items-center justify-between px-2 py-2 bg-slate-50/70 rounded-md"
        >
          <div>
            <div className="font-medium text-xs">{region.name}</div>
            <div className="text-[10px] text-slate-600">{region.participants} participants</div>
          </div>
          <Badge
            className="text-[10px] px-2 py-0.5"
            variant={
              region.risk === 'high'
                ? 'destructive'
                : region.risk === 'medium'
                ? 'default'
                : 'secondary'
            }
          >
            {region.risk}
          </Badge>
        </div>
      ))}
    </CardContent>
  </Card>
);

export default HotspotList;
