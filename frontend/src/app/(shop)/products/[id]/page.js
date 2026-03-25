"use client";
import React, { useState, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, Star, Minus, Plus, ShoppingBag, MapPin } from 'lucide-react';
import { CartContext } from '@/context/CartContext';
import { PRODUCTS, CATEGORIES, formatPrice } from '@/lib/data';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useContext(CartContext);
  // ... Paste your ProductDetailView component contents here using params.id
  const ProductDetailView = ({ productId, navigate }) => {
  const { addToCart } = useContext(CartContext);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('desc');

  const product = PRODUCTS.find(p => p.id === productId);
  const category = CATEGORIES.find(c => c.id === product?.categoryId);

  if (!product) return <div className="text-center py-20">Product not found.</div>;

  const handleAddToCart = () => {
    addToCart(product, qty);
    setQty(1); // reset after adding
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back & Breadcrumbs */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('category', product.categoryId)} className="p-2 bg-stone-100 text-stone-600 rounded-full hover:bg-stone-200 hover:text-stone-900 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center text-sm text-stone-500">
          <button onClick={() => navigate('home')} className="hover:text-red-800">Home</button>
          <ChevronRight size={14} className="mx-2" />
          <button onClick={() => navigate('category', product.categoryId)} className="hover:text-red-800">{category?.name}</button>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-stone-800 font-medium truncate max-w-[150px] sm:max-w-none">{product.name}</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left: Image */}
          <div className="bg-stone-50 aspect-square md:aspect-auto md:h-full relative overflow-hidden flex items-center justify-center p-8">
            <img 
              src={product.image} 
              alt={product.name} 
              className="max-w-full max-h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700"
            />
            {product.stock < 10 && (
              <Badge className="absolute top-6 left-6 bg-red-100 text-red-800 border border-red-200 px-3 py-1.5 text-sm">
                Only {product.stock} left in stock
              </Badge>
            )}
          </div>

          {/* Right: Details */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <Badge className="bg-stone-100 text-stone-600">{product.weight}</Badge>
                <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-md text-amber-900 text-sm font-bold">
                  <Star size={16} className="fill-current text-amber-500" />
                  {product.rating}
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-stone-800 mb-4 leading-tight">{product.name}</h1>
              <div className="mb-6 flex items-baseline gap-3">
                <p className="text-4xl font-black text-red-800">{formatPrice(product.discountedPrice || product.price)}</p>
                {product.discountedPrice && (
                  <p className="text-xl font-medium text-stone-400 line-through">{formatPrice(product.price)}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 mb-8 space-y-5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-stone-700">Quantity</span>
                <div className="flex items-center bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 text-stone-500 hover:text-red-800 hover:bg-stone-50 transition-colors" disabled={qty <= 1}><Minus size={18} /></button>
                  <span className="w-12 text-center font-bold text-lg text-stone-800">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="p-3 text-stone-500 hover:text-red-800 hover:bg-stone-50 transition-colors" disabled={qty >= product.stock}><Plus size={18} /></button>
                </div>
              </div>

              <Button size="lg" className="w-full text-lg py-4 shadow-xl shadow-red-800/20" onClick={handleAddToCart}>
                <ShoppingBag size={20} className="mr-2" /> Add to Cart — {formatPrice((product.discountedPrice || product.price) * qty)}
              </Button>

              <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <MapPin size={24} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-900 text-sm">Pickup Request Model</h4>
                  <p className="text-sm text-blue-800/80 mt-1">Add items to cart to reserve them. Payment will be completed securely at our physical store during pickup.</p>
                </div>
              </div>
            </div>

            {/* Tabs for Info */}
            <div>
              <div className="flex border-b border-stone-200 mb-4">
                <button 
                  className={`pb-3 px-1 mr-6 font-bold text-sm transition-colors border-b-2 ${activeTab === 'desc' ? 'border-red-800 text-red-800' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
                  onClick={() => setActiveTab('desc')}
                >
                  Description
                </button>
                <button 
                  className={`pb-3 px-1 font-bold text-sm transition-colors border-b-2 ${activeTab === 'details' ? 'border-red-800 text-red-800' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
                  onClick={() => setActiveTab('details')}
                >
                  Details & Specs
                </button>
              </div>
              
              <div className="text-stone-600 text-base leading-relaxed animate-in fade-in duration-300">
                {activeTab === 'desc' ? (
                  <p>{product.description}</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between border-b border-stone-100 pb-2">
                      <span className="font-medium text-stone-500">Weight</span>
                      <span className="font-bold text-stone-800">{product.weight}</span>
                    </li>
                    <li className="flex justify-between border-b border-stone-100 pb-2">
                      <span className="font-medium text-stone-500">Category</span>
                      <span className="font-bold text-stone-800">{category?.name}</span>
                    </li>
                    <li className="flex justify-between border-b border-stone-100 pb-2">
                      <span className="font-medium text-stone-500">SKU</span>
                      <span className="font-bold text-stone-800">HSR-{product.id.toUpperCase()}</span>
                    </li>
                  </ul>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
}