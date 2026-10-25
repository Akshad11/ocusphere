import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { ProductGrid } from '../../components/products/ProductGrid';
import { formatINR } from '../../utils/currency';
import { ArrowRight, Calendar, ShieldCheck, Sparkles, CheckCircle2, Eye, Award } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { products } = useProducts({ pageSize: 8 });

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section: Split-screen architectural campaign */}
      <section className="bg-neutral-50/60 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Typography & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <span>Precision Optics</span>
                <span aria-hidden="true">·</span>
                <span>Handcrafted Japanese Beta-Titanium</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight text-balance">
                Clarity Crafted for Modern Eyes.
              </h1>

              <p className="text-neutral-600 text-sm sm:text-base leading-relaxed max-w-xl">
                Experience precision vision care. From clinical 14-point refractive examinations to ultra-light Japanese beta-titanium and Italian Mazzucchelli acetate spectacles.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={() => navigate('/products')}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Explore Optical Collection
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/book/appointment')}
                  icon={<Calendar className="w-4 h-4" />}
                >
                  Book In-Store Eye Test
                </Button>
              </div>

              {/* Trust markers */}
              <div className="pt-6 border-t border-neutral-200 grid grid-cols-3 gap-4 text-xs text-neutral-600">
                <div>
                  <span className="font-bold font-mono text-neutral-900 block text-base tabular-nums">
                    1.9g
                  </span>
                  <span>Ultralight Rimless Frames</span>
                </div>
                <div>
                  <span className="font-bold font-mono text-neutral-900 block text-base tabular-nums">
                    14-Point
                  </span>
                  <span>Optometric Refraction</span>
                </div>
                <div>
                  <span className="font-bold font-mono text-neutral-900 block text-base tabular-nums">
                    3-Day
                  </span>
                  <span>Free In-Store Hold</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Showcase Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="aspect-4/3 rounded-lg bg-neutral-100 overflow-hidden relative mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80"
                    alt="AeroLight Titanium Round"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2.5 left-2.5 bg-neutral-900/90 text-white text-[11px] px-2.5 py-1 rounded">
                    Featured: AeroLight Titanium Round
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-neutral-500">OcuSphere Signature</span>
                    <h3 className="text-sm font-bold text-neutral-900">Japanese Beta-Titanium</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 uppercase font-mono block">Starting at</span>
                    <span className="text-sm font-bold font-mono text-neutral-900 tabular-nums">
                      {formatINR(4999)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <span className="text-neutral-500 font-medium">Free trial fitting in Bandra</span>
                  <Link
                    to="/products/aerolight-titanium-round"
                    className="font-semibold text-neutral-900 hover:underline flex items-center gap-1"
                  >
                    <span>View Specifications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Optical Frames Collection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-neutral-200 pb-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
              Curated Masterpieces
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
              Featured Eyewear & Sunglasses
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-semibold text-neutral-900 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Browse Full Catalogue ({(products || []).length} Models)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ProductGrid
          products={(products || []).slice(0, 8)}
          onQuickReserve={(p) => navigate(`/book/reservation?product=${p.id}`)}
        />
      </section>

      {/* 3. Clinical Eye Care & Optometry Suite */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-900 text-white rounded-xl p-8 lg:p-12 overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4 text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                Advanced In-Store Diagnostic Suite
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Comprehensive 14-Point Digital Eye Examination.
              </h2>
              <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                Conducted by certified optometrists using computerized digital phoropters and corneal topography. We test refractive power, binocular coordination, and ocular fatigue in under 45 minutes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>Digital Phoropter Refraction</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>Astigmatism & Axis Precision</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>Screen Fatigue Blue Light Audit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>Complimentary with Frame Purchase</span>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate('/book/appointment')}
                  icon={<Calendar className="w-4 h-4" />}
                >
                  Schedule Your Clinical Examination
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-neutral-800 border border-neutral-700 rounded-lg p-6 space-y-4">
              <h4 className="text-sm font-semibold text-white">Clinic Hours & Slots Today</h4>
              <div className="space-y-2 text-xs text-neutral-300">
                <div className="flex justify-between py-1 border-b border-neutral-700">
                  <span>Morning Sessions:</span>
                  <span className="font-mono">10:00 AM – 01:00 PM</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-700">
                  <span>Afternoon Sessions:</span>
                  <span className="font-mono">02:00 PM – 05:00 PM</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-700">
                  <span>Executive Evening:</span>
                  <span className="font-mono">05:00 PM – 08:30 PM</span>
                </div>
              </div>
              <p className="text-[11px] text-neutral-400">
                Walk-ins welcomed subject to chair availability. Book online to reserve your optometrist slot.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
