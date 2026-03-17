import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import AuthProvider from "@/components/AuthProvider";

export const metadata = {
  title: 'Himalayan Spice',
  description: 'Authentic Afro - Asian groceries',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans selection:bg-red-200 selection:text-red-900 flex flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
              <CartDrawer />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}