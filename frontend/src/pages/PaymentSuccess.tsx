import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import { CheckCircle, AlertCircle, Loader, Download } from 'lucide-react';
import { paymentsApi } from '../services/api';

export const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { confirmPayment } = useTravel();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [downloadError, setDownloadError] = useState<string>('');

  const payment = searchParams.get('payment');
  const bookingId = searchParams.get('bookingId');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (payment === 'success' && bookingId && sessionId) {
        try {
          await confirmPayment(bookingId, sessionId);
          setStatus('success');
        } catch (err) {
          console.error('Payment confirmation failed', err);
          setStatus('error');
        }
      } else {
        setStatus('error');
      }
    };

    verifyPayment();
  }, [payment, bookingId, sessionId, confirmPayment]);

  const handleDownloadReceipt = async () => {
    if (!bookingId) return;
    try {
      const response = await paymentsApi.downloadReceiptPdf(bookingId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt_${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF receipt:', err);
      setDownloadError('Failed to download PDF receipt. Please check booking status in bookings timeline.');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center space-y-8">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader className="w-16 h-16 text-primary-blue animate-spin mb-4" />
            <h2 className="text-2xl font-extrabold text-deep-navy">Verifying Payment...</h2>
            <p className="text-slate-500 mt-2">Please do not close this window.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-deep-navy mb-2">Payment Successful!</h2>
            <p className="text-slate-600 font-semibold mb-6">Your booking has been confirmed.</p>
            
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 w-full mb-4">
              <p className="text-sm text-slate-500 font-bold mb-1">Booking Reference</p>
              <p className="text-lg font-black text-primary-blue tracking-wider">{bookingId}</p>
            </div>

            {downloadError && (
              <div className="bg-red-50 border border-red-150 rounded-xl p-3.5 flex items-start space-x-2 text-xs font-semibold text-error-red mb-4 text-left">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{downloadError}</span>
              </div>
            )}

            <button
              onClick={handleDownloadReceipt}
              className="w-full mb-6 border border-slate-200 hover:border-primary-blue hover:text-primary-blue text-slate-600 font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Download Receipt (PDF)</span>
            </button>

            <div className="flex flex-col space-y-3 w-full">
              <Link 
                to="/customer/bookings"
                className="w-full bg-primary-blue hover:bg-sky-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md"
              >
                View My Bookings
              </Link>
              <Link 
                to="/"
                className="w-full bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 font-bold py-3.5 px-4 rounded-xl transition-all"
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-deep-navy mb-2">Payment Failed</h2>
            <p className="text-slate-600 font-semibold mb-8">We could not verify your payment. Please try again or contact support.</p>
            
            <Link 
              to="/customer/bookings"
              className="w-full bg-deep-navy hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md"
            >
              Return to Bookings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
