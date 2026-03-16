import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer'; // You'll extract this from the main file

export const metadata = {
  title: 'Himalayan Spice',
  description: 'Authentic Asian groceries',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
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
      </body>
    </html>
  );
}