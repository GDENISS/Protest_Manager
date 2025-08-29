// src/components/dashboard/Header.jsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Map, Bell, Download, Settings } from 'lucide-react';

const Header = () => (
  <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Map className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Spatial Protest Management</h1>
            <p className="text-slate-600">Monitoring and analytics platform</p>
          </div>
        </div>

        {/* <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" /> Alerts
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" /> Settings
          </Button>
        </div> */}
      </div>
    </div>
  </div>
);

export default Header;
