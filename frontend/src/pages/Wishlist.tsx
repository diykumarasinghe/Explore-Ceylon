import React from 'react';
import { Link } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import { PackageCard } from '../components/PackageCard';
import { SectionHeader } from '../components/SectionHeader';
import { Heart, Compass, ArrowLeft } from 'lucide-react';

export const Wishlist: React.FC = () => {
  const { packages, currentUser, isInWishlist } = useTravel();

  if (!currentUser) return null;

  // Resolve packages
  const wishlistedPackages = packages.filter(p => isInWishlist(p.id));

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button (Top-Left Arrow Icon) */}
      <div className="relative">
        <Link
          to="/customer"
          className="absolute -left-14 top-0 hidden xl:flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:text-primary-blue hover:border-primary-blue hover:shadow-md rounded-full p-2.5 transition-all shadow-xs w-10 h-10"
          title="Back to Dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {/* Fallback for smaller screens */}
        <Link
          to="/customer"
          className="flex xl:hidden items-center justify-center bg-white border border-slate-200 text-slate-600 hover:text-primary-blue hover:border-primary-blue hover:shadow-md rounded-full p-2.5 transition-all shadow-xs w-10 h-10 mb-4 animate-fade-in"
          title="Back to Dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <SectionHeader
        title="My Travel Wishlist"
        subtitle="Manage your saved tour packages and plan your dream vacation in Sri Lanka."
        badge="Favorites"
      />

      {wishlistedPackages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistedPackages.map(pkg => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-xs max-w-lg mx-auto">
          <Heart className="h-10 w-10 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-deep-navy">Your Wishlist is Empty</h3>
          <p className="text-sm text-text-gray mt-2">
            Save tour packages you are interested in by clicking the heart button on package cards.
          </p>
          <Link
            to="/packages"
            className="mt-6 inline-flex items-center space-x-2 bg-primary-blue hover:bg-sky-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md"
          >
            <Compass className="h-4 w-4" />
            <span>Browse Tour Packages</span>
          </Link>
        </div>
      )}
    </div>
  );
};
