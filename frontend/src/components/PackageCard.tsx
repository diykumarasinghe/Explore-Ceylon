import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, Star, Heart, ArrowRight, ArrowRightLeft } from 'lucide-react';
import type { Package } from '../types';
import { useTravel } from '../context/TravelContext';

interface PackageCardProps {
  pkg: Package;
  isCompared?: boolean;
  onCompareToggle?: (id: string) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({ pkg, isCompared, onCompareToggle }) => {
  const { toggleWishlist, isInWishlist, currentUser } = useTravel();
  const navigate = useNavigate();
  const favorited = isInWishlist(pkg.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    toggleWishlist(pkg.id);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl flex flex-col border border-slate-100 h-full relative">
      {/* Image and badges */}
      <div className="relative overflow-hidden aspect-[16/9] w-full bg-slate-100">
        <img
          src={pkg.image}
          alt={pkg.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        {/* Category Tag */}
        <span className="absolute top-4 left-4 bg-primary-blue text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
          {pkg.category}
        </span>
        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-700 hover:text-red-500 rounded-full p-2 shadow-sm transition-colors focus:outline-none"
          title={favorited ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`h-4 w-4 transition-colors ${favorited ? 'text-red-500 fill-red-500' : ''}`} />
        </button>
        {/* Compare Button */}
        {onCompareToggle && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCompareToggle(pkg.id);
            }}
            className={`absolute top-14 right-4 ${isCompared ? 'bg-primary-blue text-white' : 'bg-white/90 text-slate-700 hover:bg-white'} rounded-full p-2 shadow-sm transition-colors focus:outline-none`}
            title={isCompared ? "Remove from comparison" : "Add to comparison"}
          >
            <ArrowRightLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Package Info */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Rating and Duration */}
        <div className="flex items-center justify-between text-xs text-text-gray mb-2.5">
          <div className="flex items-center space-x-1">
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span className="font-bold text-slate-800">{pkg.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <Calendar className="h-3.5 w-3.5 text-primary-blue shrink-0" />
              <span>{pkg.duration || `${pkg.durationDays} Days`}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Users className="h-3.5 w-3.5 text-primary-blue shrink-0" />
              <span>Max {pkg.maxGroupSize}</span>
            </span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-deep-navy mb-2 group-hover:text-primary-blue transition-colors leading-snug">
          {pkg.name}
        </h3>

        <p className="text-sm text-text-gray line-clamp-2 mb-4 flex-grow">
          {pkg.description}
        </p>

        {/* Pricing & Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-col space-y-4 mt-auto">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-text-gray uppercase tracking-wider font-semibold">Price per person</p>
            <p className="text-2xl font-extrabold text-primary-blue">${pkg.price}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/packages/${pkg.id}`}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center"
            >
              View Details
            </Link>
            <Link
              to={`/packages/${pkg.id}`}
              className="bg-deep-navy hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1"
            >
              <span>Book Now</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
