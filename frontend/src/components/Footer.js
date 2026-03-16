import React from 'react';
import Link from 'next/link';
import { Leaf, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 py-12 border-t-4 border-red-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-red-800 rounded-lg flex items-center justify-center mr-2">
              <Leaf className="text-amber-400" size={18} />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">
              Himalayan<span className="text-red-500">Spice</span>
            </span>
          </div>
          <p className="mb-6 max-w-sm">Bringing the authentic flavors of the Himalayas and Asia straight to your kitchen. Premium quality, fresh ingredients.</p>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:text-amber-400 transition-colors">Home</Link></li>
            <li><Link href="/categories/all" className="hover:text-amber-400 transition-colors">All Products</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Contact Us</h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <span>123 Spice Market Ave,<br/>Flavor Town, FL 32000</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center text-sm">
        <p>&copy; {new Date().getFullYear()} Himalayan Spice and Rice. All rights reserved.</p>
      </div>
    </footer>
  );
}