import React, { useState } from 'react';
import { useTravel } from '../context/TravelContext';
import { 
  Search, Filter, CheckCircle2, 
  XCircle, FileText, ExternalLink, Eye, MoreVertical, 
  ArrowLeft, ArrowRight, ShieldAlert, RefreshCw, Info, Clock
} from 'lucide-react';

export const ManageBookings: React.FC = () => {
  const { bookings, users, adminReviewBooking, verifyBookingPayment, assignGuide } = useTravel();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [guideFilter, setGuideFilter] = useState('All');
  const [touristFilter, setTouristFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'completed' | 'cancelled'>('all');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Guide loading state for inline updates
  const [savingGuideId, setSavingGuideId] = useState<Record<string, boolean>>({});

  // Action feedback alert state
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  // Detailed view modal state
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const triggerFeedback = (type: 'success' | 'error' | 'warning', message: string) => {
    setActionFeedback({ type, message });
    setTimeout(() => {
      setActionFeedback(prev => prev?.message === message ? null : prev);
    }, 4500);
  };

  const tourGuides = users.filter(u => u.role === 'guide');
  const tourists = users.filter(u => u.role === 'customer');

  const hasGuideConflict = (bId: string, gId: string, date: string) => {
    if (!gId) return false;
    return bookings.some(x => 
      x.id !== bId &&
      x.guideId === gId &&
      x.startDate === date &&
      (['GUIDE_ASSIGNED', 'GUIDE_ACCEPTED', 'CONFIRMED', 'ONGOING'].includes(x.bookingStatus) || x.tourStatus === 'ONGOING')
    );
  };

  // Unified Filter logic
  const filteredBookings = bookings.filter(b => {
    // 1. Text Search query (Package Name, Booking ID, Guide Name, Status, Customer Name/Email)
    const matchesSearch = 
      b.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.guideName && b.guideName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.tourStatus.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.tourProgress && b.tourProgress.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Status Dropdown Filter
    let matchesStatus = true;
    if (statusFilter !== 'All') {
      if (statusFilter === 'Pending') matchesStatus = b.bookingStatus === 'PENDING';
      else if (statusFilter === 'Awaiting Guide Assignment') matchesStatus = b.bookingStatus === 'AWAITING_GUIDE_ASSIGNMENT';
      else if (statusFilter === 'Guide Assigned') matchesStatus = b.bookingStatus === 'GUIDE_ASSIGNED';
      else if (statusFilter === 'Guide Accepted') matchesStatus = b.bookingStatus === 'GUIDE_ACCEPTED';
      else if (statusFilter === 'Guide Rejected') matchesStatus = b.bookingStatus === 'GUIDE_REJECTED';
      else if (statusFilter === 'Confirmed') matchesStatus = b.bookingStatus === 'CONFIRMED';
      else if (statusFilter === 'Ongoing') matchesStatus = b.bookingStatus === 'ONGOING';
      else if (statusFilter === 'Completed') matchesStatus = b.bookingStatus === 'COMPLETED';
      else if (statusFilter === 'Cancelled') matchesStatus = b.bookingStatus === 'CANCELLED';
    }

    // 3. Tab Filter
    let matchesTab = true;
    if (activeTab === 'pending') matchesTab = b.bookingStatus === 'PENDING';
    else if (activeTab === 'approved') matchesTab = ['AWAITING_GUIDE_ASSIGNMENT', 'GUIDE_ASSIGNED', 'GUIDE_ACCEPTED', 'CONFIRMED', 'ONGOING'].includes(b.bookingStatus);
    else if (activeTab === 'completed') matchesTab = b.bookingStatus === 'COMPLETED';
    else if (activeTab === 'cancelled') matchesTab = b.bookingStatus === 'CANCELLED';

    // 4. Guide Filter
    let matchesGuide = true;
    if (guideFilter !== 'All') {
      matchesGuide = b.guideId === guideFilter;
    }

    // 4.5. Tourist Filter
    let matchesTourist = true;
    if (touristFilter !== 'All') {
      matchesTourist = b.customerId === touristFilter;
    }

    // 5. Date Range Filter
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && new Date(b.startDate) >= new Date(startDate);
    }
    if (endDate) {
      matchesDate = matchesDate && new Date(b.startDate) <= new Date(endDate);
    }

    return matchesSearch && matchesStatus && matchesTab && matchesGuide && matchesTourist && matchesDate;
  });

  // Pagination bounds
  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + pageSize);

  // Metrics summary helper
  const totalCount = bookings.length;
  const pendingCount = bookings.filter(b => b.bookingStatus === 'PENDING').length;
  const approvedCount = bookings.filter(b => ['AWAITING_GUIDE_ASSIGNMENT', 'GUIDE_ASSIGNED', 'GUIDE_ACCEPTED', 'CONFIRMED', 'ONGOING'].includes(b.bookingStatus)).length;
  const completedCount = bookings.filter(b => b.bookingStatus === 'COMPLETED').length;
  const cancelledCount = bookings.filter(b => b.bookingStatus === 'CANCELLED').length;

  const handleGuideSelect = async (bookingId: string, guideId: string) => {
    // Check guide availability/conflict
    const booking = bookings.find(x => x.id === bookingId);
    if (booking && guideId && hasGuideConflict(bookingId, guideId, booking.startDate)) {
      triggerFeedback('warning', 'This guide already has another tour on this date.');
    }

    setSavingGuideId(prev => ({ ...prev, [bookingId]: true }));
    try {
      await assignGuide(bookingId, guideId);
      triggerFeedback('success', guideId ? 'Tour Guide successfully assigned to booking.' : 'Tour Guide successfully unassigned.');
    } catch (err: any) {
      triggerFeedback('error', err.response?.data?.message || 'Failed to assign tour guide.');
    } finally {
      setSavingGuideId(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleApproveBooking = async (bookingId: string, guideId?: string) => {
    // Check guide availability/conflict
    const booking = bookings.find(x => x.id === bookingId);
    if (booking && guideId && hasGuideConflict(bookingId, guideId, booking.startDate)) {
      triggerFeedback('warning', 'This guide already has another tour on this date.');
    }

    try {
      await adminReviewBooking(bookingId, 'approve', guideId);
      triggerFeedback('success', guideId ? 'Booking approved and tour guide assigned successfully!' : 'Booking approved successfully!');
    } catch (err: any) {
      triggerFeedback('error', err.response?.data?.message || 'Failed to approve booking.');
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      await adminReviewBooking(bookingId, 'reject');
      triggerFeedback('success', 'Booking request rejected and cancelled.');
    } catch (err: any) {
      triggerFeedback('error', err.response?.data?.message || 'Failed to reject booking.');
    }
  };

  const handleVerifyPayment = async (bookingId: string, action: 'approve' | 'reject') => {
    try {
      await verifyBookingPayment(bookingId, action);
      triggerFeedback('success', `Payment receipt successfully ${action === 'approve' ? 'approved' : 'rejected'}.`);
    } catch (err: any) {
      triggerFeedback('error', err.response?.data?.message || 'Failed to verify payment.');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setGuideFilter('All');
    setTouristFilter('All');
    setStartDate('');
    setEndDate('');
    setActiveTab('all');
    setCurrentPage(1);
  };



  const renderStatusBadge = (b: any) => {
    let text = b.bookingStatus;
    let style = 'bg-slate-50 text-slate-700 border-slate-200';

    if (b.paymentStatus === 'PENDING_VERIFICATION') {
      text = 'PENDING VERIFICATION';
      style = 'bg-blue-50 text-blue-700 border-blue-200';
    } else if (b.bookingStatus === 'PENDING') {
      text = 'PENDING';
      style = 'bg-yellow-50 text-yellow-700 border-yellow-200';
    } else if (b.bookingStatus === 'AWAITING_GUIDE_ASSIGNMENT') {
      text = 'AWAITING GUIDE ASSIGNMENT';
      style = 'bg-amber-50 text-amber-700 border-amber-200';
    } else if (b.bookingStatus === 'GUIDE_ASSIGNED') {
      text = 'GUIDE ASSIGNED';
      style = 'bg-orange-50 text-orange-700 border-orange-200';
    } else if (b.bookingStatus === 'GUIDE_ACCEPTED') {
      text = b.guideApprovedByAdmin ? 'GUIDE ACCEPTED / READY FOR PAYMENT' : 'GUIDE ACCEPTED / AWAITING ADMIN APPROVAL';
      style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (b.bookingStatus === 'GUIDE_REJECTED') {
      text = 'GUIDE REJECTED';
      style = 'bg-red-50 text-red-700 border-red-200';
    } else if (b.bookingStatus === 'CONFIRMED') {
      text = 'CONFIRMED';
      style = 'bg-violet-50 text-violet-700 border-violet-200';
    } else if (b.bookingStatus === 'ONGOING') {
      text = 'ONGOING';
      style = 'bg-violet-50 text-violet-700 border-violet-200';
    } else if (b.bookingStatus === 'COMPLETED') {
      text = 'COMPLETED';
      style = 'bg-slate-50 text-slate-700 border-slate-200';
    } else if (b.bookingStatus === 'CANCELLED') {
      text = 'CANCELLED';
      style = 'bg-red-50 text-red-700 border-red-200';
    }

    return (
      <span className={`px-2.5 py-1 rounded-full text-[9px] uppercase font-black border ${style}`}>
        {text}
      </span>
    );
  };

  const getPaymentStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-emerald-50 text-emerald-700 border-emerald-250';
      case 'PENDING_VERIFICATION': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'REJECTED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';

  const selectedBooking = bookings.find(b => b.id === selectedBookingId);

  return (
    <div className="space-y-6 pb-12">
      {/* Alert Feedbacks */}
      {actionFeedback && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-lg ${
          actionFeedback.type === 'success' ? 'bg-emerald-50 border-emerald-150 text-success-green' :
          actionFeedback.type === 'error' ? 'bg-red-50 border-red-150 text-error-red' :
          'bg-amber-50 border-amber-150 text-amber-800'
        } animate-fade-in`}>
          <span>{actionFeedback.message}</span>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm px-1.5 ml-4">&times;</button>
        </div>
      )}

      {/* Header section */}
      <div className="space-y-1">
        <span className="bg-[#E0F2FE] text-[#0284C7] text-[10px] font-black tracking-wider px-3 py-1 rounded-full uppercase">
          BOOKING DESK
        </span>
        <h1 className="text-2xl font-black text-slate-800">Manage Bookings</h1>
        <p className="text-xs text-text-gray font-semibold">
          Review traveler tour requests, approve bookings, assign certified local guides, and manage tour status.
        </p>
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Magnifying Search Input */}
          <div className="md:col-span-4 relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by tour name, tourist, email, or booking ID..."
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                const sanitized = val.replace(/[^a-zA-Z0-9\s]/g, '');
                if (sanitized !== val) {
                  triggerFeedback('warning', 'Special symbols are not allowed in search.');
                }
                setSearchQuery(sanitized);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-primary-blue focus:bg-white transition-all"
            />
          </div>

          {/* Status Dropdown Filter */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-655 font-bold cursor-pointer focus:outline-none focus:border-primary-blue transition-all"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Tourist Dropdown Filter */}
          <div className="md:col-span-3">
            <select
              value={touristFilter}
              onChange={(e) => {
                setTouristFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-655 font-bold cursor-pointer focus:outline-none focus:border-primary-blue transition-all"
            >
              <option value="All">All Tourists</option>
              {tourists.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Guide Dropdown Filter */}
          <div className="md:col-span-3">
            <select
              value={guideFilter}
              onChange={(e) => {
                setGuideFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-655 font-bold cursor-pointer focus:outline-none focus:border-primary-blue transition-all"
            >
              <option value="All">All Guides</option>
              {tourGuides.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Date Picker Start */}
          <div className="md:col-span-3 relative flex items-center">
            <input
              type={startDate ? "date" : "text"}
              placeholder="Start Date"
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!startDate) e.target.type = "text";
              }}
              value={startDate}
              onChange={(e) => {
                const val = e.target.value;
                const today = new Date().toISOString().split('T')[0];
                if (val && val < today) {
                  triggerFeedback('warning', 'Past dates are not allowed.');
                  setStartDate('');
                } else {
                  setStartDate(val);
                }
                setCurrentPage(1);
              }}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-655 font-bold focus:outline-none focus:border-primary-blue focus:bg-white transition-all cursor-pointer"
              title="Start Date"
            />
          </div>

          {/* Date Picker End */}
          <div className="md:col-span-3 relative flex items-center">
            <input
              type={endDate ? "date" : "text"}
              placeholder="End Date"
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!endDate) e.target.type = "text";
              }}
              value={endDate}
              onChange={(e) => {
                const val = e.target.value;
                const today = new Date().toISOString().split('T')[0];
                if (val && val < today) {
                  triggerFeedback('warning', 'Past dates are not allowed.');
                  setEndDate('');
                } else {
                  setEndDate(val);
                }
                setCurrentPage(1);
              }}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-655 font-bold focus:outline-none focus:border-primary-blue focus:bg-white transition-all cursor-pointer"
              title="End Date"
            />
          </div>
        </div>

        {/* Filters Reset/Info Row */}
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500 pt-1">
          <p className="flex items-center text-[10.5px]">
            <Info className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
            <span>Search automatically refreshes as you type. Use reset button to clear filters.</span>
          </p>
          <button
            onClick={handleResetFilters}
            className="text-primary-blue font-extrabold hover:text-deep-navy cursor-pointer flex items-center space-x-1"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* METRICS SUMMARY CARDS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-3xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block leading-none">All Bookings</span>
            <span className="text-xl font-black text-slate-800 block mt-1">{totalCount}</span>
            <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Total bookings</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-3xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block leading-none">Pending</span>
            <span className="text-xl font-black text-slate-800 block mt-1">{pendingCount}</span>
            <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Awaiting approval</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-3xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block leading-none">Approved</span>
            <span className="text-xl font-black text-slate-800 block mt-1">{approvedCount}</span>
            <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Ready for payment</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-3xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21v11h-6.5l-1-1H5a2 2 0 00-2 2zm0 0h18" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block leading-none">Completed</span>
            <span className="text-xl font-black text-slate-800 block mt-1">{completedCount}</span>
            <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Tour completed</span>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-3xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-650 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block leading-none">Cancelled</span>
            <span className="text-xl font-black text-slate-800 block mt-1">{cancelledCount}</span>
            <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Booking cancelled</span>
          </div>
        </div>
      </div>

      {/* TABS SWITCH PANEL & PAGE SIZE SELECTOR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Pills Switcher */}
        <div className="bg-white border border-slate-100 p-1.5 rounded-2xl flex flex-wrap gap-1 shadow-3xs">
          <button
            onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-primary-blue text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>All Bookings</span>
          </button>

          <button
            onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-primary-blue text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Pending</span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('approved'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'approved'
                ? 'bg-primary-blue text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Approved</span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${activeTab === 'approved' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {approvedCount}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('completed'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-primary-blue text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Completed</span>
          </button>

          <button
            onClick={() => { setActiveTab('cancelled'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'cancelled'
                ? 'bg-primary-blue text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Cancelled</span>
          </button>
        </div>

        {/* Page Size & Stats label */}
        <div className="flex items-center space-x-3.5 text-xs text-slate-500 font-bold shrink-0 self-stretch sm:self-auto justify-between sm:justify-end">
          <span>Showing {totalItems > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + pageSize, totalItems)} of {totalItems} bookings</span>
          <div className="flex items-center space-x-1.5">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-600 font-black cursor-pointer focus:outline-none focus:border-primary-blue"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      </div>

      {/* UNIFIED BOOKINGS DIRECTORY TABLE */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-700 whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
                <th className="p-4">Tour Details</th>
                <th className="p-4">Tourist</th>
                <th className="p-4">Price</th>
                <th className="p-4">Start Date</th>
                <th className="p-4">Assigned Guide</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBookings.length > 0 ? (
                paginatedBookings.map(b => (
                  <tr key={b.id} className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/30 transition-colors">
                    {/* Tour Details */}
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={b.packageImage} 
                          alt={b.packageName} 
                          className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-100" 
                        />
                        <div className="min-w-0">
                          <span className="font-extrabold text-slate-800 block truncate max-w-[170px]" title={b.packageName}>
                            {b.packageName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">ID: {b.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Tourist */}
                    <td className="p-4">
                      <p className="text-slate-800 font-bold leading-tight">{b.customerName}</p>
                      <p className="text-[10px] text-text-gray font-semibold leading-normal mt-0.5">{b.customerEmail}</p>
                      {b.customerPhone && (
                        <p className="text-[9px] text-slate-400 font-semibold">{b.customerPhone}</p>
                      )}
                    </td>

                    {/* Price */}
                    <td className="p-4 font-black text-slate-800">${b.totalAmount}</td>

                    {/* Start Date */}
                    <td className="p-4 font-bold text-slate-655">{b.startDate}</td>

                    {/* Assigned Guide dropdown */}
                    <td className="p-4 relative">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <select
                            disabled={savingGuideId[b.id]}
                            value={b.guideId || ''}
                            onChange={(e) => handleGuideSelect(b.id, e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-655 font-bold cursor-pointer focus:outline-none focus:border-primary-blue transition-all disabled:opacity-50"
                          >
                            <option value="">-- Choose Guide --</option>
                            {tourGuides.map(g => (
                              <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                          </select>
                          {savingGuideId[b.id] && (
                            <RefreshCw className="w-3.5 h-3.5 text-primary-blue animate-spin" />
                          )}
                        </div>
                        {b.guideId && hasGuideConflict(b.id, b.guideId, b.startDate) && (
                          <div className="text-red-500 text-[10px] font-bold flex items-center space-x-1 whitespace-normal max-w-[170px] leading-tight">
                            <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            <span>This guide already has another tour on this date.</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      {renderStatusBadge(b)}
                    </td>

                    {/* Payment Status Badge */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded border text-[9px] font-black uppercase ${getPaymentStatusBadgeStyle(b.paymentStatus)}`}>
                        {b.paymentStatus === 'PENDING_VERIFICATION' ? 'Verification Pending' : b.paymentStatus}
                      </span>
                    </td>

                    {/* Actions buttons */}
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => setSelectedBookingId(b.id)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-450 rounded-xl shrink-0 transition-colors cursor-pointer"
                          title="View Review Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedBookingId(b.id)}
                          className="p-1.5 hover:bg-slate-50 border border-transparent text-slate-400 rounded-xl shrink-0 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400 font-bold whitespace-normal">
                    <ShieldAlert className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                    <p>No bookings match the filter criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLE BOTTOM PAGINATION NUMBERS */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-1.5 pt-4">
          {/* Previous Page */}
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="p-2 border border-slate-200 text-slate-455 rounded-xl hover:bg-slate-50 cursor-pointer disabled:opacity-40 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary-blue text-white shadow-sm'
                    : 'border border-slate-200 hover:bg-slate-50 text-slate-655'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next Page */}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="p-2 border border-slate-200 text-slate-455 rounded-xl hover:bg-slate-50 cursor-pointer disabled:opacity-40 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* POP-UP DETAILS & REVIEW MODAL */}
      {selectedBookingId && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-slate-800 leading-snug">Review Booking Details</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Booking ID: {selectedBooking.id}</p>
              </div>
              <button
                onClick={() => setSelectedBookingId(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-655 transition-colors cursor-pointer"
              >
                <XCircle className="h-5.5 w-5.5" />
              </button>
            </div>

            {/* Split layout: Client, Package, Action */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold text-slate-700">
              
              {/* Left Column: Details */}
              <div className="space-y-4">
                {/* Client Box */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                  <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-400">Tourist Information</h4>
                  <div>
                    <span className="font-extrabold text-slate-700 block text-sm">{selectedBooking.customerName}</span>
                    <span className="text-slate-455 text-[10px] block mt-0.5">{selectedBooking.customerEmail}</span>
                    {selectedBooking.customerPhone && (
                      <span className="text-slate-400 text-[10px] block mt-0.5">Phone: {selectedBooking.customerPhone}</span>
                    )}
                  </div>
                </div>

                {/* Package Box */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                  <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-400">Itinerary / Package</h4>
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={selectedBooking.packageImage}
                      alt={selectedBooking.packageName}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-100"
                    />
                    <div>
                      <span className="font-extrabold text-slate-800 block leading-snug">{selectedBooking.packageName}</span>
                      <span className="text-slate-400 text-[10px] block mt-0.5">
                        Departing: {selectedBooking.startDate} • {selectedBooking.guestsCount} Traveler(s)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Guide Assignment Box */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                  <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-400">Tour Guide Assignment</h4>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase text-slate-400 font-bold block">Assigned Guide</label>
                    <select
                      value={selectedBooking.guideId || ''}
                      onChange={(e) => handleGuideSelect(selectedBooking.id, e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-655 font-bold cursor-pointer focus:outline-none focus:border-primary-blue transition-all"
                    >
                      <option value="">-- No Guide Assigned --</option>
                      {tourGuides.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                    {selectedBooking.guideId && hasGuideConflict(selectedBooking.id, selectedBooking.guideId, selectedBooking.startDate) && (
                      <div className="text-red-500 text-[10px] mt-1 font-bold flex items-center space-x-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>This guide already has another tour on this date.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Payments & Actions */}
              <div className="space-y-4">
                
                {/* Financial Summary */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                  <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-400">Payment Summary</h4>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold">Total Amount Due:</span>
                    <span className="text-base font-black text-slate-800">${selectedBooking.totalAmount}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-100">
                    <span className="text-slate-500 font-bold">Method:</span>
                    <span className="font-extrabold text-slate-700">{selectedBooking.paymentMethod || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-500 font-bold">Payment Status:</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase ${getPaymentStatusBadgeStyle(selectedBooking.paymentStatus)}`}>
                      {selectedBooking.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Uploaded Receipt Document */}
                {selectedBooking.paymentReceipt && (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                    <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-400">Uploaded Receipt Proof</h4>
                    
                    <a
                      href={`${API_URL}${selectedBooking.paymentReceipt}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white border border-slate-200 hover:border-primary-blue hover:text-primary-blue text-slate-655 font-bold text-xs p-3.5 rounded-xl flex items-center justify-between transition-colors shadow-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4.5 w-4.5 text-slate-400" />
                        <span>View receipt attachment PDF/Image</span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                    </a>
                  </div>
                )}

                {/* Admin review buttons */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-400">Admin Decisions</h4>
                  
                  {/* Option 1: Verification of payment proof receipt */}
                  {selectedBooking.paymentStatus === 'PENDING_VERIFICATION' && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          handleVerifyPayment(selectedBooking.id, 'approve');
                          setSelectedBookingId(null);
                        }}
                        className="bg-emerald-50 hover:bg-emerald-100 text-success-green border border-emerald-200 font-bold py-2.5 rounded-xl transition-all shadow-xs text-center cursor-pointer text-xs"
                      >
                        Approve Payment
                      </button>
                      <button
                        onClick={() => {
                          handleVerifyPayment(selectedBooking.id, 'reject');
                          setSelectedBookingId(null);
                        }}
                        className="bg-red-50 hover:bg-red-100 text-error-red border border-red-200 font-bold py-2.5 rounded-xl transition-all shadow-xs text-center cursor-pointer text-xs"
                      >
                        Reject Receipt
                      </button>
                    </div>
                  )}

                  {/* Option 2: Pending Approval of request */}
                  {selectedBooking.bookingStatus === 'PENDING' && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          handleApproveBooking(selectedBooking.id, selectedBooking.guideId);
                          setSelectedBookingId(null);
                        }}
                        className="bg-emerald-50 hover:bg-emerald-100 text-success-green border border-emerald-200 font-bold py-2.5 rounded-xl transition-all shadow-xs text-center cursor-pointer text-xs"
                      >
                        Approve Booking
                      </button>
                      <button
                        onClick={() => {
                          handleRejectBooking(selectedBooking.id);
                          setSelectedBookingId(null);
                        }}
                        className="bg-red-50 hover:bg-red-100 text-error-red border border-red-200 font-bold py-2.5 rounded-xl transition-all shadow-xs text-center cursor-pointer text-xs"
                      >
                        Reject Booking
                      </button>
                    </div>
                  )}

                  {/* Option 3: Guide Accepted and Awaiting Admin Approval of assignment */}
                  {selectedBooking.bookingStatus === 'GUIDE_ACCEPTED' && !selectedBooking.guideApprovedByAdmin && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          handleApproveBooking(selectedBooking.id, selectedBooking.guideId);
                          setSelectedBookingId(null);
                        }}
                        className="bg-emerald-50 hover:bg-emerald-100 text-success-green border border-emerald-200 font-bold py-2.5 rounded-xl transition-all shadow-xs text-center cursor-pointer text-xs"
                      >
                        Approve Guide Assignment
                      </button>
                      <button
                        onClick={() => {
                          handleRejectBooking(selectedBooking.id);
                          setSelectedBookingId(null);
                        }}
                        className="bg-red-50 hover:bg-red-100 text-error-red border border-red-200 font-bold py-2.5 rounded-xl transition-all shadow-xs text-center cursor-pointer text-xs"
                      >
                        Reject Guide Assignment
                      </button>
                    </div>
                  )}

                  {selectedBooking.bookingStatus !== 'PENDING' &&
                    !(selectedBooking.bookingStatus === 'GUIDE_ACCEPTED' && !selectedBooking.guideApprovedByAdmin) &&
                    selectedBooking.paymentStatus !== 'PENDING_VERIFICATION' && (
                      <div className="bg-slate-100 border border-slate-200 text-center rounded-xl p-3 text-[10px] text-slate-455 font-bold uppercase tracking-wider">
                        No reviews or approvals pending
                      </div>
                    )}
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedBookingId(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-655 font-bold px-6 py-2 rounded-xl text-xs cursor-pointer transition-colors"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
