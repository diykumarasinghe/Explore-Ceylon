import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-deep-navy text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-primary-blue hover:text-white transition duration-300">
              <Compass className="h-8 text-aqua-accent" />
              <span>Explore <span className="text-white font-extrabold">Ceylon</span></span>
            </Link>
            <p className="text-sm text-slate-400">
              Discover the golden beaches, misty mountains, lush wildlife, and rich heritage of Sri Lanka, the pearl of the Indian Ocean.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-aqua-accent transition-colors">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.85z"/></svg>
              </a>
              <a href="#" className="hover:text-aqua-accent transition-colors">
                <svg className="h-5 w-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" className="hover:text-aqua-accent transition-colors">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
              </a>
              <a href="#" className="hover:text-aqua-accent transition-colors">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 tracking-wider uppercase text-sm">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-aqua-accent transition-colors">Home Page</Link>
              </li>
              <li>
                <Link to="/destinations" className="hover:text-aqua-accent transition-colors">Our Destinations</Link>
              </li>
              <li>
                <Link to="/packages" className="hover:text-aqua-accent transition-colors">Travel Packages</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-aqua-accent transition-colors">Demo Portals</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 tracking-wider uppercase text-sm">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-aqua-accent shrink-0" />
                <span>Galle Road, Colombo 03, Sri Lanka</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-aqua-accent shrink-0" />
                <span>+94 11 234 5678</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-aqua-accent shrink-0" />
                <span>info@exploreceylon.lk</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-base tracking-wider uppercase text-sm">Newsletter</h3>
            <p className="text-sm text-slate-400">
              Subscribe to get special travel discounts and updates on new packages.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex">
              <input
                type="email"
                placeholder="Enter email"
                className="bg-slate-800 border border-slate-700 text-white text-sm rounded-l-lg px-3 py-2 focus:outline-none focus:border-primary-blue w-full"
              />
              <button
                type="submit"
                className="bg-primary-blue hover:bg-sky-500 text-white font-semibold text-sm rounded-r-lg px-4 transition-colors"
              >
                Join
              </button>
            </form>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p>© {new Date().getFullYear()} Explore Ceylon. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
