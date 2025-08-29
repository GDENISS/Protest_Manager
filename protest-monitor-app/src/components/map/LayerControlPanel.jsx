import React, { useState } from 'react';
import { Target, MapPin, BarChart3, Zap, Layers, Filter, RefreshCw } from 'lucide-react';

const LayerControlPanel = ({ layers, onLayerToggle, spatialAnalysis, onSpatialAnalysis }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [analysisType, setAnalysisType] = useState('buffer');

  const analysisOptions = [
    { key: 'buffer', label: 'Buffer Analysis', icon: Target },
    { key: 'proximity', label: 'Proximity Analysis', icon: MapPin },
    { key: 'density', label: 'Density Analysis', icon: BarChart3 },
    { key: 'hotspot', label: 'Hotspot Analysis', icon: Zap }
  ];

  return (
    <div className="absolute top-4 right-20 z-[1000]">
      <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/30 overflow-hidden">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50/80 transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
              <Layers size={18} className="text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-800">Layers & Analysis</div>
              <div className="text-xs text-gray-600">Spatial Tools</div>
            </div>
          </div>
          <Filter size={16} className="text-gray-500 group-hover:scale-110 transition-transform" />
        </button>

        {isVisible && (
          <div className="border-t border-gray-100/80 max-h-96 overflow-y-auto">
            {/* Layer Controls */}
            <div className="p-4 space-y-3">
              <h4 className="font-semibold text-gray-700 text-sm">Map Layers</h4>
              {Object.entries(layers).map(([key, layer]) => (
                <label key={key} className="flex items-center gap-3 p-3 hover:bg-gray-50/80 rounded-xl cursor-pointer transition-all duration-200 group">
                  <input
                    type="checkbox"
                    checked={layer.visible}
                    onChange={() => onLayerToggle(key)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-2 border-gray-300"
                  />
                  <span className="text-2xl group-hover:scale-110 transition-transform">{layer.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 text-sm">{layer.label}</div>
                    <div className="text-xs text-gray-500">{layer.count} features</div>
                  </div>
                </label>
              ))}
            </div>

            {/* Spatial Analysis Tools */}
            <div className="border-t border-gray-100/80 p-4 space-y-3">
              <h4 className="font-semibold text-gray-700 text-sm">Spatial Analysis</h4>

              <select
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {analysisOptions.map(({ key, label }) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>

              <button
                onClick={() => onSpatialAnalysis(analysisType)}
                disabled={spatialAnalysis.isRunning}
                className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {spatialAnalysis.isRunning ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Running Analysis...
                  </>
                ) : (
                  <>
                    <Zap size={16} className="group-hover:scale-110 transition-transform" />
                    Run Analysis
                  </>
                )}
              </button>

              {spatialAnalysis.results && (
                <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                  <div className="text-sm font-medium text-green-700">Analysis Complete</div>
                  <div className="text-xs text-green-600 mt-1">
                    {spatialAnalysis.results.message}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LayerControlPanel;