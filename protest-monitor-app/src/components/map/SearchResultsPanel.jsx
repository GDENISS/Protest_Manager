import React from 'react';
import { Search } from 'lucide-react';

const SearchResultsPanel = ({ searchTerm }) => {
  if (!searchTerm || searchTerm.length <= 2) return null;

  return (
    <div className="absolute top-20 left-4 z-[1000] bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl p-4 border border-white/30 max-w-sm">
      <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        <Search size={16} className="text-blue-600" />
        Search Results
      </h3>
      <div className="text-sm text-gray-600">
        <p>Searching for "<span className="font-medium text-gray-800">{searchTerm}</span>"...</p>
        <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-blue-700 text-xs">Advanced search with spatial indexing coming soon!</p>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPanel;