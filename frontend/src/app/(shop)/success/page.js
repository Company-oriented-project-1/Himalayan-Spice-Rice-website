"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { Check, MapPin, CheckCircle2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-in fade-in zoom-in-95 duration-700">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border-4 border-white outline outline-4 outline-green-50">
        <Check size={48} className="text-green-600" />
      </div>
      
      <h1 className="text-4xl sm:text-5xl font-black text-stone-800 mb-6">Request Confirmed!</h1>
      <p className="text-lg text-stone-500 mb-10 leading-relaxed max-w-xl mx-auto">
        Your pickup request has been received. We are preparing your fresh authentic groceries. 
      </p>

      <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm max-w-lg mx-auto mb-10 text-left">
        <h3 className="font-bold text-stone-800 mb-4 border-b border-stone-100 pb-2">Next Steps:</h3>
        <ul className="space-y-4">
          <li className="flex gap-3 text-stone-600">
            <MapPin className="text-red-800 flex-shrink-0" size={20} />
            <span>Visit our store at <strong>123 Spice Market Ave</strong> during your selected pickup time.</span>
          </li>
          <li className="flex gap-3 text-stone-600">
            <CheckCircle2 className="text-red-800 flex-shrink-0" size={20} />
            <span>Provide your Name or Order Number at the front counter.</span>
          </li>
          <li className="flex gap-3 text-stone-600">
            <ShoppingCart className="text-red-800 flex-shrink-0" size={20} />
            <span>Complete your payment via Cash, Card, or Apple Pay and enjoy your fresh ingredients!</span>
          </li>
        </ul>
      </div>

      <Button size="lg" onClick={() => router.push('/')}>
        Return to Home Page
      </Button>
    </div>
  );
}