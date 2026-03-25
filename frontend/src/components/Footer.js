import React from 'react';
import Link from 'next/link';
import { Leaf, MapPin, Phone, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 py-12 border-t-4 border-red-800">

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Logo + Description */}
        <div>
          <div className="flex items-center mb-4">
            {/* Mountain SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-red-500 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
          <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 17l6-9 4 6 4-5 6 8H3z"
          />
         </svg>
            
            <span className="font-bold text-xl text-white tracking-tight">
              Himalayan<span className="text-red-500">Spice&Rice</span>
            </span>
          </div>
          <p className="mb-6 max-w-sm">
            Bringing the authentic flavors of the Himalayas and Asia straight to your kitchen. Premium quality, fresh ingredients.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">
            Quick Links
          </h4>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:text-amber-400 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/categories/all" className="hover:text-amber-400 transition-colors">
                All Products
              </Link>
            </li>
          </ul>
        </div>

        {/* Location + Opening Hours */}
        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">
            Location
          </h4>
          <ul className="space-y-3">

            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-red-500 mt-0.5" />
              <span>
                Näyttelijäntie 14C, 00400,<br />Helsinki
              </span>
            </li>

            <li className="flex items-start gap-3">
              <Clock size={18} className="text-red-500 mt-0.5" />
              <span>
                Mon - Fri: 11 AM - 10 PM <br />
                Sat - Sun: 12 PM - 10 PM
              </span>
            </li>

          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">
            Contact Us
          </h4>
          <ul className="space-y-3">

            {/* Phone */}
            <li className="flex items-start gap-3">
              <Phone size={18} className="text-red-500 mt-0.5" />
              <span>+358 41 3297997</span>
            </li>

            {/* Email */}
            <li className="flex items-start gap-3">
              <span className="text-red-500">Email:</span>
              <span>business2himalayanspice@gmail.com</span>
           </li>

          </ul>
        </div>

      </div>

      {/* Bottom Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-stone-800 flex justify-center items-center text-sm text-center">
        <p>
          &copy; {new Date().getFullYear()} Himalayan Spice and Rice. All rights reserved.
        </p>
      </div>

    </footer>
  );
}