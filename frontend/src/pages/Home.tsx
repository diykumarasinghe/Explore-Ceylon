import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import { DestinationCard } from '../components/DestinationCard';
import { PackageCard } from '../components/PackageCard';
import { SectionHeader } from '../components/SectionHeader';
import { 
  Palmtree, Landmark, Trees, Mountain, 
  Map, ShieldCheck, Award, HeartHandshake, ArrowRight,
  AlertCircle
} from 'lucide-react';

import heroSriLanka from '../assets/hero-sri-lanka.png';
import sigiriyaImg from '../assets/destinations/sigiriya.png';

// Regex: disallow special characters in search
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?~`]/;

export const Home: React.FC = () => {
  const { destinations, packages } = useTravel();
  const navigate = useNavigate();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchError, setSearchError] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (SPECIAL_CHAR_REGEX.test(val)) {
      setSearchError('Special characters are not allowed in the search field. Please use only letters, numbers, and spaces.');
    } else {
      setSearchError('');
    }
  };

  // Trigger search navigations
  const handleSearchSubmit = () => {
    if (searchError) return;
    if (searchQuery || selectedCategory !== 'All') {
      navigate(`/packages?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(selectedCategory)}`);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearchSubmit();
  };

  // Select top 3 popular destinations
  const popularDestinations = destinations.slice(0, 3);
  
  // Select top 3 featured packages
  const featuredPackages = packages.slice(0, 3);

  const categories = [
    { name: 'Beach', icon: Palmtree, color: 'text-sky-500 bg-sky-50', count: '4 Destinations' },
    { name: 'Culture', icon: Landmark, color: 'text-amber-600 bg-amber-50', count: '2 Destinations' },
    { name: 'Wildlife', icon: Trees, color: 'text-emerald-600 bg-emerald-50', count: '1 Destination' },
    { name: 'Hill Country', icon: Mountain, color: 'text-teal-600 bg-teal-50', count: '2 Destinations' },
    { name: 'Adventure', icon: Map, color: 'text-red-500 bg-red-50', count: '2 Destinations' },
    { name: 'Heritage', icon: Landmark, color: 'text-purple-600 bg-purple-50', count: '3 Destinations' }
  ];

  return (
    <main className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16 space-y-16">
        {/* Hero Section */}
        <section className="relative rounded-3xl overflow-hidden h-[500px] flex items-center justify-center text-center px-4">
          {/* Background Image overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${heroSriLanka})`,
            }}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-brightness-75" />

          {/* Content */}
          <div className="relative z-10 max-w-3xl space-y-6 text-white">
            <span className="bg-primary-blue/30 backdrop-blur-md border border-primary-blue/30 text-aqua-accent text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase inline-block">
              Explore Ceylon
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none">
              Explore the Wonders of <span className="text-primary-blue drop-shadow-xs">Sri Lanka</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-200 font-medium max-w-xl mx-auto">
              Discover breathtaking beaches, ancient heritage, wildlife adventures, and unforgettable journeys across the Pearl of the Indian Ocean.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('/destinations')}
                className="bg-primary-blue hover:bg-sky-500 text-white font-bold text-sm rounded-xl px-7 py-3 transition-all shadow-md w-full sm:w-auto"
              >
                Explore Destinations
              </button>
              <button
                onClick={() => navigate('/packages')}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-sm rounded-xl px-7 py-3 transition-all w-full sm:w-auto"
              >
                Plan Your Journey
              </button>
            </div>

            <div className="pt-2 max-w-2xl mx-auto">
              {/* Embedded Search bar */}
              <div className={`bg-white p-3 rounded-2xl shadow-lg border flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3 text-left transition-all ${searchError ? 'border-red-300' : 'border-slate-100'}`}>
                <div className="flex-1">
                  <input
                    type="text"
                    id="home-search-input"
                    placeholder="Where do you want to go?"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none text-sm font-semibold"
                  />
                </div>
                <div className="border-t md:border-t-0 md:border-l border-slate-200 md:pl-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-transparent text-slate-600 text-sm font-semibold focus:outline-none cursor-pointer py-2 px-1"
                  >
                    <option value="All">All Categories</option>
                    {categories.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleSearchSubmit}
                  disabled={!!searchError}
                  className="bg-primary-blue hover:bg-sky-500 text-white font-bold text-sm rounded-xl px-6 py-2.5 transition-all w-full md:w-auto shrink-0 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Search Tours
                </button>
              </div>
              {/* Inline validation error */}
              {searchError && (
                <div className="flex items-start space-x-2 mt-2 bg-red-50/90 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-semibold animate-fade-in text-left">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{searchError}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Travel Categories */}
        <section>
          <SectionHeader
            title="Browse by Category"
            subtitle="Tailor your Sri Lankan getaway by selecting the style of travel you love the most"
            badge="Travel styles"
            centered
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div 
                  key={cat.name} 
                  onClick={() => navigate(`/packages?category=${cat.name}`)}
                  className="bg-white border border-slate-100 rounded-2xl p-5 text-center shadow-xs hover:shadow-md hover:border-primary-blue/30 cursor-pointer group"
                >
                  <div className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${cat.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-primary-blue transition-colors">{cat.name}</h4>
                  <p className="text-[10px] text-text-gray mt-1 font-semibold">{cat.count}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Popular Destinations */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8">
            <SectionHeader
              title="Most Popular Destinations"
              subtitle="Explore our handpicked scenic locations around the island"
              badge="Top Picks"
            />
            <Link
              to="/destinations"
              className="inline-flex items-center text-sm font-bold text-primary-blue hover:text-deep-navy transition-colors pb-6 sm:pb-0"
            >
              <span>See All Destinations</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularDestinations.map(dest => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        </section>

        {/* Callout / Highlights Section */}
        <section className="bg-sky-bg rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-sky-100">
          <div className="lg:col-span-7 space-y-5">
            <span className="bg-white/80 text-primary-blue text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Premium Travel
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-deep-navy tracking-tight">
              Curated Experiences for Every Sri Lankan Adventure
            </h2>
            <p className="text-sm text-text-gray font-medium leading-relaxed">
              From trekking the lush tea estates of Ella to unwinding on the surf shores of Arugam Bay, Explore Ceylon connects you with expert local guides, premium transport, and pre-vetted stays — ensuring a seamless, authentic island experience.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-start space-x-2">
                <ShieldCheck className="h-5 w-5 text-primary-blue shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-deep-navy">Safe Travel Guaranteed</h4>
                  <p className="text-[10px] text-text-gray font-medium mt-0.5">24/7 client-side chat support.</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Award className="h-5 w-5 text-primary-blue shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-deep-navy">Vetted Local Guides</h4>
                  <p className="text-[10px] text-text-gray font-medium mt-0.5">English speaking experts.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 relative w-full aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden shadow-md">
            <img
              src={sigiriyaImg}
              alt="Sigiriya Fortress View"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Featured Packages */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8">
            <SectionHeader
              title="Featured Tour Packages"
              subtitle="Book comprehensive, stress-free itineraries including stays, guides, and transit"
              badge="Tours & Packages"
            />
            <Link
              to="/packages"
              className="inline-flex items-center text-sm font-bold text-primary-blue hover:text-deep-navy transition-colors pb-6 sm:pb-0"
            >
              <span>See All Packages</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPackages.map(pkg => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12">
          <SectionHeader
            title="Why Travel with Explore Ceylon?"
            subtitle="We focus on making your Sri Lankan experience authentic, comfortable, and unforgettable."
            badge="Our Promise"
            centered
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-primary-blue">
                <Award className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-deep-navy">Top-Rated Operators</h4>
              <p className="text-sm text-text-gray font-medium leading-relaxed">
                We partner exclusively with top-tier hotels and transport fleets to maintain gold standards.
              </p>
            </div>

            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-warning-orange">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-deep-navy">Personalized Support</h4>
              <p className="text-sm text-text-gray font-medium leading-relaxed">
                Customize any of our pre-built itineraries easily or build a custom request from scratch.
              </p>
            </div>

            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-success-green">
                <Map className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-deep-navy">Transparent Pricing</h4>
              <p className="text-sm text-text-gray font-medium leading-relaxed">
                No hidden fees. What you see is what you pay. Free cancellation on all packages up to 48h prior.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
