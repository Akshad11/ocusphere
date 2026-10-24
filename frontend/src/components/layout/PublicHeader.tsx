import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingBag, Search, Calendar, Menu, X, Shield, MapPin } from 'lucide-react';

interface PublicHeaderProps {
  cartItemCount?: number;
  onOpenCart?: () => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  cartItemCount = 0,
  onOpenCart,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Eyeglasses', path: '/products?type=Eyeglasses' },
    { label: 'Sunglasses', path: '/products?type=Sunglasses' },
    { label: 'Prescription Lenses', path: '/products?type=Prescription lenses' },
    { label: 'Contact Lenses', path: '/products?type=Contact lenses' },
    { label: 'Offers', path: '/offers' },
    { label: 'Our Clinic', path: '/store' },
  ];

  return (
    <>
      {/* Slim Top Bar: Trust markers & Admin shortcut */}
      <div className="bg-neutral-900 text-neutral-300 text-[11px] px-4 sm:px-8 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-neutral-400" />
            <span>Bandra Flagship · 10 AM to 8:30 PM Daily</span>
          </span>
          <span className="hidden md:inline" aria-hidden="true">·</span>
          <span className="hidden md:inline text-neutral-400">
            Free 14-Point Digital Eye Examination With Frame Styling
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="text-neutral-300 hover:text-white flex items-center gap-1 font-medium transition-colors"
          >
            <Shield className="w-3 h-3" />
            <span>Store Admin & POS</span>
          </Link>
        </div>
      </div>

      {/* Main 3-Zone Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <Link to="/" className="flex items-center gap-2 whitespace-nowrap shrink-0 group">
            <div className="w-8 h-8 rounded bg-neutral-900 text-white flex items-center justify-center font-bold text-sm tracking-tighter">
              OS
            </div>
            <span className="text-xl font-bold tracking-tight text-neutral-900">
              OcuSphere
            </span>
          </Link>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-700">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0 ${
                    isActive ? 'text-neutral-950 font-semibold' : ''
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Actions - Search, Book Eye Test, Cart */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/products"
              className="p-2 text-neutral-600 hover:text-neutral-900 rounded-md hover:bg-neutral-100 transition-colors hidden sm:flex"
              title="Search catalogue"
            >
              <Search className="w-4 h-4" />
            </Link>

            <Link
              to="/book/appointment"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Eye Test</span>
            </Link>

            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="relative p-2 text-neutral-700 hover:text-neutral-900 rounded-md hover:bg-neutral-100 transition-colors"
                aria-label="View shopping bag"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-neutral-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-mono">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-700 hover:text-neutral-900 lg:hidden"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100 rounded-md"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-neutral-200 space-y-2">
              <Link
                to="/book/reservation"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 rounded-md text-center"
              >
                Reserve Eyewear for In-Store Pickup
              </Link>
              <Link
                to="/booking/lookup"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-xs font-medium text-neutral-600 text-center"
              >
                Track Booking / Reservation
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
