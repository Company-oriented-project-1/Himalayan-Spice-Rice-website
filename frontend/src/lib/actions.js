"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BACKEND_URL = process.env.BACKEND_URL;

export async function registerAction(formData) {
  const data = Object.fromEntries(formData);
  const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function loginAction(email, password) {
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // We handle redirect in the component
    });

    return result;
  } catch (error) {
    return { error: "Authentication failed" };
  }
}

export async function verifyEmailAction(token) {
  const res = await fetch(`${BACKEND_URL}/api/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  return await res.json();
}

export async function forgotPasswordAction(email) {
  const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return await res.json();
}





export async function getProfileAction() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return { error: "Not authenticated" };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/profile`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      cache: 'no-store' // Ensure we get fresh data
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || "Failed to fetch profile" };
    }

    return { data };
  } catch (error) {
    return { error: "Network error" };
  }
}

// Fixed loginAction: Usually signIn is called on the client side, 
// but if you keep it here, ensure it's exported correctly.
// Note: next-auth/react's signIn doesn't work inside "use server".
// Use the client-side handleSubmit logic we created earlier for Login.