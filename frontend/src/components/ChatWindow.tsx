import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Phone, Loader, MessageSquare } from 'lucide-react';
import { messagesApi } from '../services/api';

interface Message {
  _id: string;
  bookingId: string;
  customerId: string;
  guideId: string;
  senderId: string;
  senderRole: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface ChatWindowProps {
  bookingId: string;
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientRole: string;
  recipientPhone?: string;
  currentUserId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  bookingId,
  isOpen,
  onClose,
  recipientName,
  recipientRole,
  recipientPhone,
  currentUserId,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await messagesApi.getConversation(bookingId);
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching conversation messages:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Initial load and setup polling
  useEffect(() => {
    if (isOpen && bookingId) {
      fetchMessages(true);

      const interval = setInterval(() => {
        fetchMessages(false);
      }, 10000); // 10 seconds auto-refresh

      return () => clearInterval(interval);
    }
  }, [isOpen, bookingId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await messagesApi.sendMessage(bookingId, newMessage.trim());
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-100 animate-slide-in-right">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary-blue text-white flex items-center justify-center font-black">
              {recipientName.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">{recipientName}</h3>
              <p className="text-[10px] text-slate-400 font-semibold">{recipientRole}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {recipientPhone && (
              <a
                href={`tel:${recipientPhone}`}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-emerald-400 hover:scale-105 transition-all"
                title={`Call ${recipientName}`}
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-2">
              <Loader className="w-8 h-8 text-primary-blue animate-spin" />
              <p className="text-xs text-slate-450 font-semibold">Loading conversation...</p>
            </div>
          ) : messages.length > 0 ? (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div
                  key={msg._id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs leading-relaxed ${
                      isMe
                        ? 'bg-primary-blue text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                    }`}
                  >
                    <p className="break-words font-medium">{msg.message}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1 font-bold">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center text-primary-blue">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-750">Start a Conversation</h4>
                <p className="text-[11px] text-slate-400 font-semibold mt-1 max-w-[200px] mx-auto">
                  Send a message to sync up about meeting locations, departures, or changes.
                </p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-slate-100 bg-white flex items-center space-x-2 shrink-0"
        >
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-primary-blue"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="w-10 h-10 rounded-xl bg-primary-blue hover:bg-sky-500 text-white flex items-center justify-center transition-all shadow-md shrink-0 cursor-pointer disabled:opacity-50"
          >
            {sending ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
