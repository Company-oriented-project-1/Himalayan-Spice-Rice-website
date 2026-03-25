"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
// 1. Import the server action
import { registerAction } from "@/lib/actions"; 
import Image from "next/image";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      // 2. Prepare the data as FormData for the server action
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("password", formData.password);

      // 3. Call the Server Action instead of a direct fetch
      const result = await registerAction(data);

      // Based on your example API response: { "message": "Success!..." }
      if (result && result.message && result.message.toLowerCase().includes("success")) {
        setStatus({ 
          type: "success", 
          message: result.message 
        });
        setFormData({ name: "", email: "", password: "" });
      } else {
        setStatus({ 
          type: "error", 
          message: result.message || "Registration failed." 
        });
      }
    } catch (err) {
      setStatus({ 
        type: "error", 
        message: "An unexpected error occurred. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-6 lg:px-8">
      <div className="flex justify-center">
        <Image
          src="/logo.png"
          alt="Himalayan Spice Rice"
          width={200}
          height={120}
        />
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-xl font-extrabold text-gray-900">Create your account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10 border border-gray-100">
          {status.type === "success" ? (
            <div className="space-y-4 text-center">
              <div className="p-3 rounded text-sm bg-green-50 text-green-700 border border-green-200">
                {status.message}
              </div>
              <Link href="/login" className="text-sm font-medium hover:text-orange-500">
                Continue to Sign in
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                {status.message && (
                  <div className="p-3 rounded text-sm bg-red-50 text-red-700 border border-red-200">
                    {status.message}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Register"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="text-sm font-medium hover:text-orange-500">
                  Already have an account? Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}