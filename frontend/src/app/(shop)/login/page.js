"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { status: authStatus } = useSession();
  
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  // Automatically redirect if the session context detects the user is logged in
  useEffect(() => {
    if (authStatus === "authenticated") {
      router.push("/");
    }
  }, [authStatus, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      /**
       * signIn('credentials', ...) triggers the authorize() function 
       * in your [...nextauth]/route.js file.
       */
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false, // We handle routing manually for a smoother UX
      });

      if (result?.error) {
        // NextAuth returns the error thrown in your authorize() function here
        setStatus({
          type: "error",
          message: result.error || "Invalid email or password",
        });
      } else {
        setStatus({ type: "success", message: "Login successful! Redirecting..." });
        
        // Use router.push and refresh to ensure Navbar/Layout update immediately
        router.push("/");
        router.refresh(); 
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-6 lg:px-8">
      <div className="flex justify-center mb-6">
        {/* Responsive Logo Container using Parent Width */}
        <div className="relative w-full max-w-[200px] h-[120px]">
          <Image
            src="/logo.png"
            alt="Himalayan Spice Rice"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-black"
              />
            </div>

            {status.message && (
              <div
                className={`p-3 rounded text-sm animate-in fade-in duration-300 ${
                  status.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {status.message}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || authStatus === "loading"}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/register"
              className="text-sm font-medium text-orange-600 hover:text-orange-500 transition-colors"
            >
              Do not have an account? Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}