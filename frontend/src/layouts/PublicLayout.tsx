import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { PublicHeader } from '../components/layout/PublicHeader';
import { PublicFooter } from '../components/layout/PublicFooter';
import { Drawer } from '../components/common/Drawer';
import { formatINR } from '../utils/currency';
import { Trash2, Calendar, ShoppingBag } from 'lucide-react';
import { Button } from '../components/common/Button';

export interface PublicCartItem {
  productId: string;
  variantId: string;
  name: string;
  brand: string;
  colorName: string;
  size: string;
  price: number;
  quantity: number;
  image?: string;
}

export const PublicLayout: React.FC = () => {
  const navigate = useNavigate();
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState<PublicCartItem[]>([
    {
      productId: 'prod-001',
      variantId: 'var-001-1',
      name: 'AeroLight Titanium Round',
      brand: 'OcuSphere Signature',
      colorName: 'Matte Onyx Black',
      size: 'Medium (50-19-145)',
      price: 4999,
      quantity: 1,
    },
  ]);

  const totalCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const handleUpdateQty = (variantId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.variantId === variantId) {
            const next = item.quantity + delta;
            return next > 0 ? { ...item, quantity: next } : null;
          }
          return item;
        })
        .filter(Boolean) as PublicCartItem[]
    );
  };

  const handleRemove = (variantId: string) => {
    setCartItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-neutral-900 selection:text-white">
      <PublicHeader cartItemCount={totalCount} onOpenCart={() => setCartDrawerOpen(true)} />

      <main className="flex-1">
        <Outlet context={{ cartItems, setCartItems, onOpenCart: () => setCartDrawerOpen(true) }} />
      </main>

      <PublicFooter />

      {/* Cart & In-Store Hold Drawer */}
      <Drawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        title="Your Eyewear Selection"
        subtitle={`${totalCount} ${totalCount === 1 ? 'item' : 'items'} in bag`}
        footer={
          cartItems.length > 0 && (
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-xs pb-1">
                <span className="text-neutral-500">Estimated Total</span>
                <span className="font-bold text-sm font-mono tabular-nums text-neutral-900">
                  {formatINR(subtotal)}
                </span>
              </div>
              <Button
                size="md"
                className="w-full"
                onClick={() => {
                  setCartDrawerOpen(false);
                  navigate('/book/reservation');
                }}
              >
                Reserve Selected for In-Store Pickup
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setCartDrawerOpen(false);
                  navigate('/book/appointment');
                }}
                icon={<Calendar className="w-3.5 h-3.5" />}
              >
                Book Accompanying Eye Test
              </Button>
            </div>
          )
        }
      >
        {cartItems.length === 0 ? (
          <div className="py-16 text-center text-neutral-400">
            <ShoppingBag className="w-10 h-10 mx-auto stroke-1 mb-2 text-neutral-300" />
            <p className="text-sm font-medium text-neutral-800">Your bag is empty</p>
            <p className="text-xs text-neutral-500 mt-1">Explore our latest handcrafted titanium frames.</p>
          </div>
        ) : (
          <div className="space-y-3 divide-y divide-neutral-100">
            {cartItems.map((item) => (
              <div key={item.variantId} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                    {item.brand}
                  </span>
                  <h4 className="text-xs font-semibold text-neutral-900">{item.name}</h4>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    {item.colorName} · {item.size}
                  </div>
                  <div className="text-xs font-mono font-bold text-neutral-900 mt-1">
                    {formatINR(item.price)}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center border border-neutral-200 rounded text-xs">
                    <button
                      onClick={() => handleUpdateQty(item.variantId, -1)}
                      className="px-1.5 py-0.5 hover:bg-neutral-100 text-neutral-600"
                    >
                      -
                    </button>
                    <span className="px-2 font-mono tabular-nums font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQty(item.variantId, 1)}
                      className="px-1.5 py-0.5 hover:bg-neutral-100 text-neutral-600"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(item.variantId)}
                    className="text-[11px] text-neutral-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Drawer>
    </div>
  );
};
