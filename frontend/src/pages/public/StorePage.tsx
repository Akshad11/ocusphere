import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Calendar, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const StorePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 text-left">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Flagship Atelier & Clinical Studio
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mt-1">
          OcuSphere Bandra West Experience Center
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl">
          Visit our modern optical studio designed with dedicated refraction suites, master lens glazing laboratories, and private eyewear styling bars.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Store Profile Card */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="aspect-16/9 rounded-lg bg-neutral-100 overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=80"
              alt="OcuSphere Bandra Flagship"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-neutral-900/90 text-white text-xs px-2.5 py-1 rounded">
              Flagship Studio
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-neutral-600 shrink-0" />
                <span>Physical Address</span>
              </span>
              <p className="text-neutral-600 pl-5 leading-relaxed">
                Ground Floor, 401 Turner Road<br />
                Opposite Perry Cross Road, Bandra West<br />
                Mumbai, Maharashtra 400050
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-neutral-600 shrink-0" />
                <span>Operating Hours</span>
              </span>
              <div className="text-neutral-600 pl-5 space-y-0.5">
                <p>Mon – Sat: 10:00 AM – 8:30 PM</p>
                <p>Sunday: 11:00 AM – 7:00 PM</p>
                <p className="text-[11px] text-neutral-400">Eye exam appointments available all 7 days</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex flex-wrap gap-3">
            <Link to="/book/appointment">
              <Button size="md" icon={<Calendar className="w-4 h-4" />}>
                Book Free Eye Test Slot
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" size="md">
                Browse Showroom Stock
              </Button>
            </Link>
          </div>
        </div>

        {/* Clinical Services Overview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">In-Store Optometry Capabilities</h3>
            <ul className="space-y-3 text-xs text-neutral-600">
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block">14-Point Computerized Eye Exam:</strong>
                  Detailed visual acuity, slit-lamp anterior segment evaluation, and keratometry.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block">Precision Glazing Lab:</strong>
                  On-site computer-controlled lens edging for single-vision lenses in under 60 minutes.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block">Frame Facial Ergonomics:</strong>
                  Custom pantoscopic tilt adjustments and bridge alignment to eliminate slipping.
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-3 text-xs">
            <h4 className="font-bold text-neutral-900">Concierge Desk</h4>
            <div className="space-y-2 text-neutral-600">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-neutral-500" />
                <span>+91 (022) 2640 8899 / +91 98200 11223</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-neutral-500" />
                <span>concierge@ocusphere.in</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
