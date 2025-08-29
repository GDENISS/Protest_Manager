// src/components/dashboard/TabNavigation.jsx
import React from 'react';
import { TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Map, Download, TrendingUp } from 'lucide-react';

const TabNavigation = () => (
  <>
    <TabsTrigger value="overview" className="flex items-center gap-2">
      <BarChart3 className="w-4 h-4" /> Overview
    </TabsTrigger>
    <TabsTrigger value="spatial" className="flex items-center gap-2">
      <Map className="w-4 h-4" /> Spatial Analysis
    </TabsTrigger>
    <TabsTrigger value="reports" className="flex items-center gap-2">
      <Download className="w-4 h-4" /> Reports
    </TabsTrigger>
    <TabsTrigger value="analytics" className="flex items-center gap-2">
      <TrendingUp className="w-4 h-4" /> Analytics
    </TabsTrigger>
  </>
);

export default TabNavigation;
