import './globals.css';
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
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}