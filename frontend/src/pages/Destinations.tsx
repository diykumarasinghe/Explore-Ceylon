import React, { useState } from 'react';
import { useTravel } from '../context/TravelContext';
import { DestinationCard } from '../components/DestinationCard';
import { SearchBar } from '../components/SearchBar';
import { SectionHeader } from '../components/SectionHeader';

export const Destinations: React.FC = () => {
  const { destinations } = useTravel();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter Logic
  // TODO: Replace client-side filter with API call: GET /api/destinations?search=query&category=cat
  const filteredDestinations = destinations.filter(dest => {
    const matchesSearch = 
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'All' || dest.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16 space-y-8">
        {/* Header */}
        <div className="bg-sky-bg rounded-3xl p-8 sm:p-10 border border-sky-100 relative overflow-hidden min-h-[260px] flex items-center">
          {/* Subtle decorative vector circles or waves can go here */}
          <div className="relative z-10 max-w-xl">
            <SectionHeader
              title="Explore Sri Lankan Destinations"
              subtitle="Browse through the finest landscapes of the Indian Ocean—from centuries-old royal fortresses to mist-shrouded tea plantations."
              badge="Destinations Guide"
            />
          </div>
        </div>

        {/* Search & Filters */}
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {/* Grid Display */}
        {filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-xs">
            <p className="text-slate-400 font-bold text-lg">No destinations match your search filters.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-4 bg-primary-blue hover:bg-sky-500 text-white font-bold text-sm px-6 py-2 rounded-xl transition-all shadow-md"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
};
