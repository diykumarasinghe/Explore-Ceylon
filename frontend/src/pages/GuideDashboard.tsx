import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import { StatCard } from '../components/StatCard';
import { SectionHeader } from '../components/SectionHeader';
import { Calendar, CheckCircle2, Navigation, RefreshCw, MessageSquare, Phone } from 'lucide-react';
import { messagesApi } from '../services/api';
import { ChatWindow } from '../components/ChatWindow';

export const GuideDashboard: React.FC = () => {
  const { currentUser, bookings, packages, updateGuideTourStatus, guideDecisionBooking } = useTravel();
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [tourStatus, setTourStatus] = useState('ONGOING');
  const [progressInput, setProgressInput] = useState('');

  // Rejection states
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);

  // Calendar states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  // Page level feedback & inline chat info states
  const [pageFeedback, setPageFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setPageFeedback({ type, message });
    setTimeout(() => {
      setPageFeedback(prev => prev?.message === message ? null : prev);
    }, 4500);
  };

  // Chat states
  const [chatBookingId, setChatBookingId] = useState<string | null>(null);
  const [chatRecipientName, setChatRecipientName] = useState('');
  const [chatRecipientRole, setChatRecipientRole] = useState('');
  const [chatRecipientPhone, setChatRecipientPhone] = useState<string | undefined>(undefined);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await messagesApi.getUnreadCount();
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [currentUser, chatBookingId]);

  if (!currentUser) return null;

  // Filter bookings assigned to this guide
  const myAssignedTours = bookings.filter(b => b.guideId === currentUser.id);
  const activeTours = myAssignedTours.filter(b => b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'ONGOING');
  const completedTours = myAssignedTours.filter(b => b.bookingStatus === 'COMPLETED');
  const pendingRequests = myAssignedTours.filter(b => b.bookingStatus === 'GUIDE_ASSIGNED');

  const handleAcceptTour = async (bookingId: string) => {
    setSubmittingDecision(true);
    try {
      await guideDecisionBooking(bookingId, 'accept');
      triggerFeedback('success', 'You have accepted the tour assignment.');
    } catch (err: any) {
      triggerFeedback('error', err.response?.data?.message || 'Failed to accept tour assignment.');
    } finally {
      setSubmittingDecision(false);
    }
  };

  const handleRejectTour = async (bookingId: string) => {
    if (!rejectionReason.trim()) {
      triggerFeedback('error', 'Please provide a rejection reason.');
      return;
    }
    setSubmittingDecision(true);
    try {
      await guideDecisionBooking(bookingId, 'reject', rejectionReason.trim());
      triggerFeedback('success', 'You have rejected the tour assignment.');
      setRejectingBookingId(null);
      setRejectionReason('');
    } catch (err: any) {
      triggerFeedback('error', err.response?.data?.message || 'Failed to reject tour assignment.');
    } finally {
      setSubmittingDecision(false);
    }
  };

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

  const toursByDate: Record<string, typeof bookings> = {};
  myAssignedTours.forEach(b => {
    if (b.startDate) {
      if (!toursByDate[b.startDate]) {
        toursByDate[b.startDate] = [];
      }
      toursByDate[b.startDate].push(b);
    }
  });

  // Group guide bookings by spanned date (start date + duration days)
  const toursBySpannedDate: Record<string, Array<{ booking: typeof bookings[0]; isStart: boolean }>> = {};
  myAssignedTours.forEach(b => {
    if (b.startDate) {
      const pkg = packages.find(p => p.id === b.packageId);
      const duration = pkg ? pkg.durationDays : 3;
      const spanned = getSpannedDates(b.startDate, duration);
      spanned.forEach((date, index) => {
        if (!toursBySpannedDate[date]) {
          toursBySpannedDate[date] = [];
        }
        toursBySpannedDate[date].push({
          booking: b,
          isStart: index === 0
        });
      });
    }
  });

  const handleUpdateProgressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPageFeedback(null);

    if (!selectedBookingId || !progressInput) return;

    try {
      await updateGuideTourStatus(selectedBookingId, tourStatus, progressInput);
      triggerFeedback('success', 'Tour status and progress logged successfully!');
      setProgressInput('');
    } catch (err: any) {
      triggerFeedback('error', err.response?.data?.message || 'Failed to update progress.');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <SectionHeader
        title="Guide Central Panel"
        subtitle="Manage assigned Sri Lankan travels, communicate road logs, and update tourists on trip timelines."
        badge="Guide Dashboard"
      />

      {pageFeedback && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold ${
          pageFeedback.type === 'success' ? 'bg-emerald-50 border-emerald-150 text-success-green' : 'bg-red-50 border-red-150 text-error-red'
        } animate-fade-in`}>
          <span>{pageFeedback.message}</span>
          <button onClick={() => setPageFeedback(null)} className="text-slate-400 hover:text-slate-655 font-bold text-sm px-1.5">&times;</button>
        </div>
      )}

      {/* Pending Tour Requests Panel */}
      {pendingRequests.length > 0 && (
        <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping shrink-0" />
            <h3 className="text-base font-extrabold text-deep-navy">Pending Tour Requests</h3>
          </div>
          <p className="text-xs text-text-gray font-semibold">
            You have pending tour guide assignments. Please review and accept or reject them.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map(b => (
              <div key={b.id} className="border border-orange-100 bg-orange-50/20 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-snug">{b.packageName}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 font-semibold">
                      Date: {b.startDate} • {b.guestsCount} Guest(s)
                    </p>
                    {b.specialRequests && (
                      <p className="text-[9px] text-slate-400 mt-1 font-semibold italic">
                        Special Requests: "{b.specialRequests}"
                      </p>
                    )}
                  </div>
                </div>
                {rejectingBookingId === b.id ? (
                  <div className="space-y-2.5">
                    <textarea
                      required
                      placeholder="Please specify why you are rejecting this tour request..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue"
                      rows={2}
                    />
                    <div className="flex space-x-2">
                      <button
                        disabled={submittingDecision}
                        onClick={() => handleRejectTour(b.id)}
                        className="bg-red-650 hover:bg-red-700 text-white font-bold text-[10px] px-3.5 py-2 rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        Submit Rejection
                      </button>
                      <button
                        disabled={submittingDecision}
                        onClick={() => {
                          setRejectingBookingId(null);
                          setRejectionReason('');
                        }}
                        className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-[10px] px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-2 pt-1">
                    <button
                      disabled={submittingDecision}
                      onClick={() => handleAcceptTour(b.id)}
                      className="bg-primary-blue hover:bg-sky-500 text-white font-bold text-[10px] px-4 py-2 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1 disabled:opacity-50 cursor-pointer"
                    >
                      <span>Accept Tour</span>
                    </button>
                    <button
                      disabled={submittingDecision}
                      onClick={() => setRejectingBookingId(b.id)}
                      className="border border-red-200 bg-white hover:bg-red-50 text-error-red font-bold text-[10px] px-4 py-2 rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1 disabled:opacity-50 cursor-pointer"
                    >
                      <span>Reject Tour</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guide Performance metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Assigned Tours"
          value={myAssignedTours.length}
          icon={Calendar}
          description="Total linked records"
          colorClass="text-primary-blue"
          bgColorClass="bg-sky-50"
        />
        <StatCard
          title="Active Journeys"
          value={activeTours.length}
          icon={Navigation}
          description="Departed or approved"
          colorClass="text-warning-orange"
          bgColorClass="bg-orange-50"
        />
        <StatCard
          title="Completed Hikes"
          value={completedTours.length}
          icon={CheckCircle2}
          description="Successfully checked out"
          colorClass="text-success-green"
          bgColorClass="bg-emerald-50"
        />
      </div>

      {/* Tour Availability Calendar Widget */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-deep-navy">Tour Availability Calendar</h3>
          <p className="text-xs text-text-gray font-semibold mt-0.5">
            Visualize your tour schedule, check conflicts, and view assigned date statuses.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Calendar Table Grid */}
          <div className="lg:col-span-8 space-y-4">
            {/* Header: navigation */}
            <div className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 text-slate-600 font-bold transition-all cursor-pointer text-xs"
              >
                &larr; Prev
              </button>
              <span className="font-extrabold text-slate-800 text-xs sm:text-sm uppercase tracking-wider">
                {monthName} {currentYear}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 text-slate-600 font-bold transition-all cursor-pointer text-xs"
              >
                Next &rarr;
              </button>
            </div>

            {/* Grid Days of week */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-black uppercase text-slate-400">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Days block */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Padding */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div key={`pad-${idx}`} className="aspect-square bg-slate-50/40 rounded-2xl border border-dashed border-slate-100/50" />
              ))}

              {/* Days */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const dateStr = getFormattedDateString(day);
                const dayToursInfo = toursBySpannedDate[dateStr] || [];
                const isSelected = selectedCalendarDate === dateStr;

                let cellBg = 'bg-white hover:bg-slate-50 border border-slate-100 text-slate-700';
                let statusDotColor = '';

                if (dayToursInfo.length > 0) {
                  const dayTours = dayToursInfo.map(x => x.booking);
                  const hasCompleted = dayTours.some(x => x.bookingStatus === 'COMPLETED');
                  const hasConfirmed = dayTours.some(x => x.bookingStatus === 'CONFIRMED' || x.bookingStatus === 'ONGOING');
                  const hasAccepted = dayTours.some(x => x.bookingStatus === 'GUIDE_ACCEPTED');
                  const hasPending = dayTours.some(x => x.bookingStatus === 'GUIDE_ASSIGNED');

                  const isStart = dayToursInfo.some(x => x.isStart);
                  if (hasConfirmed) {
                    cellBg = isStart
                      ? 'bg-violet-100 border border-violet-300 text-violet-900 hover:bg-violet-200'
                      : 'bg-violet-50/50 border border-dashed border-violet-200/50 text-violet-855 hover:bg-violet-100/50';
                    statusDotColor = 'bg-violet-600';
                  } else if (hasAccepted) {
                    cellBg = isStart
                      ? 'bg-emerald-100 border border-emerald-300 text-emerald-900 hover:bg-emerald-200'
                      : 'bg-emerald-50/50 border border-dashed border-emerald-250/50 text-emerald-800 hover:bg-emerald-100/50';
                    statusDotColor = 'bg-emerald-600';
                  } else if (hasPending) {
                    cellBg = isStart
                      ? 'bg-orange-100 border border-orange-300 text-orange-900 hover:bg-orange-200'
                      : 'bg-orange-50/50 border border-dashed border-orange-200/50 text-orange-850 hover:bg-orange-100/50';
                    statusDotColor = 'bg-orange-600';
                  } else if (hasCompleted) {
                    cellBg = isStart
                      ? 'bg-slate-100 border border-slate-300 text-slate-900 hover:bg-slate-200'
                      : 'bg-slate-50/50 border border-dashed border-slate-200/50 text-slate-800 hover:bg-slate-100/50';
                    statusDotColor = 'bg-slate-500';
                  }
                }

                return (
                  <button
                    key={`day-${day}`}
                    onClick={() => {
                      if (dayToursInfo.length > 0) {
                        setSelectedCalendarDate(dateStr);
                      } else {
                        setSelectedCalendarDate(null);
                      }
                    }}
                    className={`aspect-square p-2.5 rounded-2xl text-xs font-black transition-all flex flex-col justify-between items-center relative cursor-pointer ${cellBg} ${
                      isSelected ? 'ring-2 ring-primary-blue scale-105 shadow-sm' : ''
                    }`}
                  >
                    <span>{day}</span>
                    {statusDotColor && (
                      dayToursInfo.some(x => x.isStart) ? (
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
                <span className="inline-flex items-center space-x-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 inline-block" />
                  <span>Pending Request</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 inline-block" />
                  <span>Tour Accepted</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 bg-violet-50 border border-violet-200 text-violet-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0 inline-block" />
                  <span>Confirmed &amp; Active</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-slate-500 shrink-0 inline-block" />
                  <span>Completed Tour</span>
                </span>
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-5 border border-slate-100 min-h-[200px] flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-455 tracking-wider pb-2 border-b border-slate-200">
                Selected Day Details
              </h4>
              {selectedCalendarDate ? (
                <div className="space-y-3">
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase">
                    Tours on {selectedCalendarDate}:
                  </p>
                  {(toursBySpannedDate[selectedCalendarDate] || []).map((info) => {
                    const t = info.booking;
                    const statusColor =
                      t.bookingStatus === 'COMPLETED' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                      (t.bookingStatus === 'CONFIRMED' || t.bookingStatus === 'ONGOING') ? 'bg-violet-50 text-violet-700 border-violet-200' :
                      t.bookingStatus === 'GUIDE_ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-orange-50 text-orange-700 border-orange-200';
                    return (
                      <div key={t.id} className="bg-white border border-slate-100 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
                        <span className="font-extrabold text-xs text-slate-800 block leading-snug">
                          {t.packageName}
                        </span>
                        <p className="text-[9px] text-slate-500 font-semibold">Tourist: {t.customerName} &bull; {t.guestsCount} guest{t.guestsCount !== 1 ? 's' : ''}</p>
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-550 pt-1 border-t border-slate-50">
                          <span className="text-[9px] text-slate-400">{info.isStart ? '🟢 Tour starts this day' : '↔ Continuation day'}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${statusColor}`}>
                            {t.bookingStatus === 'GUIDE_ASSIGNED' ? 'PENDING' : t.bookingStatus.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 italic space-y-2">
                  <Calendar className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-[10.5px] font-semibold">Click a highlighted calendar date to inspect tour reservations.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Status Update Portal & Active Tours grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Quick Progress Form */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-deep-navy">Log Live Update</h3>
            <p className="text-xs text-text-gray font-semibold mt-0.5">Post road milestones, delays, or hotel checkins.</p>
          </div>

          {pageFeedback && (
            <p className={`text-xs font-bold p-2.5 rounded-xl border ${
              pageFeedback.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-success-green' : 'bg-red-50 border-red-100 text-error-red'
            }`}>{pageFeedback.message}</p>
          )}

          <form onSubmit={handleUpdateProgressSubmit} className="space-y-4 text-xs font-semibold text-slate-600">
            <div className="space-y-1.5">
              <label>Select active tour *</label>
              <select
                required
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 font-semibold cursor-pointer focus:outline-none focus:border-primary-blue"
              >
                <option value="">-- Choose Assigned Tour --</option>
                {activeTours.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.packageName} ({b.customerName})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label>Tour Status *</label>
              <select
                value={tourStatus}
                onChange={(e) => setTourStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 font-semibold cursor-pointer focus:outline-none focus:border-primary-blue"
              >
                <option value="UPCOMING">UPCOMING</option>
                <option value="ONGOING">ONGOING</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label>Itinerary updates *</label>
              <textarea
                required
                rows={3}
                placeholder="Example: Driver has met tourist. Currently checking in at Sigiriya."
                value={progressInput}
                onChange={(e) => setProgressInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:border-primary-blue"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedBookingId || !progressInput}
              className="w-full bg-primary-blue hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Post Update</span>
            </button>
          </form>
        </div>

        {/* Assigned active tours roster list */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-deep-navy">Assigned Tours Details</h3>
            <Link to="/guide/tours" className="text-xs font-bold text-primary-blue hover:underline">
              View Detailed Roster
            </Link>
          </div>

          <div className="space-y-3">
            {myAssignedTours.length > 0 ? (
              myAssignedTours.map(b => (
                <div key={b.id} className="border border-slate-100 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 leading-snug">{b.packageName}</h4>
                      <p className="text-[10px] text-text-gray mt-1">
                        Starts: {b.startDate} • {b.guestsCount} Guest{b.guestsCount !== 1 && 's'}
                      </p>
                    </div>
                    <span className={`text-[9px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full border ${
                      b.bookingStatus === 'COMPLETED' ? 'bg-sky-100 text-sky-700 border-sky-200' :
                      b.bookingStatus === 'CANCELLED' ? 'bg-red-100 text-red-750 border-red-200' :
                      b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'ONGOING' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                      'bg-emerald-100 text-emerald-700 border-emerald-200'
                    }`}>
                      {b.bookingStatus.replace(/_/g, ' ')} (Tour: {b.tourStatus || 'UPCOMING'})
                    </span>
                  </div>

                  {b.tourProgress && (
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-[10px] text-slate-600">
                      <span className="font-bold block text-slate-800 text-[9px] uppercase mb-0.5">Last update:</span>
                      {b.tourProgress}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 font-semibold italic text-center py-6">
                No tours currently assigned in the database.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Customer Conversations Support Desk */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <h3 className="text-base font-extrabold text-deep-navy">Customer Messages</h3>
            {unreadCount > 0 && (
              <span className="bg-error-red text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase animate-pulse">
                {unreadCount} Unread
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-text-gray font-semibold">
          Secure communication channel with assigned tourists for Sigiriya, Ella, Galle, and island excursions.
        </p>

        {myAssignedTours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myAssignedTours.map((b) => (
              <div
                key={b.id}
                className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-snug">{b.packageName}</h4>
                  <p className="text-[10px] text-text-gray font-semibold mt-1">
                    Tourist: <span className="text-slate-700 font-bold">{b.customerName}</span>
                  </p>
                  {b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'COMPLETED' ? (
                    b.customerPhone && (
                      <p className="text-[9px] text-slate-455 mt-0.5 font-bold">Phone: {b.customerPhone}</p>
                    )
                  ) : (
                    <p className="text-[9px] text-slate-400 mt-0.5 font-medium italic">Phone hidden before confirmation</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => {
                      setChatBookingId(b.id);
                      setChatRecipientName(b.customerName);
                      setChatRecipientRole('Tourist');
                      setChatRecipientPhone(b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'COMPLETED' ? b.customerPhone : undefined);
                    }}
                    className="bg-white hover:bg-slate-100 border border-slate-205 text-slate-655 hover:text-primary-blue text-xs font-bold py-1.5 px-3 rounded-lg flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>

                  {(b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'COMPLETED') && b.customerPhone && (
                    <a
                      href={`tel:${b.customerPhone}`}
                      className="bg-emerald-55 hover:bg-emerald-100 border border-emerald-250 text-emerald-700 hover:text-emerald-800 text-xs font-bold py-1.5 px-3 rounded-lg flex items-center space-x-1.5 transition-all shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 font-semibold italic text-center py-6">
            No active conversations. Open tours to see chats.
          </p>
        )}
      </div>

      {chatBookingId && (
        <ChatWindow
          bookingId={chatBookingId}
          isOpen={!!chatBookingId}
          onClose={() => setChatBookingId(null)}
          recipientName={chatRecipientName}
          recipientRole={chatRecipientRole}
          recipientPhone={chatRecipientPhone}
          currentUserId={currentUser.id}
        />
      )}
    </div>
  );
};
