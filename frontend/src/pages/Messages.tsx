import React, { useState, useEffect, useRef } from 'react';
import { useTravel } from '../context/TravelContext';
import { messagesApi } from '../services/api';
import { 
  Send, MessageSquare, ShieldAlert, CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const Messages: React.FC = () => {
  const { currentUser, bookings } = useTravel();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Filter bookings that are eligible for messaging: CONFIRMED + PAID
  const activeChatBookings = bookings.filter(b => {
    const isConfirmed = b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'ONGOING';
    const isPaid = b.paymentStatus === 'PAID';
    
    // Both Customer and Tour Guide need to be assigned/present
    if (currentUser?.role === 'customer') {
      return isConfirmed && isPaid && b.guideId;
    } else if (currentUser?.role === 'guide') {
      return isConfirmed && isPaid && b.customerId;
    }
    return false;
  });

  const selectedBooking = bookings.find(b => b.id === selectedBookingId);

  // Auto-scroll to bottom of chat
  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior });
    }, 50);
  };

  // Fetch messages for a booking
  const fetchMessages = async (bookingId: string, showLoading = false) => {
    if (showLoading) setIsLoadingMessages(true);
    try {
      const res = await messagesApi.getConversation(bookingId);
      setMessages(res.data);
      setErrorMsg('');
    } catch (err: any) {
      console.error('Failed to fetch messages:', err);
      setErrorMsg('Failed to load message history.');
    } finally {
      if (showLoading) setIsLoadingMessages(false);
    }
  };

  // Setup conversation polling and initial load
  useEffect(() => {
    if (!selectedBookingId) {
      setMessages([]);
      return;
    }

    // Initial load
    fetchMessages(selectedBookingId, true);
    scrollToBottom('auto');

    // Poll every 4 seconds for new messages
    pollingRef.current = setInterval(() => {
      fetchMessages(selectedBookingId, false);
    }, 4000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [selectedBookingId]);

  // Scroll to bottom when messages list updates
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom('smooth');
    }
  }, [messages.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId || !inputText.trim() || isSending) return;

    setIsSending(true);
    const textToSend = inputText.trim();
    setInputText('');

    try {
      const response = await messagesApi.sendMessage(selectedBookingId, textToSend);
      // Append new message to UI immediately
      setMessages(prev => [...prev, response.data]);
      scrollToBottom('smooth');
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setErrorMsg('Failed to send message. Please try again.');
      // Restore input text on failure
      setInputText(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  // Helper to format date/time
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  // Get other user's info for rendering
  const getContactInfo = (booking: any) => {
    if (!booking) return { name: 'Contact', role: '', avatar: '' };
    
    if (currentUser?.role === 'customer') {
      return {
        name: booking.guideName || 'Tour Guide',
        role: 'Tour Guide',
        avatar: booking.guideAvatar || ''
      };
    } else {
      return {
        name: booking.customerName || 'Tourist',
        role: 'Customer',
        avatar: '' // Customer default fallback will be used
      };
    }
  };

  const currentContact = selectedBooking ? getContactInfo(selectedBooking) : null;

  return (
    <div className="space-y-6 pb-6">
      {/* Page Header */}
      <div className="space-y-1">
        <span className="bg-[#E0F2FE] text-[#0284C7] text-[10px] font-black tracking-wider px-3 py-1 rounded-full uppercase">
          COMMUNICATION CENTRE
        </span>
        <h1 className="text-2xl font-black text-slate-800">Messages</h1>
        <p className="text-xs text-text-gray font-semibold">
          Chat with your assigned {currentUser?.role === 'customer' ? 'tour guide' : 'tourist'} for paid and confirmed bookings.
        </p>
      </div>

      {/* Main chat workspace */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row h-[600px]">
        
        {/* Left Panel - Conversation list */}
        <div className="w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/50 shrink-0">
          <div className="p-4 border-b border-slate-100 bg-white">
            <h2 className="text-sm font-black text-slate-800">Active Chats</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Confirmed & Paid Trips Only</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {activeChatBookings.length > 0 ? (
              activeChatBookings.map(b => {
                const contact = getContactInfo(b);
                const isActive = b.id === selectedBookingId;
                
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBookingId(b.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center space-x-3 ${
                      isActive 
                        ? 'bg-primary-blue border-primary-blue text-white shadow-sm'
                        : 'bg-white border-slate-100 hover:border-slate-200 text-slate-700'
                    }`}
                  >
                    {/* Contact Avatar */}
                    <div className="relative shrink-0">
                      {contact.avatar ? (
                        <img 
                          src={contact.avatar} 
                          alt={contact.name} 
                          className={`w-11 h-11 rounded-full object-cover border-2 ${isActive ? 'border-white' : 'border-slate-100'}`}
                        />
                      ) : (
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-xs ${
                          isActive ? 'bg-sky-400 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>

                    {/* Booking Details */}
                    <div className="min-w-0 flex-grow">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black truncate block ${isActive ? 'text-white' : 'text-slate-800'}`}>
                          {contact.name}
                        </span>
                        <span className={`text-[8.5px] font-bold uppercase ${isActive ? 'text-sky-200' : 'text-slate-400'}`}>
                          {b.startDate.split('-')[1]}/{b.startDate.split('-')[2]}
                        </span>
                      </div>
                      <span className={`text-[10.5px] font-semibold truncate block mt-0.5 ${isActive ? 'text-white/80' : 'text-text-gray'}`}>
                        {b.packageName}
                      </span>
                      <span className={`text-[8.5px] font-bold block mt-1 uppercase tracking-widest ${isActive ? 'text-sky-200' : 'text-primary-blue'}`}>
                        ID: {b.id.substring(b.id.length - 8)}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-12 px-4 space-y-2 text-slate-400 font-bold whitespace-normal">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-350" />
                <p className="text-xs">No active chats found.</p>
                <p className="text-[10px] text-slate-400 leading-normal font-semibold">
                  Chats appear once bookings are CONFIRMED by Admin, fully PAID, and GUIDES are assigned.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedBooking && currentContact ? (
            <>
              {/* Active Chat Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">
                <div className="flex items-center space-x-3">
                  {currentContact.avatar ? (
                    <img 
                      src={currentContact.avatar} 
                      alt={currentContact.name} 
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-3xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-black text-xs border border-slate-200 shadow-3xs">
                      {currentContact.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xs font-black text-slate-800 leading-none">{currentContact.name}</h3>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold mt-1 block">
                      {currentContact.role} • Package: {selectedBooking.packageName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[9px] uppercase font-black tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center space-x-1">
                    <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                    <span>Active Tour Chat</span>
                  </span>
                </div>
              </div>

              {/* Chat Message History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                {isLoadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-blue" />
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg, index) => {
                    const isSelf = msg.senderId === currentUser?.id;
                    return (
                      <div 
                        key={msg._id || index} 
                        className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs shadow-3xs ${
                          isSelf 
                            ? 'bg-primary-blue text-white rounded-br-none' 
                            : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
                        }`}>
                          <p className="font-semibold leading-relaxed break-words">{msg.message}</p>
                          <span className={`text-[8.5px] font-bold block text-right mt-1 ${
                            isSelf ? 'text-sky-200' : 'text-slate-400'
                          }`}>
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col justify-center items-center h-full text-slate-400 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-300" />
                    <p className="text-xs font-bold">No messages yet.</p>
                    <p className="text-[10px] font-semibold text-slate-400">Send a greeting message to start the conversation.</p>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Error Alert Display */}
              {errorMsg && (
                <div className="px-4 py-2 bg-red-50 text-error-red text-[11px] font-bold flex items-center space-x-2 border-t border-red-100">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Input Form Footer */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type a message here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isSending}
                  className="flex-1 bg-slate-50 border border-slate-200 focus:border-primary-blue focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-700 font-semibold focus:outline-none transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="bg-primary-blue hover:bg-sky-500 text-white rounded-xl p-2.5 transition-all shadow-md disabled:opacity-40 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            /* Selected state fallback empty screen */
            <div className="flex-1 flex flex-col justify-center items-center text-center p-8 bg-slate-50/10 space-y-3">
              <div className="w-16 h-16 bg-sky-50 text-primary-blue border border-sky-100 rounded-2xl flex items-center justify-center shadow-3xs">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-black text-slate-800">Select a Conversation</h3>
              <p className="text-xs text-slate-400 leading-normal max-w-sm font-semibold">
                Please select an active tour conversation from the left side panel to review messaging history and coordinate with your travel partner.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
