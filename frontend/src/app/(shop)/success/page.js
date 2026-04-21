"use client";
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Check, MapPin, CheckCircle2, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/data';

const CHECKOUT_API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const orderNumber = String(searchParams.get('orderNumber') || '').trim();

  const [orderData, setOrderData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadOrderDetails() {
      if (!orderNumber || !session?.accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${CHECKOUT_API_BASE}/api/orders/${encodeURIComponent(orderNumber)}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session.accessToken}`
          }
        });

        if (!response.ok) {
          setOrderData(null);
          return;
        }

        const data = await response.json();
        setOrderData(data);
      } catch (_error) {
        setOrderData(null);
      } finally {
        setLoading(false);
      }
    }

    loadOrderDetails();
  }, [orderNumber, session]);

  const order = orderData?.order;
  const pricing = orderData?.pricing;
  const totalItems = (order?.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const isDelivery = order?.orderType === 'DELIVERY';

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-stone-600">
        <Loader2 size={24} className="mx-auto mb-3 animate-spin" />
        Loading order details...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-in fade-in zoom-in-95 duration-700">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border-4 border-white outline outline-4 outline-green-50">
        <Check size={48} className="text-green-600" />
      </div>
      
      <h1 className="text-4xl sm:text-5xl font-black text-stone-800 mb-4">Order Confirmed!</h1>
      {orderNumber && <p className="text-sm text-stone-500 mb-2">Order Number: <strong>{orderNumber}</strong></p>}
      <p className="text-lg text-stone-500 mb-10 leading-relaxed max-w-xl mx-auto">
        Your order has been received. We are preparing your fresh authentic groceries.
      </p>

      {order ? (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-100 shadow-sm max-w-2xl mx-auto mb-10 text-left">
          <h3 className="font-bold text-stone-800 mb-4 border-b border-stone-100 pb-2">Order Details</h3>

          <div className="space-y-3 text-sm mb-5">
            <p className="text-stone-700"><strong>Type:</strong> {isDelivery ? 'Delivery' : 'Pickup'}</p>
            <p className="text-stone-700"><strong>Items:</strong> {totalItems}</p>
            <p className="text-stone-700"><strong>Subtotal:</strong> {formatPrice(pricing?.subtotal || 0)}</p>
            {isDelivery && <p className="text-stone-700"><strong>Delivery Fee:</strong> {formatPrice(pricing?.deliveryFee || 0)}</p>}
            <p className="text-stone-900 text-base"><strong>Total:</strong> {formatPrice(pricing?.totalAmount || 0)}</p>
          </div>

          <div className="rounded-xl border border-stone-200 p-4 mb-5">
            <p className="text-xs uppercase tracking-wide text-stone-500 mb-1">{isDelivery ? 'Shipping Address' : 'Pickup Details'}</p>
            <p className="text-stone-800">{order.shippingAddress}</p>
          </div>

          {Array.isArray(order.items) && order.items.length > 0 && (
            <div className="rounded-xl border border-stone-200 overflow-hidden mb-5">
              <div className="grid grid-cols-12 bg-stone-50 text-xs font-semibold text-stone-500 uppercase tracking-wide px-4 py-3">
                <div className="col-span-5">Product</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-3 text-right">Subtotal</div>
              </div>
              <div className="divide-y divide-stone-100">
                {order.items.map((item) => {
                  const itemName = item?.product?.name || 'Product';
                  const qty = Number(item?.quantity || 0);
                  const unitPrice = Number(item?.price || 0);
                  const lineTotal = qty * unitPrice;

                  return (
                    <div key={item.id} className="grid grid-cols-12 px-4 py-3 text-sm">
                      <div className="col-span-5 text-stone-800 font-medium pr-2">{itemName}</div>
                      <div className="col-span-2 text-center text-stone-600">{qty}</div>
                      <div className="col-span-3 text-right font-semibold text-stone-900">{formatPrice(lineTotal)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <h4 className="font-semibold text-stone-800 mb-2">Next Steps</h4>
          <ul className="space-y-3">
            <li className="flex gap-3 text-stone-600">
              <MapPin className="text-red-800 flex-shrink-0" size={18} />
              <span>{isDelivery ? 'We will deliver to your provided address.' : 'Please come to the store at your selected pickup time.'}</span>
            </li>
            <li className="flex gap-3 text-stone-600">
              <CheckCircle2 className="text-red-800 flex-shrink-0" size={18} />
              <span>Keep your order number ready for quick verification.</span>
            </li>
            <li className="flex gap-3 text-stone-600">
              <ShoppingCart className="text-red-800 flex-shrink-0" size={18} />
              <span>Enjoy your fresh ingredients. Thank you for ordering with us.</span>
            </li>
          </ul>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm max-w-lg mx-auto mb-10 text-left">
          <h3 className="font-bold text-stone-800 mb-4 border-b border-stone-100 pb-2">Next Steps:</h3>
          <ul className="space-y-4">
            <li className="flex gap-3 text-stone-600">
              <MapPin className="text-red-800 flex-shrink-0" size={20} />
              <span>Keep your order number ready for support and tracking.</span>
            </li>
            <li className="flex gap-3 text-stone-600">
              <CheckCircle2 className="text-red-800 flex-shrink-0" size={20} />
              <span>You will receive order updates via email.</span>
            </li>
            <li className="flex gap-3 text-stone-600">
              <ShoppingCart className="text-red-800 flex-shrink-0" size={20} />
              <span>Thank you for shopping with us.</span>
            </li>
          </ul>
        </div>
      )}

      <Button size="lg" onClick={() => router.push('/')}>
        Return to Home Page
      </Button>
    </div>
  );
}