import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import { PackageCard } from '../components/PackageCard';
import { SearchBar } from '../components/SearchBar';
import { ArrowUpDown, ArrowRightLeft, X, CheckCircle2 } from 'lucide-react';

export const Packages: React.FC = () => {
  const { packages } = useTravel();
  const [searchParams] = useSearchParams();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  // Compare State
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  const handleCompareToggle = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(pId => pId !== id);
      if (prev.length >= 3) {
        setCompareError('You can compare up to 3 packages at a time.');
        setTimeout(() => setCompareError(null), 4500);
        return prev;
      }
      return [...prev, id];
    });
  };

  const comparedPackages = packages.filter(p => compareIds.includes(p.id));

  // Read search parameters from URL on component mount
  useEffect(() => {
    const q = searchParams.get('search');
    const cat = searchParams.get('category');
    if (q) setSearchQuery(q);
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  // Filtering Logic
  // TODO: Replace client-side filter with API call: GET /api/packages?search=query&category=cat&duration=val&price=val&sort=val
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = 
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.includedServices.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || pkg.category === selectedCategory;

    let matchesDuration = true;
    if (selectedDuration === '1-2') {
      matchesDuration = pkg.durationDays >= 1 && pkg.durationDays <= 2;
    } else if (selectedDuration === '3-4') {
      matchesDuration = pkg.durationDays >= 3 && pkg.durationDays <= 4;
    } else if (selectedDuration === '5+') {
      matchesDuration = pkg.durationDays >= 5;
    }

    let matchesPrice = true;
    if (selectedPriceRange === 'under-200') {
      matchesPrice = pkg.price < 200;
    } else if (selectedPriceRange === '200-300') {
      matchesPrice = pkg.price >= 200 && pkg.price <= 300;
    } else if (selectedPriceRange === 'over-300') {
      matchesPrice = pkg.price > 300;
    }

    return matchesSearch && matchesCategory && matchesDuration && matchesPrice;
  });

  // Sorting Logic
  const sortedPackages = [...filteredPackages].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0; // default (initial order)
  });

  return (
    <main className="w-full relative">
      {compareError && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-lg bg-red-50 border-red-150 text-error-red animate-fade-in">
          <span>{compareError}</span>
          <button onClick={() => setCompareError(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm px-1.5 ml-4">&times;</button>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16 space-y-8">
        {/* Premium Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden min-h-[400px] flex items-center justify-center text-center shadow-2xl mb-12">
          <div className="absolute inset-0 z-0">
            {/* We'll use sigiriya as the hero background */}
            <img src="/src/assets/destinations/sigiriya.png" alt="Sigiriya" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-slate-900/50 mix-blend-multiply backdrop-blur-[2px]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80"></div>
          </div>
          
          <div className="relative z-10 max-w-3xl px-6 flex flex-col items-center pt-8">
            <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-6 shadow-lg tracking-widest uppercase">Premium Travel Catalog</span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight drop-shadow-lg">
              Discover the Wonders of <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-white">Sri Lanka</span>
            </h1>
            <p className="text-lg text-slate-200 font-medium max-w-2xl mx-auto drop-shadow-md mb-8">
              Browse our curated selection of luxury travel packages featuring handpicked stays, certified local guides, and bespoke itineraries.
            </p>
          </div>
        </div>

        {/* Advanced Search Bar Component - Floating */}
        <div className="-mt-20 relative z-20 px-2 sm:px-4">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            showExtraFilters={true}
            selectedDuration={selectedDuration}
            setSelectedDuration={setSelectedDuration}
            selectedPriceRange={selectedPriceRange}
            setSelectedPriceRange={setSelectedPriceRange}
          />
        </div>

        {/* Sorting Controls */}
        <div className="flex justify-between items-center bg-white rounded-2xl px-5 py-3.5 border border-slate-100 shadow-xs">
          <p className="text-xs font-bold text-slate-500">
            Showing {sortedPackages.length} package{sortedPackages.length !== 1 && 's'}
          </p>
          
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="h-4 w-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-bold text-slate-700 bg-transparent border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:border-primary-blue cursor-pointer"
            >
              <option value="default">Sort by: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Packages Grid */}
        {sortedPackages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPackages.map(pkg => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                isCompared={compareIds.includes(pkg.id)}
                onCompareToggle={handleCompareToggle}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-xs">
            <p className="text-slate-400 font-bold text-lg">No tour packages match your filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedDuration('All');
                setSelectedPriceRange('All');
                setSortBy('default');
              }}
              className="mt-4 bg-primary-blue hover:bg-sky-500 text-white font-bold text-sm px-6 py-2 rounded-xl transition-all shadow-md"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Compare Floating Bar */}
        {compareIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-2xl border border-slate-200 px-6 py-3 flex items-center space-x-6 z-40">
            <div className="text-sm font-bold text-slate-700">
              <span className="text-primary-blue">{compareIds.length}</span> / 3 Selected
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCompareModal(true)}
                className="bg-primary-blue hover:bg-sky-500 text-white font-bold text-sm px-5 py-2 rounded-full transition-all shadow-md flex items-center space-x-2"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Compare</span>
              </button>
              <button
                onClick={() => setCompareIds([])}
                className="text-slate-400 hover:text-slate-600 p-2"
                title="Clear comparison"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Compare Modal */}
        {showCompareModal && comparedPackages.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-extrabold text-deep-navy flex items-center space-x-2">
                  <ArrowRightLeft className="w-5 h-5 text-primary-blue" />
                  <span>Compare Packages</span>
                </h2>
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 rounded-full p-2 transition-colors border border-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {comparedPackages.map(pkg => (
                    <div key={pkg.id} className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
                      <div className="w-full h-40 bg-slate-100 overflow-hidden relative">
                        <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-5 flex-grow flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{pkg.name}</h3>
                        <p className="text-primary-blue font-extrabold text-xl mb-4">${pkg.price}</p>
                        
                        <div className="space-y-3 text-sm text-slate-600 flex-grow">
                          <div className="flex justify-between pb-2 border-b border-slate-100">
                            <span className="font-semibold text-slate-400">Duration</span>
                            <span className="font-bold">{pkg.durationDays} Days</span>
                          </div>
                          <div className="flex justify-between pb-2 border-b border-slate-100">
                            <span className="font-semibold text-slate-400">Category</span>
                            <span className="font-bold">{pkg.category}</span>
                          </div>
                          <div className="flex justify-between pb-2 border-b border-slate-100">
                            <span className="font-semibold text-slate-400">Max Group</span>
                            <span className="font-bold">{pkg.maxGroupSize}</span>
                          </div>
                          
                          <div className="pt-2">
                            <span className="font-semibold text-slate-400 block mb-2">Included</span>
                            <ul className="space-y-1">
                              {pkg.includedServices.slice(0, 4).map((service, i) => (
                                <li key={i} className="flex items-start space-x-2 text-xs">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                  <span>{service}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-slate-100">
                          <button
                            onClick={() => {
                              setCompareIds(prev => prev.filter(id => id !== pkg.id));
                              if (compareIds.length === 1) setShowCompareModal(false);
                            }}
                            className="w-full text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 py-2 rounded-xl transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
