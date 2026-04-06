"use client";
import React, { useMemo, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  ShoppingBag,
  Clock,
  Calendar,
  ShieldCheck,
  Loader2,
  Truck,
  Store
} from 'lucide-react';
import { CartContext } from '@/context/CartContext';
import { formatPrice } from '@/lib/data';
import { Button } from '@/components/ui/Button';

const CHECKOUT_API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const EU_PHONE_REGEX = /^\+?[0-9()\-\s]{8,20}$/;
const FI_POSTAL_CODE_REGEX = /^\d{5}$/;

function sanitizeCheckoutMessage(message) {
  const normalized = String(message || '').trim();

  if (!normalized || normalized === "''" || normalized === '""') {
    return '';
  }

  return normalized
    .replace(/stock/gi, 'availability')
    .replace(/out of availability/gi, 'currently unavailable')
    .replace(/insufficient availability/gi, 'currently unavailable');
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const { cart, cartTotal, clearCart } = useContext(CartContext);
  const [orderType, setOrderType] = useState('PICKUP');
  const [scheduleType, setScheduleType] = useState('asap');
  const [isPricing, setIsPricing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [unavailableProductIds, setUnavailableProductIds] = useState([]);
  const [checkoutSummary, setCheckoutSummary] = useState(null);
  const [customer, setCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    city: '',
    country: 'Finland'
  });
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const checkoutItems = useMemo(
    () =>
      cart
        .map((item) => ({
          productId: String(item.id || '').trim(),
          quantity: Number(item.qty || 0)
        }))
        .filter((item) => item.productId && Number.isInteger(item.quantity) && item.quantity > 0),
    [cart]
  );

  const summaryItems = useMemo(() => {
    if (Array.isArray(checkoutSummary?.items) && checkoutSummary.items.length > 0) {
      return checkoutSummary.items;
    }

    return cart.map((item) => ({
      productId: item.id,
      slug: item.slug,
      image: item.image,
      name: item.name,
      quantity: item.qty,
      unitPrice: Number(item.discountedPrice || item.price || 0),
      lineTotal: Number(item.discountedPrice || item.price || 0) * Number(item.qty || 0)
    }));
  }, [checkoutSummary, cart]);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login?callbackUrl=/checkout');
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (!session?.user) return;

    const fullName = String(session.user.name || '').trim();
    const parts = fullName.split(/\s+/).filter(Boolean);
    const first = parts[0] || '';
    const last = parts.length > 1 ? parts.slice(1).join(' ') : '';

    setCustomer((prev) => ({
      ...prev,
      firstName: prev.firstName || first,
      lastName: prev.lastName || last,
      email: prev.email || String(session.user.email || '').trim()
    }));
  }, [session]);

  useEffect(() => {
    async function loadCheckoutSummary() {
      if (!session?.accessToken || checkoutItems.length === 0) {
        setCheckoutSummary(null);
        return;
      }

      try {
        setIsPricing(true);
        setErrorMessage('');
        setUnavailableProductIds([]);

        const response = await fetch(`${CHECKOUT_API_BASE}/api/orders/checkout-summary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`
          },
          body: JSON.stringify({
            orderType,
            items: checkoutItems
          })
        });

        const data = await response.json();
        if (!response.ok) {
          if (data?.code === 'ITEMS_UNAVAILABLE' && Array.isArray(data?.unavailableItems)) {
            const unavailableIds = data.unavailableItems
              .map((item) => String(item?.productId || '').trim())
              .filter(Boolean);

            setUnavailableProductIds(unavailableIds);
            setErrorMessage('Some items in your cart are unavailable. Remove them to continue checkout.');
            setCheckoutSummary(null);
            return;
          }

          throw new Error(data?.message || 'Failed to calculate checkout summary');
        }

        setCheckoutSummary(data);
        setUnavailableProductIds([]);
      } catch (error) {
        setCheckoutSummary(null);
        const nextMessage = sanitizeCheckoutMessage(error?.message || 'Failed to calculate checkout summary');
        setErrorMessage(nextMessage);
      } finally {
        setIsPricing(false);
      }
    }

    loadCheckoutSummary();
  }, [session, orderType, checkoutItems]);

  const handleCustomerChange = (field) => (event) => {
    const value = event.target.value;
    setCustomer((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!customer.firstName.trim() || !customer.lastName.trim()) {
      return 'First name and last name are required';
    }

    if (!customer.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
      return 'Please enter a valid email address';
    }

    if (!EU_PHONE_REGEX.test(customer.phone.trim())) {
      return 'Please enter a valid Finnish or EU phone number';
    }

    if (orderType === 'DELIVERY') {
      if (!customer.addressLine1.trim()) {
        return 'Street address is required for delivery';
      }

      if (!FI_POSTAL_CODE_REGEX.test(customer.postalCode.trim())) {
        return 'Postal code must be exactly 5 digits';
      }

      if (!customer.city.trim()) {
        return 'City is required for delivery';
      }
    }

    if (orderType === 'PICKUP' && scheduleType === 'scheduled' && (!scheduledDate || !scheduledTime)) {
      return 'Please choose scheduled pickup date and time';
    }

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (!session?.accessToken) {
      setErrorMessage('You need to login before checkout');
      return;
    }

    if (unavailableProductIds.length > 0) {
      setErrorMessage('Some items in your cart are unavailable. Remove them to continue checkout.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const response = await fetch(`${CHECKOUT_API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({
          orderType,
          scheduleType,
          scheduledAt:
            orderType === 'PICKUP' && scheduleType === 'scheduled' && scheduledDate && scheduledTime
              ? `${scheduledDate}T${scheduledTime}`
              : null,
          items: checkoutItems,
          customer
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to create order');
      }

      clearCart();
      router.push(`/success?orderNumber=${encodeURIComponent(data?.order?.orderNumber || '')}`);
    } catch (error) {
      const nextMessage = sanitizeCheckoutMessage(error?.message || 'Failed to create order');
      setErrorMessage(nextMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authStatus === 'loading') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-stone-600">
        <Loader2 className="mx-auto mb-3 animate-spin" size={24} />
        Loading checkout...
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center animate-in fade-in">
        <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={48} className="text-stone-300" />
        </div>
        <h2 className="text-3xl font-bold text-stone-800 mb-4">Your cart is empty</h2>
        <p className="text-stone-500 mb-8 max-w-md mx-auto">You need to add items before proceeding to checkout.</p>
        <Button size="lg" onClick={() => router.push('/products')}>Start Shopping</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <button
          type="button"
          onClick={() => router.push('/cart')}
          className="h-10 w-10 rounded-full border border-stone-200 bg-white text-stone-600 hover:text-stone-900 hover:border-stone-300 transition-colors flex items-center justify-center"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-3xl font-black text-stone-800">Checkout</h1>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{errorMessage}</div>
      )}

      
      <div className="flex justify-center">
        <div className="w-full max-w-4xl space-y-8">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Pickup / Delivery Options */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-sm">
              <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-red-100 text-red-800 flex items-center justify-center text-sm">1</span>
                Pickup / Delivery Options
              </h2>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <label className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${orderType === 'PICKUP' ? 'border-red-800 bg-red-50/50 text-red-900' : 'border-stone-200 hover:border-red-200 text-stone-600'}`}>
                  <input type="radio" name="orderType" value="PICKUP" checked={orderType === 'PICKUP'} onChange={() => setOrderType('PICKUP')} className="sr-only" />
                  <Store size={24} className={orderType === 'PICKUP' ? 'text-red-800' : 'text-stone-400'} />
                  <span className="font-bold">Pickup</span>
                  <span className="text-xs opacity-80 text-center">Collect from store</span>
                </label>

                <label className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${orderType === 'DELIVERY' ? 'border-red-800 bg-red-50/50 text-red-900' : 'border-stone-200 hover:border-red-200 text-stone-600'}`}>
                  <input type="radio" name="orderType" value="DELIVERY" checked={orderType === 'DELIVERY'} onChange={() => setOrderType('DELIVERY')} className="sr-only" />
                  <Truck size={24} className={orderType === 'DELIVERY' ? 'text-red-800' : 'text-stone-400'} />
                  <span className="font-bold">Delivery</span>
                  <span className="text-xs opacity-80 text-center">To Finland address</span>
                </label>
              </div>

              {orderType === 'PICKUP' && (
                <>
                  <h3 className="text-sm font-semibold text-stone-700 mb-3">Pickup Time</h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <label className={`border-2 rounded-xl p-3 cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${scheduleType === 'asap' ? 'border-red-800 bg-red-50/50 text-red-900' : 'border-stone-200 hover:border-red-200 text-stone-600'}`}>
                      <input type="radio" name="schedule" value="asap" checked={scheduleType === 'asap'} onChange={() => setScheduleType('asap')} className="sr-only" />
                      <Clock size={20} className={scheduleType === 'asap' ? 'text-red-800' : 'text-stone-400'} />
                      <span className="font-semibold text-sm">As Soon As Possible</span>
                    </label>

                    <label className={`border-2 rounded-xl p-3 cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${scheduleType === 'scheduled' ? 'border-red-800 bg-red-50/50 text-red-900' : 'border-stone-200 hover:border-red-200 text-stone-600'}`}>
                      <input type="radio" name="schedule" value="scheduled" checked={scheduleType === 'scheduled'} onChange={() => setScheduleType('scheduled')} className="sr-only" />
                      <Calendar size={20} className={scheduleType === 'scheduled' ? 'text-red-800' : 'text-stone-400'} />
                      <span className="font-semibold text-sm">Scheduled Pickup</span>
                    </label>
                  </div>

                  {scheduleType === 'scheduled' && (
                    <div className="grid md:grid-cols-2 gap-5 animate-in slide-in-from-top-2 fade-in duration-300">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-stone-700">Pickup Date <span className="text-red-500">*</span></label>
                        <input value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} type="date" className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800 transition-all text-stone-700" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-stone-700">Pickup Time <span className="text-red-500">*</span></label>
                        <input value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} type="time" className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800 transition-all text-stone-700" />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Customer Info */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-sm">
              <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-red-100 text-red-800 flex items-center justify-center text-sm">2</span>
                Customer Information
              </h2>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-stone-700">First Name <span className="text-red-500">*</span></label>
                  <input required value={customer.firstName} onChange={handleCustomerChange('firstName')} type="text" className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800 transition-all" placeholder="John" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-stone-700">Last Name <span className="text-red-500">*</span></label>
                  <input required value={customer.lastName} onChange={handleCustomerChange('lastName')} type="text" className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800 transition-all" placeholder="Doe" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-stone-700">Email <span className="text-red-500">*</span></label>
                  <input required value={customer.email} onChange={handleCustomerChange('email')} type="email" className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800 transition-all" placeholder="john@example.com" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-stone-700">Phone Number <span className="text-red-500">*</span></label>
                  <input required value={customer.phone} onChange={handleCustomerChange('phone')} type="tel" className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800 transition-all" placeholder="+358 40 123 4567" />
                  <p className="text-xs text-stone-500">Use Finnish or European format.</p>
                </div>
              </div>

              {orderType === 'DELIVERY' && (
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <h3 className="text-sm font-semibold text-stone-700 mb-3">Delivery Address (Finland)</h3>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-sm font-medium text-stone-700">Street Address <span className="text-red-500">*</span></label>
                      <input value={customer.addressLine1} onChange={handleCustomerChange('addressLine1')} type="text" className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800 transition-all" placeholder="Mannerheimintie 10" />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-sm font-medium text-stone-700">Apartment / Stair / Floor</label>
                      <input value={customer.addressLine2} onChange={handleCustomerChange('addressLine2')} type="text" className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800 transition-all" placeholder="A 12" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-stone-700">Postal Code <span className="text-red-500">*</span></label>
                      <input value={customer.postalCode} onChange={handleCustomerChange('postalCode')} inputMode="numeric" maxLength={5} type="text" className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800 transition-all" placeholder="00100" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-stone-700">City <span className="text-red-500">*</span></label>
                      <input value={customer.city} onChange={handleCustomerChange('city')} type="text" className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800 transition-all" placeholder="Helsinki" />
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Confirm Order */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-sm">
              <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-red-100 text-red-800 flex items-center justify-center text-sm">3</span>
                Confirm Order
              </h2>

              <div className="space-y-4">
                <div className="rounded-xl border border-stone-200 p-4 text-sm text-stone-700 space-y-1">
                  <p><strong>Mode:</strong> {orderType === 'PICKUP' ? 'Pickup' : 'Delivery'}</p>
                  {orderType === 'PICKUP' && (
                    <p><strong>Pickup Time:</strong> {scheduleType === 'asap' ? 'As soon as possible' : `${scheduledDate || '-'} ${scheduledTime || ''}`.trim()}</p>
                  )}
                  {orderType === 'DELIVERY' && <p><strong>Delivery:</strong> Standard delivery address in Finland</p>}
                </div>

                <div className="rounded-2xl border border-stone-200 p-4 md:p-5 bg-stone-50/70">
                  <h3 className="text-base md:text-lg font-bold text-stone-900">Your order</h3>

                  <div className="mt-3 rounded-xl border border-stone-200 bg-white overflow-hidden">
                    <div className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-stone-500 bg-stone-50 border-b border-stone-200">
                      <span>Product</span>
                      <span>Subtotal</span>
                    </div>

                    <div className="divide-y divide-stone-100">
                      {summaryItems.map((item) => (
                        <div key={`confirm-item-${item.productId}`} className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2.5 text-sm">
                          <p className="text-stone-800 leading-snug">{item.name} x {item.quantity}</p>
                          <p className="text-stone-900 font-semibold">{formatPrice(item.lineTotal)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between text-stone-700">
                      <span>Subtotal</span>
                      <span className="font-semibold text-stone-900">{formatPrice(checkoutSummary?.pricing?.subtotal ?? cartTotal)}</span>
                    </div>

                    <div className="flex items-start justify-between gap-3 text-stone-700">
                      <span>
                        Shipping
                        <span className="block text-xs text-stone-500">
                          {orderType === 'DELIVERY'
                            ? 'Home Delivery (3-4 business days)'
                            : scheduleType === 'asap'
                              ? 'Pickup (as soon as possible)'
                              : `Scheduled Pickup (${scheduledDate || '-'} ${scheduledTime || ''}`.trim() + ')'}
                        </span>
                      </span>
                      <span className="font-semibold text-stone-900">
                        {orderType === 'DELIVERY'
                          ? formatPrice(checkoutSummary?.pricing?.deliveryFee ?? 0)
                          : formatPrice(0)}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-base font-bold text-stone-900">
                      <span>Total</span>
                      <span className="text-red-800">{formatPrice(checkoutSummary?.pricing?.totalAmount ?? cartTotal)}</span>
                    </div>

                    <p className="text-xs text-stone-500">Total includes VAT (tax already included in product prices).</p>
                  </div>
                </div>

                {orderType === 'DELIVERY' && checkoutSummary?.pricing?.isFreeDelivery && (
                  <div className="rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-sm text-green-800">
                    Free delivery applied.
                  </div>
                )}

                {orderType === 'DELIVERY' && !checkoutSummary?.pricing?.isFreeDelivery && checkoutSummary?.pricing?.minOrderForFreeDelivery > 0 && (
                  <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    Free delivery from {formatPrice(checkoutSummary.pricing.minOrderForFreeDelivery)}.
                  </div>
                )}

                {isPricing && (
                  <div className="flex items-center gap-2 text-sm text-stone-500">
                    <Loader2 size={16} className="animate-spin" />
                    Updating prices from backend...
                  </div>
                )}

                <Button type="submit" form="checkout-form" size="lg" disabled={isSubmitting || isPricing || unavailableProductIds.length > 0} className="w-full py-4 text-lg shadow-xl shadow-red-800/20">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={18} />
                      Confirming Order...
                    </>
                  ) : (
                    'Confirm Order'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}