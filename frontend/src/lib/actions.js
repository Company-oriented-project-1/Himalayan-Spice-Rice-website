"use server"

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