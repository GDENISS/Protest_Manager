import React, { useState } from 'react';
import { Eye, EyeOff, X, Info } from 'lucide-react';

const AnalysisControlPanel = ({ spatialAnalysis, onClearAnalysis }) => {
  const [showPanel, setShowPanel] = useState(true);

  if (!spatialAnalysis.results?.geometries || spatialAnalysis.results.geometries.length === 0) {
    return null;
  }

  const { results, type } = spatialAnalysis;

  return (
    <div className="absolute top-20 right-4 z-[1000] max-w-sm">
      <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/30 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
              <Info size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 capitalize">{type} Analysis</h3>
              <p className="text-sm text-gray-600">{results.metadata?.type}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPanel(!showPanel)}
              className="p-2 hover:bg-white/50 rounded-xl transition-all duration-200"
            >
              {showPanel ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button
              onClick={onClearAnalysis}
              className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-all duration-200"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {showPanel && (
          <div className="p-4 space-y-4">
            {/* Results Summary */}
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">{results.message}</p>
            </div>

            {/* Metadata */}
            {results.metadata && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 text-sm">Analysis Details</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(results.metadata).map(([key, value]) => (
                    <div key={key} className="p-2 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                      <div className="text-gray-800 font-semibold">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 text-sm">Legend</h4>
              <div className="space-y-1">
                {type === 'buffer' && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-3 bg-blue-200 border-2 border-blue-500 rounded" style={{ borderStyle: 'dashed' }}></div>
                    <span>Hospital Coverage Areas (1km)</span>
                  </div>
                )}
                {type === 'proximity' && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-1 bg-red-500 rounded" style={{ borderStyle: 'dashed' }}></div>
                    <span>Protest-Police Connections (&lt;2km)</span>
                  </div>
                )}
                {type === 'density' && (
                  <>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-4 h-3 bg-green-400 rounded"></div>
                      <span>Low Density (1-2 protests)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-4 h-3 bg-yellow-400 rounded"></div>
                      <span>Medium Density (3-5 protests)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-4 h-3 bg-red-400 rounded"></div>
                      <span>High Density (5+ protests)</span>
                    </div>
                  </>
                )}
                {type === 'hotspot' && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-3 bg-red-200 border-2 border-red-600 rounded" style={{ borderStyle: 'dashed' }}></div>
                    <span>Protest Hotspots (1.5km radius)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisControlPanel;