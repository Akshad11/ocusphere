import React, { useState } from 'react';
import { useOffers } from '../../hooks/useOffers';
import { formatINR } from '../../utils/currency';
import { Tag, TicketPercent, Copy, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OffersPage: React.FC = () => {
  const { offers, coupons } = useOffers({ isActive: true });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-left">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Promotions & Savings
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mt-1">
          Active Optical Offers & Seasonal Vouchers
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl">
          Apply promotional coupon codes at in-store checkout or during your online reservation hold.
        </p>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => {
          const linkedCoupon = coupons.find((c) => c.offerId === offer.id);

          return (
            <div
              key={offer.id}
              className="bg-white border border-neutral-200 rounded-lg p-5 flex flex-col justify-between hover:border-neutral-400 transition-colors"
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-2">
                  <Tag className="w-3.5 h-3.5 text-neutral-700" />
                  <span className="font-semibold text-neutral-800">
                    {offer.discountType === 'Percentage'
                      ? `${offer.discountValue}% OFF`
                      : `${formatINR(offer.discountValue)} INSTANT OFF`}
                  </span>
                  {offer.applicableCategory && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{offer.applicableCategory}</span>
                    </>
                  )}
                </div>

                <h3 className="text-base font-bold text-neutral-900">{offer.name}</h3>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{offer.description}</p>

                <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500 space-y-1">
                  <div>Min purchase: {formatINR(offer.minimumPurchase)}</div>
                  {offer.maximumDiscount && (
                    <div>Max discount: {formatINR(offer.maximumDiscount)}</div>
                  )}
                  <div>Valid through: {offer.endDate}</div>
                </div>
              </div>

              {/* Linked Coupon Box */}
              {linkedCoupon && (
                <div className="mt-5 pt-3 border-t border-neutral-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TicketPercent className="w-4 h-4 text-neutral-700" />
                    <span className="font-mono text-xs font-bold text-neutral-900 tracking-wider">
                      {linkedCoupon.code}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(linkedCoupon.code)}
                    className="flex items-center gap-1 text-xs font-semibold text-neutral-800 hover:text-neutral-950 px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    {copiedCode === linkedCoupon.code ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-neutral-900">Have a customized vision care voucher?</h4>
          <p className="text-xs text-neutral-600 mt-0.5">
            Present your voucher code to our staff at checkout in the Bandra flagship showroom.
          </p>
        </div>
        <Link
          to="/products"
          className="px-4 py-2 text-xs font-bold bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors whitespace-nowrap"
        >
          Browse Qualifying Eyewear
        </Link>
      </div>
    </div>
  );
};
