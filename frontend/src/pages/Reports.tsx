import React from 'react';
import { useTravel } from '../context/TravelContext';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { DollarSign, Download, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { reportsApi } from '../services/api';

export const Reports: React.FC = () => {
  const { bookings } = useTravel();

  // Financial aggregates
  const completedBookings = bookings.filter(b => b.bookingStatus === 'COMPLETED');
  const approvedBookings = bookings.filter(b => 
    ['AWAITING_GUIDE_ASSIGNMENT', 'GUIDE_ASSIGNED', 'GUIDE_ACCEPTED', 'GUIDE_REJECTED', 'CONFIRMED', 'ONGOING'].includes(b.bookingStatus)
  );
  const pendingBookings = bookings.filter(b => b.bookingStatus === 'PENDING');
  const cancelledBookings = bookings.filter(b => b.bookingStatus === 'CANCELLED');

  // Revenue sums
  const approvedRevenue = approvedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const completedRevenue = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const pendingRevenue = pendingBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalFinancialFlow = approvedRevenue + completedRevenue;

  // Average booking value
  const activeBookingsCount = approvedBookings.length + completedBookings.length;
  const averageBookingValue = activeBookingsCount > 0 ? (totalFinancialFlow / activeBookingsCount) : 0;

  // Count packages sold
  const packagesSoldStats: Record<string, number> = {};
  bookings.forEach(b => {
    if (b.bookingStatus !== 'CANCELLED') {
      packagesSoldStats[b.packageName] = (packagesSoldStats[b.packageName] || 0) + b.guestsCount;
    }
  });

  const handleDownloadPdf = async () => {
    try {
      const response = await reportsApi.downloadPdfReport();
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `explore-ceylon-audit-report-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error('Error generating PDF report:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12 print:p-0 print:bg-white print:text-black">
      
      {/* Header and Print Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <SectionHeader
          title="Financial & Analytical Reports"
          subtitle="Generate audit-ready breakdowns of bookings, revenues, categories popularity, and guide ratios."
          badge="Reports Desk"
        />
        <button
          onClick={handleDownloadPdf}
          className="bg-primary-blue hover:bg-sky-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md flex items-center space-x-1.5 shrink-0 w-fit cursor-pointer"
        >
          <Download className="h-4 w-4" />
          <span>Download PDF Report</span>
        </button>
      </div>

      {/* Printable Title Block */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-6 mb-6">
        <h1 className="text-3xl font-black tracking-wide uppercase">Explore Ceylon Travel Portal</h1>
        <p className="text-sm font-bold text-slate-600 mt-1">Official Executive Audit & Performance Report</p>
        <p className="text-xs text-slate-500 mt-0.5">Generated: {new Date().toLocaleDateString()} • System Currency: USD ($)</p>
      </div>

      {/* Reports Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Gross Revenue"
          value={`$${totalFinancialFlow}`}
          icon={DollarSign}
          description="Approved + Completed sum"
          colorClass="text-success-green"
          bgColorClass="bg-emerald-50"
        />
        <StatCard
          title="Avg Booking Value"
          value={`$${averageBookingValue.toFixed(2)}`}
          icon={TrendingUp}
          description="Revenue per active booking"
          colorClass="text-primary-blue"
          bgColorClass="bg-sky-50"
        />
        <StatCard
          title="Gross Bookings Roster"
          value={bookings.length}
          icon={Calendar}
          description={`${pendingBookings.length} pending, ${cancelledBookings.length} cancelled`}
          colorClass="text-warning-orange"
          bgColorClass="bg-orange-50"
        />
      </div>

      {/* Financial Distribution breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Package Inflow Breakdown */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs print:border-none print:shadow-none space-y-4">
          <h3 className="text-base font-extrabold text-deep-navy border-b border-slate-100 pb-2">Tour Package Popularity</h3>
          
          {Object.keys(packagesSoldStats).length > 0 ? (
            <div className="space-y-3 pt-2">
              {Object.entries(packagesSoldStats).map(([pkgName, seats]) => (
                <div key={pkgName} className="flex justify-between items-center text-xs text-slate-700">
                  <span className="font-semibold text-slate-800 truncate max-w-[200px]">{pkgName}</span>
                  <span className="font-extrabold bg-slate-100 px-2 py-0.5 rounded-lg text-slate-600 shrink-0">
                    {seats} seat{seats !== 1 && 's'} booked
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 font-semibold italic py-4 text-center">No seats sold in this billing cycle.</p>
          )}
        </div>

        {/* Accounting Cashflow summary */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs print:border-none print:shadow-none space-y-4">
          <h3 className="text-base font-extrabold text-deep-navy border-b border-slate-100 pb-2">Accounting Balance Sheet</h3>
          <div className="space-y-3 pt-2 text-xs font-semibold">
            <div className="flex justify-between text-slate-600">
              <span>Settled Funds (Completed tours)</span>
              <span className="font-bold text-slate-800">${completedRevenue}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Receivables Funds (Approved tours)</span>
              <span className="font-bold text-slate-800">${approvedRevenue}</span>
            </div>
            <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-2">
              <span>Escrow Funds (Pending bookings)</span>
              <span className="font-bold text-slate-800">${pendingRevenue}</span>
            </div>
            <div className="flex justify-between text-slate-800 text-sm font-black pt-1">
              <span>Active Total Booked Value</span>
              <span className="text-success-green">${totalFinancialFlow}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Print Notice Details */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start space-x-2.5 print:hidden">
        <AlertCircle className="h-5 w-5 text-warning-orange shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-slate-800">Print Formatting Styles Active</h4>
          <p className="text-[10px] text-text-gray font-medium leading-normal mt-0.5">
            Clicking the "Download PDF Report" triggers standard window printing. Sidebars, headers, and UI controls are programmatically removed from print layout to keep audit papers clean.
          </p>
        </div>
      </div>
    </div>
  );
};
