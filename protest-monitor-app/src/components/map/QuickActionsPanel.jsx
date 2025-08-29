import React, { useState } from 'react';
import { Zap, Target, RefreshCw, ChevronDown, ChevronUp, Minimize2, Maximize2 } from 'lucide-react';

const QuickActionsPanel = ({ mapRef, setClickedCoords, setUserLocation }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className="absolute bottom-2 right-4 z-[1000]">
      <div className={`bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/30 transition-all duration-300 ease-in-out ${
        isMinimized ? 'p-2' : 'p-4'
      }`}>
        {/* Header with toggle button */}
        <div className="flex items-center justify-between mb-3">
          {!isMinimized && (
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Zap size={14} className="text-blue-600" />
              Quick Actions
            </h4>
          )}
          <button
            onClick={toggleMinimize}
            className={`flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 ${
              isMinimized ? 'w-8 h-8' : 'w-6 h-6 ml-auto'
            }`}
            title={isMinimized ? 'Expand Quick Actions' : 'Minimize Quick Actions'}
          >
            {isMinimized ? (
              <Maximize2 size={16} className="transition-transform hover:scale-110" />
            ) : (
              <Minimize2 size={14} className="transition-transform hover:scale-110" />
            )}
          </button>
        </div>

        {/* Actions content - only show when not minimized */}
        {!isMinimized && (
          <div className="space-y-2">
            <button
              onClick={() => mapRef.current?.setView([-1.2921, 36.8219], 11)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-all duration-200 font-medium group"
            >
              <Target size={12} className="group-hover:scale-110 transition-transform" />
              Reset View
            </button>
            <button
              onClick={() => {
                setClickedCoords(null);
                setUserLocation(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-all duration-200 font-medium group"
            >
              <RefreshCw size={12} className="group-hover:scale-110 transition-transform" />
              Clear Markers
            </button>
          </div>
        )}

        {/* Minimized state indicator */}
        {isMinimized && (
          <div className="text-xs text-gray-500 text-center mt-1">
            Actions
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickActionsPanel;