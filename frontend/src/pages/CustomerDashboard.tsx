import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import { StatCard } from '../components/StatCard';
import { PackageCard } from '../components/PackageCard';
import { Calendar, Heart, Compass, Wallet, User, ChevronRight } from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { currentUser, bookings, packages, wishlist, isInWishlist } = useTravel();

  // Calendar states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  if (!currentUser) return null;

  const getStatusBadgeStyle = (b: any) => {
    if (b.paymentStatus === 'PENDING_VERIFICATION') {
      return 'bg-purple-50 text-purple-750 border-purple-200';
    }
    switch (b.bookingStatus) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-755 border-yellow-200';
      case 'AWAITING_GUIDE_ASSIGNMENT':
        return 'bg-orange-50 text-orange-755 border-orange-200';
      case 'GUIDE_ASSIGNED':
        return 'bg-blue-50 text-blue-755 border-blue-200';
      case 'GUIDE_ACCEPTED':
        return 'bg-emerald-50 text-emerald-755 border-emerald-250';
      case 'GUIDE_REJECTED':
        return 'bg-red-50 text-red-755 border-red-200';
      case 'CONFIRMED':
        return 'bg-sky-50 text-sky-755 border-sky-200';
      case 'ONGOING':
        return 'bg-sky-100 text-sky-850 border-sky-300';
      case 'COMPLETED':
        return 'bg-slate-900 text-white border-slate-900';
      case 'CANCELLED':
        return 'bg-red-50 text-red-755 border-red-205';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (b: any) => {
    if (b.paymentStatus === 'PENDING_VERIFICATION') {
      return 'PENDING VERIFICATION';
    }
    switch (b.bookingStatus) {
      case 'AWAITING_GUIDE_ASSIGNMENT':
        return 'AWAITING GUIDE ASSIGNMENT';
      case 'GUIDE_ASSIGNED':
        return 'GUIDE ASSIGNED';
      case 'GUIDE_ACCEPTED':
        return b.guideApprovedByAdmin ? 'GUIDE ACCEPTED / READY FOR PAYMENT' : 'GUIDE ACCEPTED / AWAITING ADMIN APPROVAL';
      case 'GUIDE_REJECTED':
        return 'GUIDE REJECTED';
      default:
        return b.bookingStatus;
    }
  };

  // Filter bookings for current tourist
  const myBookings = bookings.filter(b => b.customerId === currentUser.id);
  const upcomingBookings = myBookings.filter(b => b.bookingStatus !== 'COMPLETED' && b.bookingStatus !== 'CANCELLED');
  const pastBookings = myBookings.filter(b => b.bookingStatus === 'COMPLETED');

  // Load wishlist items
  const myWishlistPackages = packages.filter(p => isInWishlist(p.id));

  // Personalized recommendations (just select 3 packages, ideally matching wishlist categories or popular ones)
  const recommendations = packages
    .filter(p => !isInWishlist(p.id)) // recommend things not in wishlist
    .slice(0, 3);

  // Total spent calculation
  const totalSpent = myBookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedCalendarDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedCalendarDate(null);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayIndex = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  const currentMonthIdx = currentDate.getMonth();

  const getFormattedDateString = (day: number) => {
    const mm = String(currentMonthIdx + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${currentYear}-${mm}-${dd}`;
  };

  // Helper to calculate spanned dates based on duration
  const getSpannedDates = (startDateStr: string, durationDays: number): string[] => {
    if (!startDateStr) return [];
    const dates: string[] = [];
    const start = new Date(startDateStr);
    for (let i = 0; i < durationDays; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
    }
    return dates;
  };

  // Group bookings by date
  const bookingsByDate: Record<string, typeof bookings> = {};
  myBookings.forEach(b => {
    if (b.startDate) {
      if (!bookingsByDate[b.startDate]) {
        bookingsByDate[b.startDate] = [];
      }
      bookingsByDate[b.startDate].push(b);
    }
  });

  // Group bookings by spanned dates (start date + duration days)
  const bookingsBySpannedDate: Record<string, Array<{ booking: typeof bookings[0]; isStart: boolean }>> = {};
  myBookings.forEach(b => {
    if (b.startDate) {
      const pkg = packages.find(p => p.id === b.packageId);
      const duration = pkg ? pkg.durationDays : 3;
      const spanned = getSpannedDates(b.startDate, duration);
      spanned.forEach((date, index) => {
        if (!bookingsBySpannedDate[date]) {
          bookingsBySpannedDate[date] = [];
        }
        bookingsBySpannedDate[date].push({
          booking: b,
          isStart: index === 0
        });
      });
    }
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-primary-blue shadow-xs"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-deep-navy">ආයුබෝවන්, {currentUser.name}!</h1>
            <p className="text-xs text-text-gray font-semibold">Welcome to your Sri Lankan travel planner dashboard.</p>
          </div>
        </div>
        <Link
          to="/packages"
          className="bg-primary-blue hover:bg-sky-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md flex items-center space-x-1"
        >
          <Compass className="h-4 w-4" />
          <span>Explore Packages</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tours Booked"
          value={myBookings.length}
          icon={Calendar}
          description={`${upcomingBookings.length} upcoming, ${pastBookings.length} past`}
          colorClass="text-primary-blue"
          bgColorClass="bg-sky-50"
        />
        <StatCard
          title="Wishlisted Packages"
          value={wishlist.length}
          icon={Heart}
          description="Your saved dream trips"
          colorClass="text-red-500"
          bgColorClass="bg-red-50"
        />
        <StatCard
          title="Amount Invested"
          value={`$${totalSpent}`}
          icon={Wallet}
          description="Excludes cancelled bookings"
          colorClass="text-success-green"
          bgColorClass="bg-emerald-50"
        />
        <StatCard
          title="Account Status"
          value="Active Verified"
          icon={User}
          description="Tourist Profile"
          colorClass="text-amber-500"
          bgColorClass="bg-amber-50"
        />
      </div>

      {/* Main Grid: Bookings Timeline & Wishlist Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Upcoming Trips */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-deep-navy">Upcoming Itineraries</h3>
            <Link to="/customer/bookings" className="text-xs font-bold text-primary-blue hover:underline flex items-center space-x-1">
              <span>View All Bookings</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map(b => (
                <div key={b.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={b.packageImage}
                      alt={b.packageName}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 leading-snug">{b.packageName}</h4>
                      <p className="text-xs text-text-gray font-semibold mt-1">Starts: {b.startDate} • {b.guestsCount} Guest{b.guestsCount !== 1 && 's'}</p>
                      {b.guideName && b.guideApprovedByAdmin && (
                        <p className="text-[10px] text-primary-blue font-bold mt-1">Assigned Guide: {b.guideName}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end justify-between w-full sm:w-auto h-full space-y-3 sm:space-y-0">
                    <span className={`text-[10px] uppercase font-black tracking-wider px-3 py-1 rounded-full border text-center sm:text-right w-fit ${getStatusBadgeStyle(b)}`}>
                      {getStatusLabel(b)}
                    </span>
                    <p className="text-base font-black text-slate-800">${b.totalAmount}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center">
              <p className="text-sm text-slate-400 font-bold">You don't have any upcoming trips planned yet.</p>
              <Link to="/packages" className="text-xs text-primary-blue font-black mt-2 inline-block hover:underline">
                Find your first Sri Lankan adventure now &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Calendar & Wishlist Preview */}
        <div className="lg:col-span-4 space-y-6">
          {/* Mini Calendar Widget */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-deep-navy">My Travel Calendar</h3>
              <p className="text-[10px] text-text-gray font-semibold mt-0.5">
                Track status of your upcoming trips.
              </p>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-slate-655 font-bold transition-all cursor-pointer text-[10px]"
              >
                &larr; Prev
              </button>
              <span className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider">
                {monthName} {currentYear}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-slate-655 font-bold transition-all cursor-pointer text-[10px]"
              >
                Next &rarr;
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-black uppercase text-slate-400">
              <div>Su</div>
              <div>Mo</div>
              <div>Tu</div>
              <div>We</div>
              <div>Th</div>
              <div>Fr</div>
              <div>Sa</div>
            </div>

            {/* Days block */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div key={`pad-${idx}`} className="aspect-square bg-slate-50/40 rounded-xl border border-dashed border-slate-100/50" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const dateStr = getFormattedDateString(day);
                const dayBookingsInfo = bookingsBySpannedDate[dateStr] || [];
                const isSelected = selectedCalendarDate === dateStr;

                let cellBg = 'bg-white hover:bg-slate-50 border border-slate-100 text-slate-700';
                let statusDotColor = '';

                if (dayBookingsInfo.length > 0) {
                  const dayBookings = dayBookingsInfo.map(x => x.booking);
                  const hasCancelled = dayBookings.some(x => x.bookingStatus === 'CANCELLED');
                  const hasCompleted = dayBookings.some(x => x.bookingStatus === 'COMPLETED');
                  const hasConfirmed = dayBookings.some(x => x.bookingStatus === 'CONFIRMED' || x.bookingStatus === 'ONGOING');
                  const hasAccepted = dayBookings.some(x => x.bookingStatus === 'GUIDE_ACCEPTED');
                  const hasPending = dayBookings.some(
                    x => ['PENDING', 'AWAITING_GUIDE_ASSIGNMENT', 'GUIDE_ASSIGNED', 'GUIDE_REJECTED'].includes(x.bookingStatus)
                  );

                  const isStart = dayBookingsInfo.some(x => x.isStart);

                  if (hasConfirmed) {
                    cellBg = isStart 
                      ? 'bg-sky-100 border border-sky-300 text-sky-900 hover:bg-sky-200'
                      : 'bg-sky-50/50 border border-dashed border-sky-200/50 text-sky-800 hover:bg-sky-100/50';
                    statusDotColor = 'bg-sky-500';
                  } else if (hasAccepted) {
                    cellBg = isStart
                      ? 'bg-emerald-100 border border-emerald-300 text-emerald-900 hover:bg-emerald-200'
                      : 'bg-emerald-50/50 border border-dashed border-emerald-250/50 text-emerald-800 hover:bg-emerald-100/50';
                    statusDotColor = 'bg-emerald-500';
                  } else if (hasPending) {
                    cellBg = isStart
                      ? 'bg-amber-100 border border-amber-300 text-amber-900 hover:bg-amber-200'
                      : 'bg-amber-50/50 border border-dashed border-amber-200/50 text-amber-800 hover:bg-amber-100/50';
                    statusDotColor = 'bg-amber-500';
                  } else if (hasCompleted) {
                    cellBg = isStart
                      ? 'bg-violet-100 border border-violet-300 text-violet-900 hover:bg-violet-200'
                      : 'bg-violet-50/50 border border-dashed border-violet-200/50 text-violet-800 hover:bg-violet-100/50';
                    statusDotColor = 'bg-violet-500';
                  } else if (hasCancelled) {
                    cellBg = isStart
                      ? 'bg-red-100 border border-red-300 text-red-900 hover:bg-red-200'
                      : 'bg-red-50/50 border border-dashed border-red-200/50 text-red-800 hover:bg-red-100/50';
                    statusDotColor = 'bg-red-500';
                  }
                }

                return (
                  <button
                    key={`day-${day}`}
                    onClick={() => {
                      if (dayBookingsInfo.length > 0) {
                        setSelectedCalendarDate(dateStr);
                      } else {
                        setSelectedCalendarDate(null);
                      }
                    }}
                    className={`aspect-square p-1.5 rounded-xl text-[10px] font-black transition-all flex flex-col justify-between items-center relative cursor-pointer ${cellBg} ${
                      isSelected ? 'ring-2 ring-primary-blue scale-105 shadow-sm' : ''
                    }`}
                  >
                    <span>{day}</span>
                    {statusDotColor && (
                      dayBookingsInfo.some(x => x.isStart) ? (
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDotColor}`} />
                      ) : (
                        <span className={`w-3.5 h-0.5 rounded-full ${statusDotColor} opacity-75`} />
                      )
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-black">Calendar Status Legend:</span>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center space-x-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 inline-block" />
                  <span>Pending / Review</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 inline-block" />
                  <span>Guide Accepted</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0 inline-block" />
                  <span>Confirmed / Ongoing</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 bg-violet-50 border border-violet-200 text-violet-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0 inline-block" />
                  <span>Completed</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 inline-block" />
                  <span>Cancelled</span>
                </span>
              </div>
            </div>
          </div>

          {/* Selected Day Details Panel */}
          {selectedCalendarDate && bookingsBySpannedDate[selectedCalendarDate] && (
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 space-y-3 animate-fade-in">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider pb-1.5 border-b border-slate-200">
                Tours on {selectedCalendarDate}
              </h4>
              <div className="space-y-2">
                {bookingsBySpannedDate[selectedCalendarDate].map((info) => {
                  const b = info.booking;
                  return (
                    <div key={b.id} className="bg-white border border-slate-100 rounded-xl p-3 space-y-1.5 shadow-2xs">
                      <span className="font-extrabold text-[11px] text-slate-800 block leading-snug">
                        {b.packageName}
                      </span>
                      {b.guideName && b.guideApprovedByAdmin && (
                        <p className="text-[9px] text-primary-blue font-bold">Guide: {b.guideName}</p>
                      )}
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 pt-1 border-t border-slate-50">
                        <span>Total: ${b.totalAmount}</span>
                        <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase border ${
                          b.bookingStatus === 'CONFIRMED' ? 'bg-blue-100 text-blue-900 border-blue-200' :
                          b.bookingStatus === 'GUIDE_ACCEPTED' ? 'bg-emerald-100 text-emerald-900 border-emerald-200' :
                          b.bookingStatus === 'COMPLETED' ? 'bg-purple-100 text-purple-900 border-purple-200' :
                          b.bookingStatus === 'CANCELLED' ? 'bg-red-100 text-red-900 border-red-200' :
                          'bg-amber-100 text-amber-900 border-amber-200'
                        }`}>
                          {b.bookingStatus}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Wishlist Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-deep-navy">Wishlist Preview</h3>
              <Link to="/wishlist" className="text-xs font-bold text-primary-blue hover:underline flex items-center space-x-1">
                <span>View Full Wishlist</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {myWishlistPackages.length > 0 ? (
              <div className="space-y-4">
                {myWishlistPackages.slice(0, 2).map(pkg => (
                  <div key={pkg.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex items-center space-x-3.5 group">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-grow">
                      <h4 className="text-xs font-bold text-slate-800 leading-snug truncate group-hover:text-primary-blue transition-colors">
                        {pkg.name}
                      </h4>
                      <p className="text-[10px] font-black text-primary-blue mt-0.5">${pkg.price}</p>
                    </div>
                    <Link
                      to={`/packages/${pkg.id}`}
                      className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-primary-blue hover:text-white text-slate-500 transition-all shrink-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center">
                <p className="text-xs text-slate-400 font-bold">Your wishlist is empty.</p>
                <Link to="/packages" className="text-[10px] text-primary-blue font-black mt-1.5 inline-block hover:underline">
                  Save packages by clicking the heart icon
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Personalized Recommendations */}
      <section id="recommendations" className="space-y-6">
        <h3 className="text-lg font-black text-deep-navy">Recommended for You</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map(pkg => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </section>
    </div>
  );
};
