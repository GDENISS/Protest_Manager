import React from 'react';
import { MapPin } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="text-center p-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 max-w-md">
        <div className="relative">
          <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-blue-600 mb-6 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="text-blue-600" size={32} />
          </div>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          Loading Nairobi GIS
        </h2>
        <p className="text-gray-600 mb-4">Initializing spatial analytics platform...</p>
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <div className="mt-6 text-sm text-gray-500">
          Loading geospatial datasets and initializing Turf.js processing...
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;