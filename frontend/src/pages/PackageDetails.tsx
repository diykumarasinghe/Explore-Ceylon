import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import {
  ArrowLeft, Users, Star, Heart, Check,
  ChevronDown, ChevronUp, ShoppingBag, Clock
} from 'lucide-react';

export const PackageDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { packages, currentUser, createBooking, toggleWishlist, isInWishlist } = useTravel();

  // Find package
  // TODO: Connect to GET /api/packages/:id in backend
  const pkg = packages.find(p => p.id === id);

  // Accordion state for itinerary days
  const [openDay, setOpenDay] = useState<number | null>(1);

  // Booking Form State
  const [bookingDate, setBookingDate] = useState('');
  const [guestsCount, setGuestsCount] = useState(1);
  const [contactNumber, setContactNumber] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  if (!pkg) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-xs max-w-lg mx-auto mt-12">
        <h3 className="text-xl font-bold text-deep-navy">Package Not Found</h3>
        <p className="text-sm text-text-gray mt-2">The package you are looking for does not exist or has been removed.</p>
        <Link
          to="/packages"
          className="mt-6 inline-flex items-center space-x-2 bg-primary-blue hover:bg-sky-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Packages</span>
        </Link>
      </div>
    );
  }

  const favorited = isInWishlist(pkg.id);
  const totalCost = pkg.price * guestsCount;

  const handleWishlistToggle = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    toggleWishlist(pkg.id);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (currentUser.role !== 'customer') {
      setErrorMsg('Notice: Only "Tourist" role can create bookings.');
      return;
    }

    if (!bookingDate) {
      setErrorMsg('Please select a starting date.');
      return;
    }

    if (guestsCount < 1) {
      setErrorMsg('Guest count must be at least 1.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // 1. Create the booking request (Status = PENDING)
      const newBooking = await createBooking(pkg.id, bookingDate, guestsCount, contactNumber, specialRequests);

      if (newBooking && newBooking._id) {
        navigate('/customer/bookings', { state: { message: 'Your booking request has been submitted successfully! Please wait for Admin approval and Tour Guide assignment before making the payment.' } });
      } else {
        setErrorMsg('Unable to complete booking. Please try again.');
        setIsProcessingPayment(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred during booking.');
      setIsProcessingPayment(false);
    }
  };

  const toggleDay = (day: number) => {
    setOpenDay(openDay === day ? null : day);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32 space-y-8">
      {/* Back Button */}
      <Link
        to="/packages"
        className="inline-flex items-center space-x-1.5 text-sm font-bold text-slate-500 hover:text-primary-blue transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Packages</span>
      </Link>

      {/* Main Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 min-w-0 space-y-8">
          {/* Header & Image */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs">
            <div className="h-[350px] sm:h-[450px] relative bg-slate-100">
              <img
                src={pkg.image}
                alt={pkg.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-4 left-4 bg-primary-blue text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                {pkg.category}
              </span>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-black text-deep-navy leading-tight">
                  {pkg.name}
                </h1>

                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={handleWishlistToggle}
                    className="flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-700 hover:text-red-500 rounded-xl p-3 shadow-xs transition-colors focus:outline-none"
                    title={favorited ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart className={`h-5 w-5 ${favorited ? 'text-red-500 fill-red-500' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-600">
                <span className="flex items-center bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1.5 shrink-0" />
                  <span>{pkg.rating.toFixed(1)} Rating</span>
                </span>
                <span className="flex items-center bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
                  <Clock className="h-4 w-4 text-primary-blue mr-1.5 shrink-0" />
                  <span>{pkg.durationDays} Days / {pkg.durationDays - 1} Nights</span>
                </span>
                <span className="flex items-center bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
                  <Users className="h-4 w-4 text-primary-blue mr-1.5 shrink-0" />
                  <span>Max {pkg.maxGroupSize} People</span>
                </span>
              </div>

              <div className="pt-4">
                <h3 className="text-base font-extrabold text-deep-navy mb-2">Tour Overview</h3>
                <p className="text-sm text-text-gray font-medium leading-relaxed">
                  {pkg.description}
                </p>
              </div>
            </div>
          </div>

          {/* Included Services */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8">
            <h3 className="text-lg font-black text-deep-navy mb-4">What's Included</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pkg.includedServices.map((service, index) => (
                <div key={index} className="flex items-start space-x-2.5">
                  <div className="p-1 bg-emerald-50 text-success-green rounded-md shrink-0 mt-0.5 border border-emerald-100">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 leading-snug">{service}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Itinerary */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8">
            <h3 className="text-lg font-black text-deep-navy mb-6">Detailed Itinerary</h3>
            <div className="space-y-4">
              {pkg.itinerary.map((dayItem) => {
                const isOpen = openDay === dayItem.day;
                return (
                  <div key={dayItem.day} className="border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300">
                    <button
                      onClick={() => toggleDay(dayItem.day)}
                      className={`w-full flex items-center justify-between p-4 font-bold text-left transition-colors ${isOpen ? 'bg-sky-50/50 text-primary-blue' : 'hover:bg-slate-50 text-slate-800'}`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="bg-primary-blue text-white text-xs font-black px-2.5 py-1 rounded-lg">
                          Day {dayItem.day}
                        </span>
                        <span className="text-sm sm:text-base">{dayItem.title}</span>
                      </div>
                      {isOpen ? <ChevronUp className="h-5 w-5 shrink-0" /> : <ChevronDown className="h-5 w-5 shrink-0" />}
                    </button>

                    {isOpen && (
                      <div className="p-4 bg-white border-t border-slate-100 text-sm text-text-gray font-medium leading-relaxed">
                        {dayItem.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Booking Panel */}
        <div className="lg:col-span-1 lg:sticky lg:top-28">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pricing Info</p>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-3xl font-black text-primary-blue">${pkg.price}</span>
                <span className="text-sm text-text-gray font-semibold">/ per person</span>
              </div>
            </div>

            <hr className="border-slate-100" />

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <h4 className="text-sm font-black text-deep-navy">Reserve Your Tour</h4>

              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary-blue text-slate-700 font-semibold"
                />
              </div>

              {/* Guest Counter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Guests</label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    disabled={guestsCount <= 1}
                    onClick={() => setGuestsCount(guestsCount - 1)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-50 text-lg font-bold w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-black text-slate-800">{guestsCount}</span>
                  <button
                    type="button"
                    disabled={guestsCount >= pkg.maxGroupSize}
                    onClick={() => setGuestsCount(guestsCount + 1)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-50 text-lg font-bold w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Contact Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Number</label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary-blue text-slate-700 font-semibold"
                />
              </div>

              {/* Special Requests */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Special Requests</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={2}
                  placeholder="Dietary requirements, accessibility needs, etc."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary-blue text-slate-700 font-semibold resize-none"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-error-red font-bold leading-normal">{errorMsg}</p>
              )}

              <div className="pt-2">
                <div className="flex justify-between text-xs text-text-gray font-semibold mb-1">
                  <span>${pkg.price} x {guestsCount} guest{guestsCount !== 1 && 's'}</span>
                  <span>${totalCost}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-800 mb-4 pt-2 border-t border-dashed border-slate-200">
                  <span>Total Amount</span>
                  <span>${totalCost}</span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full bg-primary-blue hover:bg-sky-500 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-70"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>{isProcessingPayment ? 'Submitting request...' : 'Submit Booking Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
