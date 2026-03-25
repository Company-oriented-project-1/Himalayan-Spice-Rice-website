"use client";
import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Clock, Calendar, ShieldCheck } from 'lucide-react';
import { CartContext } from '@/context/CartContext';
import { formatPrice } from '@/lib/data';
import { Button } from '@/components/ui/Button';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useContext(CartContext);
  const [scheduleType, setScheduleType] = useState('asap');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    clearCart();
    router.push('/success');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center animate-in fade-in">
        <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={48} className="text-stone-300" />
        </div>
        <h2 className="text-3xl font-bold text-stone-800 mb-4">Your cart is empty</h2>
        <p className="text-stone-500 mb-8 max-w-md mx-auto">You need to add items to your cart before proceeding to pickup request.</p>
        <Button size="lg" onClick={() => navigate('category', 'all')}>Start Shopping</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
      <h1 className="text-3xl font-black text-stone-800 mb-8">Confirm Pickup Request</h1>
      
      <div className="grid lg:grid-cols-3 gap-10">
        {/* Form Column */}
        <div className="lg:col-span-2 space-y-8">
          <form id="pickup-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Info */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-sm">
              <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-red-100 text-red-800 flex items-center justify-center text-sm">1</span>
                Contact Information
              </h2>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-stone-700">First Name <span className="text-red-500">*</span></label>
                  <input required type="text" className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800 transition-all" placeholder="John" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-stone-700">Last Name <span className="text-red-500">*</span></label>
                  <input required type="text" className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800 transition-all" placeholder="Doe" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-stone-700">Email <span className="text-red-500">*</span></label>
                  <input required type="email" className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800 transition-all" placeholder="john@example.com" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-stone-700">Phone Number <span className="text-red-500">*</span></label>
                  <input required type="tel" className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800 transition-all" placeholder="(555) 123-4567" />
                </div>
              </div>
            </div>

            {/* Pickup Schedule */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-sm">
              <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-red-100 text-red-800 flex items-center justify-center text-sm">2</span>
                Pickup Time
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <label className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${scheduleType === 'asap' ? 'border-red-800 bg-red-50/50 text-red-900' : 'border-stone-200 hover:border-red-200 text-stone-600'}`}>
                  <input type="radio" name="schedule" value="asap" checked={scheduleType === 'asap'} onChange={() => setScheduleType('asap')} className="sr-only" />
                  <Clock size={24} className={scheduleType === 'asap' ? 'text-red-800' : 'text-stone-400'} />
                  <span className="font-bold">As Soon As Possible</span>
                  <span className="text-xs opacity-80 text-center">Ready in ~30 minutes</span>
                </label>
                
                <label className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${scheduleType === 'scheduled' ? 'border-red-800 bg-red-50/50 text-red-900' : 'border-stone-200 hover:border-red-200 text-stone-600'}`}>
                  <input type="radio" name="schedule" value="scheduled" checked={scheduleType === 'scheduled'} onChange={() => setScheduleType('scheduled')} className="sr-only" />
                  <Calendar size={24} className={scheduleType === 'scheduled' ? 'text-red-800' : 'text-stone-400'} />
                  <span className="font-bold">Schedule Pickup</span>
                  <span className="text-xs opacity-80 text-center">Choose a later date & time</span>
                </label>
              </div>

              {scheduleType === 'scheduled' && (
                <div className="grid md:grid-cols-2 gap-5 animate-in slide-in-from-top-2 fade-in duration-300">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-stone-700">Select Date <span className="text-red-500">*</span></label>
                    <input required type="date" className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800 transition-all text-stone-700" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-stone-700">Select Time <span className="text-red-500">*</span></label>
                    <input required type="time" className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800 transition-all text-stone-700" />
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-stone-50 p-6 md:p-8 rounded-3xl border border-stone-200 sticky top-28">
            <h3 className="text-xl font-bold text-stone-800 mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="h-16 w-16 bg-white rounded-lg border border-stone-200 overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-bold text-stone-800 leading-tight line-clamp-2 mb-1">{item.name}</p>
                    <p className="text-stone-500">Qty: {item.qty} × {formatPrice(item.discountedPrice || item.price)}</p>
                  </div>
                  <div className="text-right">
                    {item.discountedPrice && (
                      <p className="text-xs text-stone-400 line-through mb-0.5">{formatPrice(item.price * item.qty)}</p>
                    )}
                    <p className="font-bold text-stone-800 text-sm">{formatPrice((item.discountedPrice || item.price) * item.qty)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-stone-200 pt-6 space-y-3">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Taxes (Estimated)</span>
                <span>{formatPrice(cartTotal * 0.08)}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-stone-800 pt-3 border-t border-stone-200">
                <span>Total to Pay at Store</span>
                <span className="text-red-800">{formatPrice(cartTotal * 1.08)}</span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-900 text-sm">
                <ShieldCheck size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p><strong>No payment required now.</strong> You will pay for these items at the store during pickup.</p>
              </div>

              <Button type="submit" form="pickup-form" size="lg" className="w-full py-4 text-lg shadow-xl shadow-red-800/20">
                Confirm Pickup Request
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}