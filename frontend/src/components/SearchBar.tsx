import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  
  // Optional extra filters for Packages
  showExtraFilters?: boolean;
  selectedDuration?: string;
  setSelectedDuration?: (val: string) => void;
  selectedPriceRange?: string;
  setSelectedPriceRange?: (val: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  showExtraFilters = false,
  selectedDuration = '',
  setSelectedDuration,
  selectedPriceRange = '',
  setSelectedPriceRange
}) => {
  const categories = ['All', 'Beach', 'Culture', 'Wildlife', 'Hill Country', 'Adventure', 'Heritage'];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search Input */}
        <div className="relative md:col-span-6">
          <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Sigiriya, Ella, surfing, safaris..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.replace(/[^a-zA-Z0-9 ]/g, ""))}
            className="pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-blue focus:bg-white text-sm w-full text-slate-800 placeholder-slate-400 transition-all font-medium"
          />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-6">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-blue focus:bg-white text-sm text-slate-700 font-medium transition-all cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.filter(c => c !== 'All').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Extra Filters for Package Filtering */}
      {showExtraFilters && setSelectedDuration && setSelectedPriceRange && (
        <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider space-x-1 shrink-0">
            <SlidersHorizontal className="h-4 w-4 text-primary-blue" />
            <span>Refine Search:</span>
          </div>

          <div className="grid grid-cols-2 md:flex md:space-x-3 w-full gap-3">
            {/* Duration select */}
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-blue focus:bg-white text-xs text-slate-600 font-semibold transition-all cursor-pointer grow md:grow-0"
            >
              <option value="All">Any Duration</option>
              <option value="1-2">1 - 2 Days</option>
              <option value="3-4">3 - 4 Days</option>
              <option value="5+">5+ Days</option>
            </select>

            {/* Price select */}
            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-blue focus:bg-white text-xs text-slate-600 font-semibold transition-all cursor-pointer grow md:grow-0"
            >
              <option value="All">Any Budget</option>
              <option value="under-200">Under $200</option>
              <option value="200-300">$200 - $300</option>
              <option value="over-300">Over $300</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
