import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import { messagesApi } from '../services/api';
import { 
  User, Mail, ShieldAlert, RefreshCw, ArrowLeft, Phone,
  MessageSquare, MapPin, Info, Briefcase, CheckCircle2, 
  CheckCircle, Clock, Send, Paperclip, Play, 
  ClipboardList, Plus, ChevronRight, Milestone
} from 'lucide-react';
import type { Booking } from '../types';

export const AssignedTours: React.FC = () => {
  const { currentUser, bookings, updateGuideTourStatus } = useTravel();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTourId = searchParams.get('id');

  // Page level feedback & inline complete tour states
  const [pageFeedback, setPageFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Chat States for embedded chat
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Notes/Logs state
  const [addingNote, setAddingNote] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Filter bookings assigned to this guide
  const myAssignedTours = currentUser ? bookings.filter(b => b.guideId === currentUser.id) : [];
  
  // Active selected booking object
  const activeBooking = myAssignedTours.find(b => b.id === selectedTourId);

  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setPageFeedback({ type, message });
    setTimeout(() => {
      setPageFeedback(prev => prev?.message === message ? null : prev);
    }, 4500);
  };

  // Poll chat messages for selected tour
  useEffect(() => {
    if (selectedTourId && activeBooking) {
      const loadMessages = async () => {
        try {
          const res = await messagesApi.getConversation(selectedTourId);
          setMessages(res.data);
        } catch (e) {
          console.error('Error fetching chat conversation:', e);
        }
      };
      loadMessages();
      const interval = setInterval(loadMessages, 8000);
      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [selectedTourId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingMsg || !selectedTourId) return;
    setSendingMsg(true);
    try {
      const res = await messagesApi.sendMessage(selectedTourId, chatInput.trim());
      setMessages(prev => [...prev, res.data]);
      setChatInput('');
    } catch (err: any) {
      triggerFeedback('error', 'Failed to send message.');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleQuickStatusUpdate = async (status: string, progress: string) => {
    if (!selectedTourId) return;
    try {
      await updateGuideTourStatus(selectedTourId, status, progress);
      triggerFeedback('success', `Tour status successfully updated to ${status}!`);
    } catch (err: any) {
      triggerFeedback('error', err.response?.data?.message || 'Failed to update tour status.');
    }
  };

  const handleSaveRoadLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim() || !selectedTourId || !activeBooking) return;
    setSavingNote(true);
    try {
      const newProgress = noteInput.trim();
      await updateGuideTourStatus(selectedTourId, activeBooking.tourStatus, newProgress);
      setNoteInput('');
      setAddingNote(false);
      triggerFeedback('success', 'Road log/note added successfully!');
    } catch (err: any) {
      triggerFeedback('error', 'Failed to add road log.');
    } finally {
      setSavingNote(false);
    }
  };

  // Helper to generate dynamic emergency contact, pick-up location, vehicle based on package theme
  const getMockMetadata = (b: Booking) => {
    const pkgName = b.packageName.toLowerCase();
    let emergency = '+94 71 987 6543';
    let pickup = 'Colombo City';
    let vehicle = 'Car - WP KBC 5678';
    let notes = 'Be at hotel lobby at 6:30 AM';

    if (pkgName.includes('yala') || pkgName.includes('safari') || pkgName.includes('wild')) {
      emergency = '+94 71 987 6543';
      pickup = 'Yala National Park Entrance';
      vehicle = 'Jeep - WP DAC 1234';
      notes = 'Be ready at camp entrance at 5:45 AM';
    } else if (pkgName.includes('ella') || pkgName.includes('train')) {
      emergency = '+94 71 987 8822';
      pickup = 'Ella Railway Station';
      vehicle = 'Van - WP CAS 3399';
      notes = 'Meet at train station platform 2';
    } else if (pkgName.includes('sigiriya') || pkgName.includes('cultural')) {
      emergency = '+94 71 987 6543';
      pickup = 'Colombo City';
      vehicle = 'Sedan - WP DAC 7788';
      notes = 'Be at hotel lobby at 6:30 AM';
    } else if (pkgName.includes('surf') || pkgName.includes('beach') || pkgName.includes('mirissa')) {
      emergency = '+94 71 987 1144';
      pickup = 'Hikkaduwa Harbour';
      vehicle = 'Van - WP CAS 4411';
      notes = 'Meet at surfing point beach club';
    }
    return { emergency, pickup, vehicle, notes };
  };

  if (!currentUser) return null;

  return (
    <div className="relative space-y-6 pb-12">
      {/* Alert Feedbacks */}
      {pageFeedback && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-lg ${
          pageFeedback.type === 'success' ? 'bg-emerald-50 border-emerald-150 text-success-green' : 'bg-red-50 border-red-150 text-error-red'
        } animate-fade-in`}>
          <span>{pageFeedback.message}</span>
          <button onClick={() => setPageFeedback(null)} className="text-slate-400 hover:text-slate-655 font-bold text-sm px-1.5 ml-4">&times;</button>
        </div>
      )}

      {/* RENDER TOUR DETAILS DASHBOARD IF Selected ID is valid */}
      {selectedTourId && activeBooking ? (
        (() => {
          const meta = getMockMetadata(activeBooking);
          const isCompleted = activeBooking.bookingStatus === 'COMPLETED';
          const isUpcoming = activeBooking.tourStatus === 'UPCOMING';
          const isOngoing = activeBooking.tourStatus === 'ONGOING';
          const isContactVisible = (activeBooking.bookingStatus === 'CONFIRMED' || activeBooking.bookingStatus === 'COMPLETED') && activeBooking.paymentStatus === 'PAID';
          
          return (
            <div className="space-y-6">
              
              {/* Back Button & Pill Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={() => setSearchParams({})}
                    className="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-xs border border-slate-200 text-slate-400 hover:text-primary-blue hover:scale-105 transition-all cursor-pointer"
                    title="Back to Assigned Tours"
                  >
                    <ArrowLeft className="w-4.5 h-4.5" />
                  </button>
                  <span className="bg-[#E0F2FE] text-[#0284C7] text-[10px] font-black tracking-wider px-3 py-1 rounded-full uppercase">
                    ASSIGNED TOURS
                  </span>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0 justify-end">
                  {isContactVisible && activeBooking.customerPhone && (
                    <a
                      href={`tel:${activeBooking.customerPhone}`}
                      className="border border-[#CBD5E1] bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-xs"
                    >
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>Call Customer</span>
                    </a>
                  )}
                  <a
                    href="#chat-section"
                    className="bg-primary-blue hover:bg-sky-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-md relative"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Messages</span>
                    <span className="bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center absolute -top-1.5 -right-1">3</span>
                  </a>
                </div>
              </div>

              {/* Title Header */}
              <div className="space-y-1">
                <h1 className="text-2xl font-black text-slate-800">Assigned Tour Details</h1>
                <p className="text-xs text-text-gray font-semibold">
                  View tour details, customer information, communicate and manage your tour progress.
                </p>
              </div>

              {/* Package Banner Header Card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center space-x-4">
                  <img
                    src={activeBooking.packageImage}
                    alt={activeBooking.packageName}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-100"
                  />
                  <div>
                    <h2 className="text-lg font-black text-slate-800 leading-snug">{activeBooking.packageName}</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      BOOKING ID: <span className="font-extrabold text-slate-655 select-all">{activeBooking.id}</span>
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className={`text-[10px] uppercase font-black tracking-wider px-3.5 py-1.5 rounded-full border ${
                    activeBooking.bookingStatus === 'COMPLETED'
                      ? 'bg-slate-50 text-slate-700 border-slate-200'
                      : activeBooking.bookingStatus === 'CANCELLED'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : (activeBooking.bookingStatus === 'CONFIRMED' || activeBooking.bookingStatus === 'ONGOING')
                          ? 'bg-violet-50 text-violet-700 border-violet-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {activeBooking.bookingStatus} (TOUR: {activeBooking.tourStatus})
                  </span>
                </div>
              </div>

              {/* Horizontal Metadata Row Status Bar */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-5 gap-4 shadow-3xs divide-y-0 divide-x divide-slate-100">
                <div className="px-2">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Travel Date</span>
                  <span className="text-xs font-bold text-slate-700 block mt-1">{activeBooking.startDate}</span>
                </div>
                <div className="px-4">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Travelers</span>
                  <span className="text-xs font-bold text-slate-700 block mt-1">{activeBooking.guestsCount} Traveler{activeBooking.guestsCount !== 1 && 's'}</span>
                </div>
                <div className="px-4">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Package Price</span>
                  <span className="text-xs font-black text-emerald-600 block mt-1">${activeBooking.totalAmount}</span>
                </div>
                <div className="px-4">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Booking Date</span>
                  <span className="text-xs font-bold text-slate-700 block mt-1">{activeBooking.bookingDate}</span>
                </div>
                <div className="px-4">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Payment Status</span>
                  <span className={`text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded border mt-1 inline-block ${
                    activeBooking.paymentStatus === 'PAID'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>{activeBooking.paymentStatus}</span>
                </div>
              </div>

              {/* MAIN LAYOUT 3-COLUMN GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUMN 1: CUSTOMER DETAILS */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-3xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-slate-700 pb-3 border-b border-slate-100">
                      <User className="w-4.5 h-4.5 text-primary-blue shrink-0" />
                      <h3 className="text-xs font-black uppercase tracking-wider">Customer Details</h3>
                    </div>

                    {isContactVisible ? (
                      <div className="bg-white border border-slate-105 rounded-xl p-4 shadow-2xs space-y-3.5">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center space-x-3.5">
                            <img
                              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                              alt={activeBooking.customerName}
                              className="w-14 h-14 rounded-full object-cover shrink-0 border border-slate-150"
                            />
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                <span className="text-xs font-black text-slate-700 leading-tight">{activeBooking.customerName}</span>
                                <span className="bg-[#EFF6FF] text-[#1e74fd] text-[8px] font-black tracking-wider px-2 py-0.5 rounded border border-blue-100 uppercase">
                                  Primary Tourist
                                </span>
                              </div>
                              
                              <div className="space-y-0.5 text-[10px] font-bold text-slate-500">
                                <p className="flex items-center">
                                  <Mail className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                                  <span>{activeBooking.customerEmail}</span>
                                </p>
                                <p className="flex items-center">
                                  <Phone className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                                  <span>{activeBooking.customerPhone || 'N/A'}</span>
                                </p>
                                <p className="flex items-center">
                                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                                  <span>{meta.pickup || 'Colombo, Sri Lanka'}</span>
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 w-full">
                            {activeBooking.customerPhone && (
                              <a
                                href={`tel:${activeBooking.customerPhone}`}
                                className="flex-1 border border-emerald-500 hover:bg-emerald-50 text-emerald-700 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all shadow-xs text-center"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Call</span>
                              </a>
                            )}
                            <a
                              href="#chat-section"
                              className="flex-1 border border-blue-500 hover:bg-blue-50 text-blue-755 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer text-center"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Message</span>
                            </a>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 gap-y-2 text-[10px] font-bold text-slate-500">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 uppercase tracking-wider">Pickup Location</span>
                            <span className="text-slate-700 font-extrabold text-right">{meta.pickup}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 uppercase tracking-wider">Number of Travelers</span>
                            <span className="text-slate-700 font-extrabold">{activeBooking.guestsCount} Traveler{activeBooking.guestsCount !== 1 && 's'}</span>
                          </div>
                          <div className="flex flex-col gap-1 pt-1">
                            <span className="text-slate-400 uppercase tracking-wider">Special Requests</span>
                            <span className="text-slate-700 font-extrabold bg-slate-50 p-2 rounded-lg border border-slate-100 normal-case font-semibold">
                              {activeBooking.specialRequests || 'None'}
                            </span>
                          </div>
                        </div>

                        <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-xl p-3 flex items-start space-x-2 text-[10px] text-blue-755 font-semibold leading-normal">
                          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          <span>Customer contact information is visible because this booking is confirmed and paid.</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-100 rounded-xl p-4 text-xs text-text-gray font-semibold space-y-3">
                        <div className="flex items-center space-x-1.5 text-slate-750">
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-black shadow-2xs shrink-0">
                            {activeBooking.customerName?.charAt(0)}
                          </div>
                          <span className="font-extrabold text-slate-800">Customer: {activeBooking.customerName}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal font-semibold">
                          Contact details, pickup location, special requests and contact buttons will be available once the booking status is CONFIRMED and payment is PAID.
                        </p>
                        <div className="bg-[#FFF8E6] border border-[#FFEBAA] rounded-xl p-3 flex items-start space-x-2 text-[10px] text-amber-800 font-semibold leading-normal">
                          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <span>Currently: Booking is <strong>{activeBooking.bookingStatus}</strong> and Payment is <strong>{activeBooking.paymentStatus}</strong>.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* COLUMN 2: BOOKING & TOUR STATUS */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-3xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-slate-700 pb-3 border-b border-slate-50">
                      <Briefcase className="w-4.5 h-4.5 text-primary-blue" />
                      <h3 className="text-xs font-black uppercase tracking-wider">Booking & Tour Status</h3>
                    </div>

                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Booking Status</span>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-black text-[9px] uppercase">
                          {activeBooking.bookingStatus}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Payment Status</span>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-250 px-2 py-0.5 rounded font-black text-[9px] uppercase">
                          {activeBooking.paymentStatus}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tour Status</span>
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-black text-[9px] uppercase">
                          {activeBooking.tourStatus}
                        </span>
                      </div>

                      <div className="pt-2 divide-y divide-slate-50">
                        <div className="py-2.5 flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Assigned Date</span>
                          <span className="text-xs font-bold text-slate-700">{activeBooking.bookingDate} 10:30 AM</span>
                        </div>

                        <div className="py-2.5 flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Approved By</span>
                          <span className="text-xs font-bold text-slate-700">{activeBooking.approvedBy || 'Admin User'}</span>
                        </div>

                        <div className="py-2.5 flex justify-between items-start">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 mt-0.5">Guide Notes</span>
                          <span className="text-xs font-bold text-slate-700 text-right max-w-[150px] leading-snug">{meta.notes} &rarr;</span>
                        </div>

                        <div className="py-2.5 flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Vehicle / Transport</span>
                          <span className="text-xs font-black text-slate-800">{meta.vehicle}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* COLUMN 3: MESSAGES (embedded chat box) */}
                <div id="chat-section" className="bg-white border border-slate-100 rounded-3xl p-5 shadow-3xs flex flex-col h-[480px]">
                  {/* Chat Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
                    <div className="flex items-center space-x-2 text-slate-700">
                      <MessageSquare className="w-4.5 h-4.5 text-primary-blue" />
                      <h3 className="text-xs font-black uppercase tracking-wider">Messages</h3>
                    </div>
                  </div>

                  {/* Message History */}
                  <div ref={chatContainerRef} className="flex-grow overflow-y-auto py-4 space-y-3 bg-slate-50/50 rounded-xl px-2 my-3 max-h-[310px]">
                    <div className="text-center my-1.5 shrink-0">
                      <span className="bg-white border border-slate-100 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full text-slate-400">
                        Today
                      </span>
                    </div>

                    {messages.length > 0 ? (
                      messages.map((msg) => {
                        const isMe = msg.senderId === currentUser.id;
                        return (
                          <div
                            key={msg._id}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center space-x-1 mb-0.5">
                              <span className="text-[8px] font-bold text-slate-400">
                                {isMe ? 'You (Guide)' : `${activeBooking.customerName} (Customer)`}
                              </span>
                            </div>
                            <div
                              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[11px] leading-relaxed shadow-3xs ${
                                isMe
                                  ? 'bg-primary-blue text-white rounded-br-none'
                                  : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                              }`}
                            >
                              <p className="break-words font-medium">{msg.message}</p>
                            </div>
                            <span className="text-[8px] text-slate-400 mt-0.5 px-1 font-bold">
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4 space-y-2 text-slate-400 mt-8">
                        <MessageSquare className="w-8 h-8 text-slate-300" />
                        <p className="text-[10px] font-bold">No chat history found.</p>
                        <p className="text-[9px] font-semibold max-w-[150px]">Send a hello message to sync up departure details!</p>
                      </div>
                    )}
                  </div>

                  {/* Send Input */}
                  <form onSubmit={handleSendMessage} className="border-t border-slate-100 pt-3 flex items-center space-x-2 shrink-0">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:border-primary-blue focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 rounded-xl shrink-0 transition-colors"
                      title="Attach file"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || sendingMsg}
                      className="p-2 bg-primary-blue hover:bg-sky-500 text-white rounded-xl shrink-0 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                  
                  <div className="text-center pt-2.5 shrink-0">
                    <a href="#chat-section" className="text-[10px] text-primary-blue font-extrabold hover:underline inline-flex items-center">
                      <span>View All Messages</span>
                      <ChevronRight className="w-3 h-3 ml-0.5" />
                    </a>
                  </div>
                </div>

              </div>

              {/* SECONDARY ROW GRID: MILESTONES, ACTIONS, ROAD LOGS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. TOUR MILESTONES */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-3xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-slate-700 pb-3 border-b border-slate-50">
                      <Milestone className="w-4.5 h-4.5 text-primary-blue" />
                      <h3 className="text-xs font-black uppercase tracking-wider">Tour Milestones</h3>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="relative pl-6 space-y-5">
                      <div className="absolute left-2 top-1.5 bottom-1.5 w-0.5 bg-slate-100" />

                      {/* Milestone 1 */}
                      <div className="relative">
                        <div className="absolute -left-6 top-0.5 w-4.5 h-4.5 rounded-full bg-emerald-50 border border-emerald-250 flex items-center justify-center text-emerald-600">
                          <CheckCircle className="w-3.5 h-3.5 fill-emerald-50" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800 leading-none">Booking Confirmed</p>
                          <p className="text-[8px] text-slate-400 font-bold mt-1">{activeBooking.bookingDate} 10:30 AM</p>
                          <p className="text-[9px] text-slate-500 font-semibold mt-1">Admin has approved and assigned the tour.</p>
                        </div>
                      </div>

                      {/* Milestone 2 */}
                      <div className="relative">
                        <div className={`absolute -left-6 top-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center border ${
                          isOngoing || isCompleted
                            ? 'bg-emerald-50 border-emerald-250 text-emerald-600'
                            : 'bg-blue-50 border-blue-200 text-blue-600 ring-4 ring-blue-50/50'
                        }`}>
                          {isOngoing || isCompleted ? (
                            <CheckCircle className="w-3.5 h-3.5 fill-emerald-50" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800 leading-none">Tour Upcoming</p>
                          <p className="text-[8px] text-slate-400 font-bold mt-1">{activeBooking.startDate} 09:00 AM</p>
                          <p className="text-[9px] text-slate-500 font-semibold mt-1">Travel date is approaching.</p>
                        </div>
                      </div>

                      {/* Milestone 3 */}
                      <div className="relative">
                        <div className={`absolute -left-6 top-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center border ${
                          isCompleted
                            ? 'bg-emerald-50 border-emerald-250 text-emerald-600'
                            : isOngoing
                              ? 'bg-blue-50 border-blue-200 text-blue-600 ring-4 ring-blue-50/50'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-3.5 h-3.5 fill-emerald-50" />
                          ) : isOngoing ? (
                            <Clock className="w-3.5 h-3.5" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800 leading-none">Tour Ongoing</p>
                          <p className="text-[8px] text-slate-400 font-bold mt-1">{isOngoing ? 'Active Now' : '-'}</p>
                          <p className="text-[9px] text-slate-500 font-semibold mt-1">You can start the tour on the travel date.</p>
                        </div>
                      </div>

                      {/* Milestone 4 */}
                      <div className="relative">
                        <div className={`absolute -left-6 top-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center border ${
                          isCompleted
                            ? 'bg-emerald-50 border-emerald-250 text-emerald-600'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-3.5 h-3.5 fill-emerald-50" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800 leading-none">Tour Completed</p>
                          <p className="text-[8px] text-slate-400 font-bold mt-1">-</p>
                          <p className="text-[9px] text-slate-500 font-semibold mt-1">Mark the tour as completed after finishing.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-3 border-t border-slate-50">
                    <button
                      onClick={() => triggerFeedback('success', 'All milestone logs are currently up to date!')}
                      className="text-[10px] text-primary-blue font-extrabold hover:underline"
                    >
                      View All Milestones &rarr;
                    </button>
                  </div>
                </div>

                {/* 2. TOUR ACTIONS */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-3xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-slate-700 pb-3 border-b border-slate-50">
                      <Play className="w-4.5 h-4.5 text-primary-blue" />
                      <h3 className="text-xs font-black uppercase tracking-wider">Tour Actions</h3>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start space-x-2 text-[10px] text-blue-700 font-semibold leading-normal">
                      <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>Update the tour status as the tour progresses.</span>
                    </div>

                    <div className="bg-[#FFFDF5] border border-[#FEF3C7] rounded-xl p-4 text-xs font-semibold text-amber-700 leading-normal">
                      <p className="font-extrabold text-[10px] text-amber-800 uppercase tracking-wider">Travel Date: {activeBooking.startDate}</p>
                      <p className="text-[9px] mt-1">Be prepared and contact the customer before starting the tour.</p>
                    </div>

                    <div className="space-y-2.5 pt-2">
                      {isUpcoming && (
                        <button
                          onClick={() => handleQuickStatusUpdate('ONGOING', 'Tour has started! Guide met tourists at pick-up location.')}
                          className="w-full bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                        >
                          <Play className="w-4 h-4" />
                          <span>Start Tour</span>
                        </button>
                      )}

                      {!isCompleted && (
                        <>
                          <button
                            onClick={() => handleQuickStatusUpdate('ONGOING', 'Tour progress: Journey is ongoing.')}
                            className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                          >
                            <RefreshCw className="w-4 h-4 text-slate-400" />
                            <span>Mark as Ongoing</span>
                          </button>
                          
                          <button
                            onClick={() => handleQuickStatusUpdate('COMPLETED', 'Tour completed successfully! Guide dropped off tourists.')}
                            className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4 text-slate-400" />
                            <span>Complete Tour</span>
                          </button>
                        </>
                      )}

                      {isCompleted && (
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Tour is fully completed
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. ROAD LOGS & NOTES */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-3xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-slate-700 pb-3 border-b border-slate-50">
                      <ClipboardList className="w-4.5 h-4.5 text-primary-blue" />
                      <h3 className="text-xs font-black uppercase tracking-wider">Road Logs & Notes</h3>
                    </div>

                    {addingNote ? (
                      <form onSubmit={handleSaveRoadLog} className="space-y-3 font-semibold text-xs text-slate-600">
                        <textarea
                          required
                          rows={3}
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          placeholder="Type notes (e.g., Driver has met tourists at hotel lobby. Moving to Ella...)"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:border-primary-blue"
                        />
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            disabled={savingNote}
                            className="bg-primary-blue hover:bg-sky-500 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] shadow-sm flex items-center"
                          >
                            {savingNote ? 'Saving...' : 'Save Note'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddingNote(false)}
                            className="border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold px-3 py-1.5 rounded-lg text-[10px]"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        {activeBooking.tourProgress ? (
                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 relative space-y-2">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Current Road Log</span>
                            <p className="text-xs text-slate-655 font-bold italic leading-relaxed">
                              "{activeBooking.tourProgress}"
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-3">
                            <ClipboardList className="w-8 h-8 text-slate-200" />
                            <p className="text-[10px] font-bold">No road logs or notes added yet.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {!addingNote && (
                    <div className="text-center pt-3 border-t border-slate-50 shrink-0">
                      <button
                        onClick={() => {
                          setAddingNote(true);
                          setNoteInput(activeBooking.tourProgress || '');
                        }}
                        className="text-[10px] text-primary-blue font-extrabold hover:underline inline-flex items-center"
                      >
                        <Plus className="w-3 h-3 mr-0.5" />
                        <span>Add Road Log / Note</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* Bottom Note Alert */}
              <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-4 flex items-center space-x-3 text-left">
                <Info className="w-5 h-5 text-blue-650 shrink-0" />
                <p className="text-[10.5px] text-blue-755 font-semibold leading-normal">
                  <strong>Note:</strong> Please update the tour status as the tour progresses and keep the customer informed.
                </p>
              </div>

            </div>
          );
        })()
      ) : (
        /* RENDER ROSTER LIST VIEW OF ALL ASSIGNED TOURS */
        <div className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-800">Assigned Tours & Rosters</h1>
            <p className="text-xs text-text-gray font-semibold">
              Manage active customer registrations, inspect guest counts, and publish travel milestones.
            </p>
          </div>

          {myAssignedTours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myAssignedTours.map(b => (
                <div key={b.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4 hover:border-slate-200 transition-colors flex flex-col justify-between">
                  <div className="space-y-4.5">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={b.packageImage}
                          alt={b.packageName}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <h3 className="text-xs font-black text-slate-850 leading-snug">{b.packageName}</h3>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">ID: {b.id}</p>
                        </div>
                      </div>
                      <span className={`text-[8.5px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full border shrink-0 ${
                        b.bookingStatus === 'COMPLETED' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                        b.bookingStatus === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                        (b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'ONGOING') ? 'bg-violet-50 text-violet-700 border-violet-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {b.bookingStatus} (Tour: {b.tourStatus || 'UPCOMING'})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-2.5 text-[10px] font-bold text-slate-600 bg-slate-50 rounded-2xl p-3">
                      <div>
                        <span className="text-[8px] uppercase text-slate-400 block tracking-wider">Tourist</span>
                        <span className="text-slate-700 font-extrabold">{b.customerName}</span>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase text-slate-400 block tracking-wider">Departure Date</span>
                        <span className="text-slate-700 font-extrabold">{b.startDate}</span>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase text-slate-400 block tracking-wider">Travelers</span>
                        <span className="text-slate-700 font-extrabold">{b.guestsCount} Traveler(s)</span>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase text-slate-400 block tracking-wider">Amount Due</span>
                        <span className="text-slate-700 font-extrabold">${b.totalAmount}</span>
                      </div>
                    </div>

                    {b.tourProgress && (
                      <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-xl p-3 text-[10px] text-blue-700 font-semibold leading-relaxed">
                        <span className="font-extrabold text-[9px] uppercase tracking-wider block text-blue-900 mb-0.5">Last Log Update:</span>
                        "{b.tourProgress}"
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-right shrink-0">
                    <button
                      onClick={() => setSearchParams({ id: b.id })}
                      className="bg-primary-blue hover:bg-sky-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer inline-flex items-center space-x-1"
                    >
                      <span>Manage Tour Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs max-w-lg mx-auto space-y-3">
              <ShieldAlert className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-slate-450 font-bold text-sm">No tours currently assigned to your guide profile.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
