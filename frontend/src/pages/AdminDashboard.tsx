import React from 'react';
import { Link } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import { StatCard } from '../components/StatCard';
import { SectionHeader } from '../components/SectionHeader';
import { Users, Calendar, DollarSign, Award, ArrowRight, Settings } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { bookings, packages, users } = useTravel();

  // Statistics
  const totalUsers = users.length;
  const totalBookings = bookings.length;
  
  // Calculate total revenue from approved & completed bookings
  const totalRevenue = bookings
    .filter(b => ['CONFIRMED', 'ONGOING', 'COMPLETED'].includes(b.bookingStatus))
    .reduce((sum, b) => sum + b.totalAmount, 0);

  // Simple analytics: count bookings per category for custom bars chart
  const categoryStats = {
    Beach: 0,
    Culture: 0,
    Wildlife: 0,
    'Hill Country': 0,
    Adventure: 0,
    Heritage: 0
  };

  bookings.forEach(b => {
    const pkg = packages.find(p => p.id === b.packageId);
    if (pkg && pkg.category in categoryStats) {
      categoryStats[pkg.category as keyof typeof categoryStats] += b.totalAmount;
    }
  });

  const maxCategoryRevenue = Math.max(...Object.values(categoryStats), 1); // Avoid division by zero

  const recentBookings = bookings.slice(0, 5);

  const getStatusBadgeClass = (b: any) => {
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
        return 'GUIDE ACCEPTED / READY FOR PAYMENT';
      case 'GUIDE_REJECTED':
        return 'GUIDE REJECTED';
      default:
        return b.bookingStatus;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Executive Analytics"
          subtitle="Real-time business performance summaries, travel distribution logs, and bookings control."
          badge="Admin Overview"
        />
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          description="Registered system profiles"
          colorClass="text-primary-blue"
          bgColorClass="bg-sky-50"
        />
        <StatCard
          title="Total Bookings"
          value={totalBookings}
          icon={Calendar}
          description="Pending & completed trips"
          colorClass="text-warning-orange"
          bgColorClass="bg-orange-50"
        />
        <StatCard
          title="Approved Revenue"
          value={`$${totalRevenue}`}
          icon={DollarSign}
          description="Approved / Completed sum"
          colorClass="text-success-green"
          bgColorClass="bg-emerald-50"
        />
        <StatCard
          title="Popular Destination"
          value="Sigiriya Fortress"
          icon={Award}
          description="Most bookings this month"
          colorClass="text-purple-600"
          bgColorClass="bg-purple-50"
        />
      </div>

      {/* Quick Access Action Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/admin/destinations" className="bg-white border border-slate-100 hover:border-primary-blue/30 p-4 rounded-2xl shadow-xs hover:shadow-md text-center transition-all">
          <Settings className="h-5 w-5 text-primary-blue mx-auto mb-2" />
          <span className="text-xs font-bold text-slate-700">Manage Destinations</span>
        </Link>
        <Link to="/admin/packages" className="bg-white border border-slate-100 hover:border-primary-blue/30 p-4 rounded-2xl shadow-xs hover:shadow-md text-center transition-all">
          <Settings className="h-5 w-5 text-aqua-accent mx-auto mb-2" />
          <span className="text-xs font-bold text-slate-700">Manage Packages</span>
        </Link>
        <Link to="/admin/bookings" className="bg-white border border-slate-100 hover:border-primary-blue/30 p-4 rounded-2xl shadow-xs hover:shadow-md text-center transition-all">
          <Calendar className="h-5 w-5 text-warning-orange mx-auto mb-2" />
          <span className="text-xs font-bold text-slate-700">Manage Bookings</span>
        </Link>
        <Link to="/admin/reports" className="bg-white border border-slate-100 hover:border-primary-blue/30 p-4 rounded-2xl shadow-xs hover:shadow-md text-center transition-all">
          <DollarSign className="h-5 w-5 text-success-green mx-auto mb-2" />
          <span className="text-xs font-bold text-slate-700">Financial Reports</span>
        </Link>
      </div>

      {/* Main Panel Content: Chart & Bookings Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Simple Progress Bar Chart */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-deep-navy">Revenue by Travel Style</h3>
            <p className="text-xs text-text-gray font-semibold mt-0.5">Distribution of revenue generated across categories.</p>
          </div>
          <div className="space-y-4">
            {Object.entries(categoryStats).map(([category, revenue]) => {
              const percentage = maxCategoryRevenue > 0 ? (revenue / maxCategoryRevenue) * 100 : 0;
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{category}</span>
                    <span>${revenue}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary-blue h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Bookings Roster */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6 overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-deep-navy">Recent Booking Logs</h3>
              <p className="text-xs text-text-gray font-semibold mt-0.5">Most recent reservations made by travelers.</p>
            </div>
            <Link to="/admin/bookings" className="text-xs font-bold text-primary-blue hover:underline flex items-center space-x-1">
              <span>View Logs</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-700">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 pr-2">Tour Package</th>
                  <th className="pb-3 pr-2">Customer</th>
                  <th className="pb-3 pr-2">Start Date</th>
                  <th className="pb-3 pr-2">Amount</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(b => (
                  <tr key={b.id} className="border-b border-slate-50 last:border-b-0">
                    <td className="py-3.5 pr-2 font-bold text-slate-800 max-w-[150px] truncate">{b.packageName}</td>
                    <td className="py-3.5 pr-2">{b.customerName}</td>
                    <td className="py-3.5 pr-2">{b.startDate}</td>
                    <td className="py-3.5 pr-2 font-bold text-primary-blue">${b.totalAmount}</td>
                    <td className="py-3.5 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-black border ${getStatusBadgeClass(b)}`}>
                        {getStatusLabel(b)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
