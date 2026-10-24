import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, MapPin, Phone, Mail, Clock } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-neutral-900 text-neutral-400 border-t border-neutral-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-white text-neutral-900 flex items-center justify-center font-bold text-xs tracking-tighter">
                OS
              </div>
              <span className="text-base font-bold tracking-tight text-white">OcuSphere</span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Curated artisanal spectacles, polarized optics, and clinical optometric services. Handcrafted titanium and bio-acetate eyewear crafted for visual excellence.
            </p>
            <div className="pt-2 text-[11px] text-neutral-500 font-mono">
              Demo Optical Retail Frontend UI
            </div>
          </div>

          {/* Eyewear Collections */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Collections</h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/products?type=Eyeglasses" className="hover:text-white transition-colors">
                  Titanium Eyeglasses
                </Link>
              </li>
              <li>
                <Link to="/products?type=Sunglasses" className="hover:text-white transition-colors">
                  Polarized Sunglasses
                </Link>
              </li>
              <li>
                <Link to="/products?type=Prescription lenses" className="hover:text-white transition-colors">
                  Zeiss & Essilor Lenses
                </Link>
              </li>
              <li>
                <Link to="/products?type=Contact lenses" className="hover:text-white transition-colors">
                  Acuvue & Biofinity Contacts
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-white transition-colors">
                  Active Promotions & Bundles
                </Link>
              </li>
            </ul>
          </div>

          {/* In-Store Clinic & Services */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Clinic & Care</h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/book/appointment" className="hover:text-white transition-colors">
                  Book 14-Point Eye Examination
                </Link>
              </li>
              <li>
                <Link to="/book/reservation" className="hover:text-white transition-colors">
                  Reserve for In-Store Trial
                </Link>
              </li>
              <li>
                <Link to="/booking/lookup" className="hover:text-white transition-colors">
                  Lookup Booking or Order
                </Link>
              </li>
              <li>
                <Link to="/store" className="hover:text-white transition-colors">
                  Flagship Studio Location
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Optical Concierge Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Flagship Store Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Flagship Clinic</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <span>Ground Floor, 401 Turner Road, Bandra West, Mumbai 400050</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
                <span>+91 (022) 2640 8899</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                <span>concierge@ocusphere.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                <span>Mon–Sat: 10:00 AM – 8:30 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div>
            © 2026 OcuSphere Optical Atelier. All mock records and patient prescriptions are fictional demonstration data.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-neutral-300 transition-colors">
              Terms & Pickup Policy
            </Link>
            <Link to="/privacy" className="hover:text-neutral-300 transition-colors">
              Optical Prescription Privacy
            </Link>
            <Link to="/admin" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1 font-semibold">
              <Shield className="w-3 h-3" />
              <span>Admin Console</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
