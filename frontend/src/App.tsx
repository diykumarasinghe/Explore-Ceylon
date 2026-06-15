import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { TravelProvider } from './context/TravelContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { Home } from './pages/Home';
import { Destinations } from './pages/Destinations';
import { DestinationDetails } from './pages/DestinationDetails';
import { Packages } from './pages/Packages';
import { PackageDetails } from './pages/PackageDetails';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { PaymentSuccess } from './pages/PaymentSuccess';

// Customer Pages
import { CustomerDashboard } from './pages/CustomerDashboard';
import { MyBookings } from './pages/MyBookings';
import { Wishlist } from './pages/Wishlist';
import { Profile } from './pages/Profile';

// Admin Pages
import { AdminDashboard } from './pages/AdminDashboard';
import { ManageDestinations } from './pages/ManageDestinations';
import { ManagePackages } from './pages/ManagePackages';
import { ManageBookings } from './pages/ManageBookings';
import { Reports } from './pages/Reports';

// Guide Pages
import { GuideDashboard } from './pages/GuideDashboard';
import { AssignedTours } from './pages/AssignedTours';
import { Messages } from './pages/Messages';

// Layout wrapper for all public pages
const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-grow w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <TravelProvider>
      <Router>
        <Routes>
          {/* Public Views Navigation Wrapper */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/destinations/:id" element={<DestinationDetails />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/packages/:id" element={<PackageDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
          </Route>

          {/* Secure/Demo Dashboard Side Navigation Wrapper */}
          <Route element={<DashboardLayout />}>
            {/* Customer Panel */}
            <Route path="/customer" element={<CustomerDashboard />} />
            <Route path="/customer/bookings" element={<MyBookings />} />
            <Route path="/customer/messages" element={<Messages />} />
            <Route path="/wishlist" element={<Wishlist />} />
            
            {/* Shared Profile Settings */}
            <Route path="/profile" element={<Profile />} />

            {/* Admin Panel */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/destinations" element={<ManageDestinations />} />
            <Route path="/admin/packages" element={<ManagePackages />} />
            <Route path="/admin/bookings" element={<ManageBookings />} />
            <Route path="/admin/reports" element={<Reports />} />

            {/* Guide Panel */}
            <Route path="/guide" element={<GuideDashboard />} />
            <Route path="/guide/tours" element={<AssignedTours />} />
            <Route path="/guide/messages" element={<Messages />} />
          </Route>
        </Routes>
      </Router>
    </TravelProvider>
  );
}

export default App;

