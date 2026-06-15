import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import type { Destination } from '../types';

interface DestinationCardProps {
  destination: Destination;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({ destination }) => {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col border border-slate-100 h-full">
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-[4/3] w-full bg-slate-100">
        <img
          src={destination.image}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
        />
        {/* Category Badge */}
        <span className="absolute top-4 left-4 bg-primary-blue text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
          {destination.category}
        </span>
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-sm">
          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          <span>{destination.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Details Area */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center text-xs text-text-gray mb-1.5">
          <MapPin className="h-3.5 w-3.5 text-primary-blue mr-1 shrink-0" />
          <span className="truncate">{destination.location}</span>
        </div>
        
        <h3 className="text-lg font-bold text-deep-navy mb-2 group-hover:text-primary-blue transition-colors leading-snug">
          {destination.name}
        </h3>
        
        <p className="text-sm text-text-gray line-clamp-3 mb-4 flex-grow">
          {destination.description}
        </p>

        <Link
          to={`/destinations/${destination.id}`}
          className="inline-flex items-center justify-between text-sm font-bold text-primary-blue hover:text-deep-navy transition-colors mt-auto group/btn"
        >
          <span>View Details</span>
          <ArrowRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
