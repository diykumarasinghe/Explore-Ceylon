import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import { Calendar, HelpCircle, RefreshCw, CreditCard, AlertCircle, CheckCircle, ArrowLeft, Download, Key, Users, Briefcase, ShieldCheck, MessageSquare, MapPin, Info, ChevronRight, User, FileText, Phone, Clock } from 'lucide-react';
import type { Booking } from '../types';
import { paymentsApi } from '../services/api';
import { ChatWindow } from '../components/ChatWindow';

export const MyBookings: React.FC = () => {
  const { currentUser, bookings, updateBookingStatus, submitBookingPayment, processPayment } = useTravel();
  const location = useLocation();

  useEffect(() => {
    if (location.state && (location.state as any).message) {
      triggerPageFeedback('success', (location.state as any).message);
      // Clear location state so it doesn't trigger again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Payment states
  const [activePaymentBooking, setActivePaymentBooking] = useState<Booking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [isProcessingStripe, setIsProcessingStripe] = useState<Record<string, boolean>>({});

  // General page feedback and inline cancel state
  const [pageFeedback, setPageFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [confirmingCancelId, setConfirmingCancelId] = useState<string | null>(null);

  const triggerPageFeedback = (type: 'success' | 'error' | 'info', message: string) => {
    setPageFeedback({ type, message });
    setTimeout(() => {
      setPageFeedback(prev => prev?.message === message ? null : prev);
    }, 4500);
  };

  const handleStripePayment = async (booking: Booking) => {
    setIsProcessingStripe(prev => ({ ...prev, [booking.id]: true }));
    try {
      const paymentResult = await processPayment(booking.id, 'Stripe');
      if (paymentResult && paymentResult.redirectUrl) {
        window.location.href = paymentResult.redirectUrl;
      } else if (paymentResult && paymentResult.transactionId) {
        // Dummy simulated payment confirmation success path
        window.location.href = `/payment-success?payment=success&bookingId=${booking.id}&session_id=${paymentResult.transactionId}`;
      } else {
        triggerPageFeedback('error', 'Stripe card checkout initialization failed. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      triggerPageFeedback('error', err.response?.data?.message || 'An error occurred during Stripe card checkout.');
    } finally {
      setIsProcessingStripe(prev => ({ ...prev, [booking.id]: false }));
    }
  };

  // Chat states
  const [chatBookingId, setChatBookingId] = useState<string | null>(null);
  const [chatRecipientName, setChatRecipientName] = useState('');
  const [chatRecipientRole, setChatRecipientRole] = useState('');
  const [chatRecipientPhone, setChatRecipientPhone] = useState<string | undefined>(undefined);

  if (!currentUser) return null;

  // Filter bookings for current tourist
  const myBookings = bookings.filter(b => b.customerId === currentUser.id);

  const handleCancelBooking = (bookingId: string) => {
    updateBookingStatus(bookingId, 'cancelled');
  };

  const canCancel = (booking: Booking) => {
    const isPaymentCancelable = booking.paymentStatus === 'NOT_PAID' || booking.paymentStatus === 'REJECTED';
    const isBookingCancelable = ['PENDING', 'AWAITING_GUIDE_ASSIGNMENT', 'GUIDE_ASSIGNED', 'GUIDE_ACCEPTED', 'GUIDE_REJECTED'].includes(booking.bookingStatus);
    return isPaymentCancelable && isBookingCancelable;
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentBooking) return;
    if (!receiptFile) {
      setPaymentError('Please select a payment receipt file.');
      return;
    }

    setIsProcessing(true);
    setPaymentError('');
    try {
      await submitBookingPayment(activePaymentBooking.id, paymentMethod, receiptFile);
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        setActivePaymentBooking(null);
        setReceiptFile(null);
        setPaymentMethod('Bank Transfer');
      }, 2500);
    } catch (err: any) {
      setPaymentError(err.response?.data?.message || 'Failed to upload payment proof. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadReceipt = async (booking: Booking) => {
    try {
      const response = await paymentsApi.downloadReceiptPdf(booking.id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt_${booking.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF receipt:', err);
      triggerPageFeedback('error', 'Failed to download PDF receipt. Please ensure payment is fully processed.');
    }
  };

  const getBookingStatusStyles = (booking: Booking) => {
    if (booking.paymentStatus === 'PENDING_VERIFICATION') {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    switch (booking.bookingStatus) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'AWAITING_GUIDE_ASSIGNMENT':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'GUIDE_ASSIGNED':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'GUIDE_ACCEPTED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'GUIDE_REJECTED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'CONFIRMED':
      case 'ONGOING':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'COMPLETED':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getPaymentStatusStyles = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'PAID':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDING_VERIFICATION':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="relative space-y-6 pb-12">
      {/* Back Button & Pill Header */}
      <div className="flex items-center space-x-2.5">
        <Link
          to="/customer"
          className="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-xs border border-slate-200 text-slate-400 hover:text-primary-blue hover:scale-105 transition-all"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </Link>
        <span className="bg-[#E0F2FE] text-[#0284C7] text-[10px] font-black tracking-wider px-3 py-1 rounded-full uppercase">
          RESERVATIONS
        </span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-800">My Bookings Timeline</h1>
        <p className="text-xs text-text-gray font-semibold">
          Manage your tour registrations, upload manual payment receipts, and trace guide progress updates.
        </p>
      </div>

      {pageFeedback && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold ${
          pageFeedback.type === 'success' ? 'bg-emerald-50 border-emerald-150 text-success-green' :
          pageFeedback.type === 'error' ? 'bg-red-50 border-red-150 text-error-red' :
          'bg-blue-50 border-blue-150 text-blue-850'
        } animate-fade-in`}>
          <span>{pageFeedback.message}</span>
          <button onClick={() => setPageFeedback(null)} className="text-slate-400 hover:text-slate-655 font-bold text-sm px-1.5">&times;</button>
        </div>
      )}

      {myBookings.length > 0 ? (
        <div className="space-y-6">
          {myBookings.map(b => (
            <div key={b.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
              
              {/* Card Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                {/* Left side: Image and details */}
                <div className="flex items-center space-x-4">
                  <img
                    src={b.packageImage}
                    alt={b.packageName}
                    className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-150"
                  />
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-black text-slate-800 leading-snug">{b.packageName}</h3>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold text-text-gray">
                      <span className="flex items-center text-slate-500">
                        <Calendar className="h-4 w-4 mr-1 text-primary-blue shrink-0" />
                        <span>Starts: {b.startDate}</span>
                      </span>
                      <span className="text-slate-350">•</span>
                      <span className="text-slate-505">{b.guestsCount} Guest{b.guestsCount !== 1 && 's'}</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Status badges & Pricing */}
                <div className="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-end justify-between lg:justify-center gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Booking Status Badge */}
                    <span className={`text-[10px] uppercase font-black tracking-wider px-3 py-1.5 rounded-lg border flex items-center space-x-1 ${getBookingStatusStyles(b)}`}>
                      {(b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'ONGOING') && <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-650 fill-emerald-50" />}
                      <span>
                        {b.paymentStatus === 'PENDING_VERIFICATION' ? 'PENDING VERIFICATION' :
                         b.bookingStatus === 'AWAITING_GUIDE_ASSIGNMENT' ? 'AWAITING GUIDE ASSIGNMENT' :
                          b.bookingStatus === 'GUIDE_ACCEPTED' ? (b.guideApprovedByAdmin ? 'GUIDE ACCEPTED / READY FOR PAYMENT' : 'GUIDE ACCEPTED / AWAITING ADMIN APPROVAL') :
                         b.bookingStatus.replace(/_/g, ' ')}
                      </span>
                    </span>

                    {/* Payment Status Badge */}
                    <span className={`text-[10px] uppercase font-black tracking-wider px-3 py-1.5 rounded-lg border flex items-center space-x-1 ${getPaymentStatusStyles(b.paymentStatus)}`}>
                      {b.paymentStatus === 'PAID' ? (
                        <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600 fill-emerald-50" />
                      ) : b.paymentStatus === 'PENDING_VERIFICATION' ? (
                        <RefreshCw className="w-3 h-3 mr-1 text-amber-500 animate-spin-slow shrink-0" />
                      ) : b.paymentStatus === 'REJECTED' ? (
                        <AlertCircle className="w-3 h-3 mr-1 text-red-500 shrink-0" />
                      ) : (
                        <HelpCircle className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                      )}
                      <span>
                        {b.paymentStatus === 'PAID' ? 'Paid' :
                         b.paymentStatus === 'PENDING_VERIFICATION' ? 'Verification Pending' :
                         b.paymentStatus === 'REJECTED' ? 'Rejected' :
                         'Not Paid'}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center lg:mt-1">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-2">Total Amount</span>
                    <span className="text-2xl font-black text-slate-800">${b.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Grid 1: Details & Payments */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Booking Details Card */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center space-x-2 text-slate-700">
                    <FileText className="w-4 h-4 text-primary-blue" />
                    <h4 className="text-xs font-black uppercase tracking-wider">Booking Details</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-1.5 text-slate-450">
                        <Key className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Booking ID</span>
                      </div>
                      <p className="text-xs font-bold text-slate-700 truncate select-all" title={b.id}>{b.id}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5 text-slate-450">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Guests</span>
                      </div>
                      <p className="text-xs font-bold text-slate-700">{b.guestsCount} Guest{b.guestsCount !== 1 ? 's' : ''}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5 text-slate-450">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Booking Date</span>
                      </div>
                      <p className="text-xs font-bold text-slate-700">{b.bookingDate || 'May 12, 2026'}</p>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-1.5 text-slate-455">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Package</span>
                      </div>
                      <p className="text-xs font-bold text-slate-700 truncate" title={b.packageName}>{b.packageName}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Details Card */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-4 flex-grow">
                    <div className="flex items-center space-x-2 text-slate-700">
                      <CreditCard className="w-4 h-4 text-primary-blue" />
                      <h4 className="text-xs font-black uppercase tracking-wider">Payment Details</h4>
                    </div>

                    <div className="grid grid-cols-1 gap-y-3">
                      <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Payment Status</p>
                        <span className={`text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-md border inline-block mt-1 ${getPaymentStatusStyles(b.paymentStatus)}`}>
                          {b.paymentStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Amount</p>
                          <p className="text-xs font-bold text-slate-700 mt-0.5">${b.totalAmount}</p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Payment Method</p>
                          <p className="text-xs font-bold text-slate-700 mt-0.5">{b.paymentMethod || 'Not Paid Yet'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Callout Cards */}
                  {(['PENDING', 'AWAITING_GUIDE_ASSIGNMENT', 'GUIDE_ASSIGNED', 'GUIDE_REJECTED'].includes(b.bookingStatus) ||
                    (b.bookingStatus === 'GUIDE_ACCEPTED' && !b.guideApprovedByAdmin)) &&
                    b.paymentStatus !== 'PAID' &&
                    b.paymentStatus !== 'PENDING_VERIFICATION' && (
                      <div className="bg-[#FFFDF5] border border-[#FEF3C7] rounded-xl p-4 flex flex-col justify-between max-w-xs shrink-0 self-stretch">
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-1.5 text-amber-600">
                            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="text-xs font-black">
                              {b.bookingStatus === 'PENDING' ? 'Awaiting Approval' :
                               b.bookingStatus === 'GUIDE_ASSIGNED' ? 'Awaiting Guide' :
                               b.bookingStatus === 'GUIDE_ACCEPTED' && !b.guideApprovedByAdmin ? 'Awaiting Admin Approval' :
                               'Assigning Guide'}
                            </span>
                          </div>
                          <p className="text-[10px] text-amber-700 font-semibold leading-normal">
                            {b.bookingStatus === 'PENDING' ? 'Your booking request is waiting for Admin approval.' :
                             b.bookingStatus === 'GUIDE_ASSIGNED' ? 'Waiting for guide confirmation before payment.' :
                             b.bookingStatus === 'GUIDE_ACCEPTED' && !b.guideApprovedByAdmin ? 'Waiting for Admin to approve guide assignment.' :
                             'We are assigning a new guide for your tour.'}
                          </p>
                        </div>
                        {confirmingCancelId === b.id ? (
                          <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-150 p-2 rounded-xl w-full justify-center mt-3">
                            <span className="text-[9px] text-red-750 font-bold uppercase">Confirm Cancel?</span>
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmingCancelId(null);
                                handleCancelBooking(b.id);
                                triggerPageFeedback('success', 'Booking cancelled successfully.');
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold text-[9px] px-2.5 py-1.5 rounded-lg transition-all uppercase cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmingCancelId(null)}
                              className="bg-green-600 hover:bg-green-700 text-white font-bold text-[9px] px-2.5 py-1.5 rounded-lg transition-all uppercase cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmingCancelId(b.id)}
                            className="w-full bg-white hover:bg-red-50 border border-red-200 text-red-655 font-bold text-xs py-2 px-3.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer mt-3"
                          >
                            <span>Cancel Booking</span>
                          </button>
                        )}
                      </div>
                    )}

                  {b.bookingStatus === 'GUIDE_ACCEPTED' && b.guideApprovedByAdmin && (b.paymentStatus === 'NOT_PAID' || b.paymentStatus === 'REJECTED') && (
                    <div className="bg-[#FFFDF5] border border-[#FEF3C7] rounded-xl p-4 flex flex-col justify-between max-w-xs shrink-0 self-stretch">
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-1.5 text-amber-600">
                          <Info className="w-4 h-4 text-amber-500 fill-amber-500/10 shrink-0" />
                          <span className="text-xs font-black">{b.paymentStatus === 'REJECTED' ? 'Receipt Rejected' : 'Payment Required'}</span>
                        </div>
                        <p className="text-[10px] text-amber-700 font-semibold leading-normal">
                          {b.paymentStatus === 'REJECTED'
                            ? 'Your previous receipt was rejected by Admin. Please re-submit payment.'
                            : 'Choose instant card checkout or upload a bank transfer receipt.'}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2 mt-3 w-full">
                        <button
                          disabled={isProcessingStripe[b.id]}
                          onClick={() => handleStripePayment(b)}
                          className="w-full bg-primary-blue hover:bg-sky-500 disabled:opacity-55 text-white font-bold text-xs py-2 px-3.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{isProcessingStripe[b.id] ? 'Redirecting...' : 'Pay with Card (Stripe Sandbox)'}</span>
                        </button>
                        
                        <button
                          disabled={isProcessingStripe[b.id]}
                          onClick={() => setActivePaymentBooking(b)}
                          className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs py-2.5 px-3.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>Upload Bank Receipt</span>
                        </button>

                        {confirmingCancelId === b.id ? (
                          <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-150 p-2 rounded-xl w-full justify-center">
                            <span className="text-[9px] text-red-750 font-bold uppercase">Confirm Cancel?</span>
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmingCancelId(null);
                                handleCancelBooking(b.id);
                                triggerPageFeedback('success', 'Booking cancelled successfully.');
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold text-[9px] px-2.5 py-1.5 rounded-lg transition-all uppercase cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmingCancelId(null)}
                              className="bg-green-600 hover:bg-green-700 text-white font-bold text-[9px] px-2.5 py-1.5 rounded-lg transition-all uppercase cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmingCancelId(b.id)}
                            className="w-full bg-white hover:bg-red-50 border border-red-200 text-red-655 font-bold text-xs py-2 px-3.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                          >
                            <span>Cancel Booking</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {b.paymentStatus === 'PENDING_VERIFICATION' && (
                    <div className="bg-[#FFFDF5] border border-[#FEF3C7] rounded-xl p-4 flex flex-col justify-center items-center text-center max-w-xs shrink-0 self-stretch">
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-655 mb-2">
                        <RefreshCw className="w-5 h-5 animate-spin-slow" />
                      </div>
                      <span className="text-xs font-black text-amber-850">Payment proof submitted. Waiting for admin verification.</span>
                    </div>
                  )}

                  {b.paymentStatus === 'PAID' && (
                    <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-4 flex flex-col justify-center items-center text-center max-w-xs shrink-0 self-stretch">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2">
                        <CheckCircle className="w-5 h-5 fill-emerald-50" />
                      </div>
                      <span className="text-xs font-black text-emerald-850">Payment Secured</span>
                      <p className="text-[9px] text-emerald-600 font-bold mt-1 leading-normal max-w-[180px]">
                        Your payment was verified. Your reservation is guaranteed!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid 2: Guide & Live Tour Progress */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* YOUR TOUR GUIDE */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center space-x-2 text-slate-700">
                    <User className="w-4 h-4 text-primary-blue shrink-0" />
                    <h4 className="text-xs font-black uppercase tracking-wider">Your Tour Guide</h4>
                  </div>                  {b.guideId && b.guideApprovedByAdmin ? (
                    b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'COMPLETED' ? (
                      <div className="bg-white border border-slate-105 rounded-xl p-4 shadow-2xs space-y-3.5">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex items-center space-x-3.5">
                            <img
                              src={b.guideAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"}
                              alt={b.guideName}
                              className="w-14 h-14 rounded-full object-cover shrink-0 border border-slate-150"
                            />
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                <span className="text-xs font-black text-slate-700 leading-tight">{b.guideName}</span>
                                <span className="bg-[#EFF6FF] text-[#1e74fd] text-[8px] font-black tracking-wider px-2 py-0.5 rounded border border-blue-100 uppercase">
                                  Licensed Guide
                                </span>
                              </div>
                              
                              <div className="space-y-0.5 text-[10px] font-bold text-slate-500">
                                <p className="flex items-center">
                                  <MessageSquare className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                                  <span>{b.guideEmail || `${b.guideName?.toLowerCase().replace(/\s+/g, '')}@mail.com`}</span>
                                </p>
                                <p className="flex items-center">
                                  <Phone className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                                  <span>{b.guidePhone || '+94 77 123 4567'}</span>
                                </p>
                                <p className="flex items-center">
                                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                                  <span>Colombo, Sri Lanka</span>
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                            {b.guidePhone && (
                              <a
                                href={`tel:${b.guidePhone}`}
                                className="flex-1 sm:flex-none border border-emerald-500 hover:bg-emerald-50 text-emerald-700 text-xs font-bold py-2 px-3.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all shadow-xs"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Call Guide</span>
                              </a>
                            )}
                            <button
                              onClick={() => {
                                setChatBookingId(b.id);
                                setChatRecipientName(b.guideName || 'Guide');
                                setChatRecipientRole('Tour Guide');
                                setChatRecipientPhone(b.guidePhone);
                              }}
                              className="flex-1 sm:flex-none border border-blue-500 hover:bg-blue-50 text-blue-755 text-xs font-bold py-2 px-3.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Message Guide</span>
                            </button>
                          </div>
                        </div>

                        <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-xl p-3 flex items-start space-x-2 text-[10px] text-blue-755 font-semibold leading-normal">
                          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          <span>Guide details are visible because your booking is confirmed.</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-100 rounded-xl p-4 text-xs text-text-gray font-semibold space-y-1">
                        <div className="flex items-center space-x-1.5 text-slate-750">
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-black shadow-2xs shrink-0">
                            {b.guideName?.charAt(0)}
                          </div>
                          <span className="font-extrabold text-slate-800">Guide Assigned: {b.guideName}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal font-semibold">
                          Contact details and call button will be available once the booking status is CONFIRMED.
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="bg-white border border-slate-100 rounded-xl p-4 text-xs text-text-gray font-semibold flex items-center justify-center shadow-2xs h-[52px]">
                      <HelpCircle className="h-4.5 w-4.5 mr-2 text-slate-400 shrink-0" />
                      <span>Guide will be assigned by admin during review.</span>
                    </div>
                  )}
                </div>

                {/* LIVE TOUR PROGRESS */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center space-x-2 text-slate-700">
                    <RefreshCw className="w-4 h-4 text-primary-blue shrink-0" />
                    <h4 className="text-xs font-black uppercase tracking-wider">Live Tour Progress</h4>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-2xs space-y-3.5">
                    {b.bookingStatus === 'CANCELLED' ? (
                      <p className="text-xs text-red-500 font-semibold">Booking has been cancelled.</p>
                    ) : (
                      <>
                        {/* Progress Timeline Nodes */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 relative py-2">
                          
                          {/* Dashed Connector Line for Desktop */}
                          <div className="hidden sm:block absolute left-[15%] right-[15%] top-7 h-0.5 border-t-2 border-dashed border-slate-200 -z-0" />
                          
                          {/* Step 1: UPCOMING */}
                          {(() => {
                            const isUpcoming = b.tourStatus === 'UPCOMING' || !b.tourStatus;
                            const isPastUpcoming = b.tourStatus === 'ONGOING' || b.tourStatus === 'COMPLETED' || b.bookingStatus === 'COMPLETED';
                            return (
                              <div className="flex flex-row sm:flex-col items-center text-left sm:text-center space-x-3 sm:space-x-0 w-full sm:w-[30%] z-10">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors ${
                                  isPastUpcoming 
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                                    : isUpcoming
                                      ? 'bg-emerald-50 border-emerald-500 text-emerald-600 ring-4 ring-emerald-50/50'
                                      : 'bg-slate-50 border-slate-200 text-slate-400'
                                }`}>
                                  <Calendar className="w-4.5 h-4.5" />
                                </div>
                                <div className="sm:mt-2 text-left sm:text-center">
                                  <p className={`text-[9px] font-black uppercase tracking-wider ${
                                    isUpcoming || isPastUpcoming ? 'text-emerald-700' : 'text-slate-400'
                                  }`}>Upcoming</p>
                                  <p className="text-[8px] text-slate-500 font-semibold leading-tight mt-0.5">
                                    Tour is scheduled for {b.startDate}
                                  </p>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Step 2: ONGOING */}
                          {(() => {
                            const isOngoing = b.tourStatus === 'ONGOING';
                            const isPastOngoing = b.tourStatus === 'COMPLETED' || b.bookingStatus === 'COMPLETED';
                            return (
                              <div className="flex flex-row sm:flex-col items-center text-left sm:text-center space-x-3 sm:space-x-0 w-full sm:w-[30%] z-10">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors ${
                                  isPastOngoing 
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                                    : isOngoing
                                      ? 'bg-blue-50 border-blue-500 text-blue-600 ring-4 ring-blue-50/50'
                                      : 'bg-slate-50 border-slate-200 text-slate-400'
                                }`}>
                                  {/* Bus/Vehicle Icon */}
                                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                  </svg>
                                </div>
                                <div className="sm:mt-2 text-left sm:text-center">
                                  <p className={`text-[9px] font-black uppercase tracking-wider ${
                                    isOngoing ? 'text-blue-700' : isPastOngoing ? 'text-emerald-700' : 'text-slate-400'
                                  }`}>Ongoing</p>
                                  <p className="text-[8px] text-slate-500 font-semibold leading-tight mt-0.5">
                                    {isOngoing ? (b.tourProgress || 'Tour in progress') : 'Tour in progress'}
                                  </p>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Step 3: COMPLETED */}
                          {(() => {
                            const isCompleted = b.tourStatus === 'COMPLETED' || b.bookingStatus === 'COMPLETED';
                            return (
                              <div className="flex flex-row sm:flex-col items-center text-left sm:text-center space-x-3 sm:space-x-0 w-full sm:w-[30%] z-10">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors ${
                                  isCompleted
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-600 ring-4 ring-emerald-50/50'
                                    : 'bg-slate-50 border-slate-200 text-slate-400'
                                }`}>
                                  {/* Flag Icon */}
                                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21v11h-6.5l-1-1H5a2 2 0 00-2 2zm0 0h18" />
                                  </svg>
                                </div>
                                <div className="sm:mt-2 text-left sm:text-center">
                                  <p className={`text-[9px] font-black uppercase tracking-wider ${
                                    isCompleted ? 'text-emerald-700' : 'text-slate-400'
                                  }`}>Completed</p>
                                  <p className="text-[8px] text-slate-500 font-semibold leading-tight mt-0.5">
                                    Tour completed
                                  </p>
                                </div>
                              </div>
                            );
                          })()}

                        </div>

                        <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-xl p-3 flex items-start space-x-2 text-[10px] text-blue-755 font-semibold leading-normal">
                          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          <span>Tour progress will be updated by your guide during the trip.</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

              </div>

              {/* Footer Banner: Secure Booking */}
              {b.bookingStatus !== 'CANCELLED' && (
                <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 text-left w-full sm:w-auto">
                    <ShieldCheck className="w-8 h-8 text-blue-600 fill-blue-650/10 shrink-0" />
                    <div>
                      <h5 className="text-xs font-black text-blue-900 leading-none">Secure Booking</h5>
                      <p className="text-[10px] text-blue-700 font-semibold mt-1 leading-normal">
                        Your booking is safe with us. You can cancel or modify your booking request before travel dates.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 w-full sm:w-auto shrink-0 justify-end">
                    {canCancel(b) && (
                      confirmingCancelId === b.id ? (
                        <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-150 p-2 rounded-xl">
                          <span className="text-[10px] text-red-750 font-bold uppercase">Confirm Cancel?</span>
                          <button
                            onClick={() => {
                              setConfirmingCancelId(null);
                              handleCancelBooking(b.id);
                              triggerPageFeedback('success', 'Booking request cancelled successfully.');
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold text-[9px] px-2.5 py-1.5 rounded-lg transition-all uppercase cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmingCancelId(null)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold text-[9px] px-2.5 py-1.5 rounded-lg transition-all uppercase cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingCancelId(b.id)}
                          className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors border border-slate-200 hover:border-slate-350 px-3.5 py-2 rounded-xl bg-white shadow-sm cursor-pointer w-full sm:w-auto text-center"
                        >
                          Cancel Request
                        </button>
                      )
                    )}

                    {(b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'COMPLETED') && (
                      <button
                        onClick={() => handleDownloadReceipt(b)}
                        className="bg-white border border-slate-200 hover:border-primary-blue hover:text-primary-blue text-slate-600 font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-between sm:justify-center space-x-1.5 transition-colors shadow-sm cursor-pointer w-full sm:w-auto"
                      >
                        <div className="flex items-center space-x-1.5">
                          <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-blue" />
                          <span>Download Receipt</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-xs">
          <p className="text-slate-400 font-bold text-base">You haven't made any booking reservations yet.</p>
          <Link
            to="/packages"
            className="mt-4 bg-primary-blue hover:bg-sky-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md inline-block"
          >
            Browse Travel Packages
          </Link>
        </div>
      )}

      {/* Premium Glassmorphism Payment Modal */}
      {activePaymentBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-primary-blue">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-deep-navy">Submit Payment Proof</h3>
              <p className="text-[11px] text-text-gray font-semibold">
                Upload bank transfer receipt or deposit slip for: <span className="text-slate-700 font-bold">{activePaymentBooking.packageName}</span>
              </p>
            </div>

            {/* Error Message */}
            {paymentError && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 flex items-start space-x-2 text-xs font-semibold text-error-red">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Success state */}
            {paymentSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="mx-auto w-16 h-16 bg-emerald-50 text-success-green rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 animate-bounce" />
                </div>
                <h4 className="text-base font-extrabold text-deep-navy">Receipt Submitted</h4>
                <p className="text-xs text-text-gray font-semibold">Your payment receipt has been uploaded and sent for Admin verification.</p>
              </div>
            ) : (
              /* Payment Form */
              <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs font-semibold text-slate-600">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Total Amount Due</span>
                  <span className="text-xl font-black text-slate-800">${activePaymentBooking.totalAmount}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400">Payment Method *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 font-semibold cursor-pointer focus:outline-none focus:border-primary-blue"
                  >
                    <option value="Bank Transfer">Bank Transfer / EFT</option>
                    <option value="Cash Deposit">Direct Cash Deposit</option>
                    <option value="Credit Card Transfer">Credit Card Online Transfer</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400">Upload Receipt Proof *</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-primary-blue transition-colors cursor-pointer relative bg-slate-50">
                    <input
                      required
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setReceiptFile(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="space-y-1 text-slate-500">
                      <FileText className="h-8 w-8 text-slate-400 mx-auto" />
                      <p className="text-[11px] font-bold">
                        {receiptFile ? receiptFile.name : 'Click to choose image or PDF receipt'}
                      </p>
                      <p className="text-[9px] text-slate-400">Max size 5MB (JPG, PNG, PDF)</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => {
                      setActivePaymentBooking(null);
                      setReceiptFile(null);
                    }}
                    className="border border-slate-200 hover:border-slate-350 text-slate-655 font-bold py-2.5 rounded-xl transition-colors text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing || !receiptFile}
                    className="bg-primary-blue hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <span>Upload Proof</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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
