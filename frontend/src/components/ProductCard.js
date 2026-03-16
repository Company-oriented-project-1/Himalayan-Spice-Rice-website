"use client";
import React, { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Star, ShoppingCart } from 'lucide-react';
import { CartContext } from '@/context/CartContext';
import { formatPrice } from '@/lib/data';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

export default function ProductCard({ product }) {
  const router = useRouter();
  const { addToCart } = useContext(CartContext);
  
  return (
    <div className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl border border-stone-100 overflow-hidden transition-all duration-300 hover:-translate-y-1">
      <div 
        className="relative aspect-square overflow-hidden bg-stone-100 cursor-pointer"
        onClick={() => navigate('product', product.id)}
      >
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
          loading="lazy"
        />
        {product.stock < 10 && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-amber-100 text-amber-800 border border-amber-200 shadow-sm">Low Stock</Badge>
          </div>
        )}
      </div>
      
      <div className="flex flex-col flex-1 p-5">
        <div className="flex justify-between items-start mb-2">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{product.weight}</p>
          <div className="flex items-center gap-1">
            <Star className="text-amber-400 fill-current" size={14} />
            <span className="text-xs font-medium text-stone-600">{product.rating}</span>
          </div>
        </div>
        
        <h3 
          className="text-base font-bold text-stone-800 mb-1 leading-snug cursor-pointer hover:text-red-800 transition-colors line-clamp-2"
          onClick={() => navigate('product', product.id)}
        >
          {product.name.slice(0, 25)}{product.name.length > 25 ? '...' : '' }
        </h3>
        
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div>
            <span className="text-lg font-black text-red-800  mr-2">{formatPrice(product.discountedPrice || product.price)}</span>
            {product.discountedPrice && (
              <span className="text-xs text-stone-400 line-through">{formatPrice(product.price)}</span>
            )}
          </div>
          <Button 
            variant="secondary" 
            size="icon" 
            className="rounded-full shadow-none hover:shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
          >
          <ShoppingCart size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}