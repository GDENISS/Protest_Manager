import React, { useState, useMemo } from 'react';
import { Route, Building2, Shield, AlertTriangle, Activity, BarChart3, MapIcon, Target, Eye, EyeOff } from 'lucide-react';

const MapStatistics = ({ data, isLoading, spatialMetrics }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [activeMetric, setActiveMetric] = useState('overview');

  const stats = useMemo(() => ({
    roads: data.roads?.features?.length || 0,
    hospitals: data.hospitals?.features?.length || 0,
    police: data.police?.features?.length || 0,
    protests: data.protests?.features?.length || 0,
    wards: data.wards?.features?.length || 0
  }), [data]);

  const totalFeatures = Object.values(stats).reduce((sum, count) => sum + count, 0);

  const statCards = [
    { key: 'roads', label: 'Road Network', icon: Route, color: 'orange', value: stats.roads },
    { key: 'hospitals', label: 'Hospitals', icon: Building2, color: 'purple', value: stats.hospitals },
    { key: 'police', label: 'Police Stations', icon: Shield, color: 'gray', value: stats.police },
    { key: 'protests', label: 'Protest Events', icon: AlertTriangle, color: 'red', value: stats.protests },
    { key: 'wards', label: 'Admin Wards', icon: Activity, color: 'orange', value: stats.wards }
  ];

  const metricTabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'spatial', label: 'Spatial', icon: MapIcon },
    { key: 'analysis', label: 'Analysis', icon: Target }
  ];

  return (
    <div className="absolute top-4 left-4 z-[1000] max-w-sm">
      <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/30 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <BarChart3 size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">GIS Overview</h3>
              <p className="text-sm text-gray-600">Spatial Analytics</p>
            </div>
            {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
          </div>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="p-2 hover:bg-white/50 rounded-xl transition-all duration-200 group"
          >
            {isVisible ? <EyeOff size={16} className="group-hover:scale-110 transition-transform" /> : <Eye size={16} className="group-hover:scale-110 transition-transform" />}
          </button>
        </div>

        {isVisible && (
          <div className="p-6 space-y-6">
            {/* Tab Navigation */}
            <div className="flex bg-gray-100/80 rounded-2xl p-1">
              {metricTabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveMetric(key)}
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeMetric === key
                      ? 'bg-white shadow-lg text-blue-600 scale-105'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                  }`}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Content based on active metric */}
            {activeMetric === 'overview' && (
              <div className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {totalFeatures.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Total Features</div>
                </div>

                {statCards.map(({ key, label, icon: Icon, color, value }) => (
                  <div key={key} className={`flex justify-between items-center p-4 bg-${color}-50 rounded-2xl border border-${color}-100 hover:shadow-lg transition-all duration-300 group`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-${color}-100 rounded-xl group-hover:scale-110 transition-transform`}>
                        <Icon size={16} className={`text-${color}-600`} />
                      </div>
                      <span className="text-gray-700 font-medium text-sm">{label}</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold text-${color}-600 text-lg`}>{value.toLocaleString()}</span>
                      {totalFeatures > 0 && (
                        <div className="text-xs text-gray-500">
                          {((value / totalFeatures) * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeMetric === 'spatial' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                    <div className="text-lg font-bold text-green-600">
                      {spatialMetrics?.totalArea?.toFixed(1) || '0'} km²
                    </div>
                    <div className="text-xs text-gray-600">Total Area</div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                    <div className="text-lg font-bold text-yellow-600">
                      {spatialMetrics?.roadLength?.toFixed(1) || '0'} km
                    </div>
                    <div className="text-xs text-gray-600">Road Length</div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                  <div className="text-sm font-medium text-purple-700 mb-2">Density Analysis</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Hospitals/km²</span>
                      <span className="font-medium">{spatialMetrics?.hospitalDensity?.toFixed(2) || '0'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Police/km²</span>
                      <span className="font-medium">{spatialMetrics?.policeDensity?.toFixed(2) || '0'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeMetric === 'analysis' && (
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <div className="text-sm font-medium text-indigo-700 mb-2">Proximity Analysis</div>
                  <div className="text-xs text-gray-600">
                    Average distance to nearest hospital: {spatialMetrics?.avgHospitalDistance?.toFixed(2) || '0'} km
                  </div>
                </div>

                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                  <div className="text-sm font-medium text-rose-700 mb-2">Risk Assessment</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>High Risk Areas</span>
                      <span className="font-medium text-rose-600">{spatialMetrics?.highRiskAreas || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Protest Hotspots</span>
                      <span className="font-medium text-rose-600">{spatialMetrics?.protestHotspots || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapStatistics;