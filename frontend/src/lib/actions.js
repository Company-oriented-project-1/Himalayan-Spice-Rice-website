"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

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

async function getAuthenticatedSession() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return { error: "Not authenticated" };
  }

  return { session };
}

function getAuthHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  };
}

async function fetchAdminApi(path, options = {}) {
  const authResult = await getAuthenticatedSession();
  if (authResult.error) {
    return { error: authResult.error };
  }

  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      ...options,
      headers: {
        ...getAuthHeaders(authResult.session.accessToken),
        ...(options.headers || {})
      },
      cache: options.cache || "no-store"
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || "Request failed" };
    }

    return { data };
  } catch (_error) {
    return { error: "Network error" };
  }
}

export async function getAdminDashboardDetailsAction() {
  return fetchAdminApi("/api/admin/dashboard/details", { method: "GET" });
}

export async function getAdminUsersAction({ page = 1, limit = 10, search = "", role = "", isVerified } = {}) {
  const query = new URLSearchParams();
  query.set("page", String(page));
  query.set("limit", String(limit));

  if (search) query.set("search", search);
  if (role) query.set("role", role);
  if (typeof isVerified === "boolean") query.set("isVerified", String(isVerified));

  return fetchAdminApi(`/api/admin/users?${query.toString()}`, { method: "GET" });
}

export async function createAdminUserAction(payload) {
  return fetchAdminApi("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createAdminUserFormAction(_prevState, formData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "CUSTOMER");
  const isVerified = formData.get("isVerified") === "on";

  const submittedValues = {
    name,
    email,
    role,
    isVerified
  };

  if (!name || name.length < 2) {
    return { error: "Name must be at least 2 characters", success: false, values: submittedValues };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { error: "Invalid email format", success: false, values: submittedValues };
  }

  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters", success: false, values: submittedValues };
  }

  if (!["ADMIN", "CUSTOMER"].includes(role)) {
    return { error: "Invalid role provided", success: false, values: submittedValues };
  }

  const result = await createAdminUserAction({
    name,
    email,
    password,
    role,
    isVerified
  });

  if (result.error) {
    return { error: result.error, success: false, values: submittedValues };
  }

  redirect("/admin/users");
}

export async function getAdminUserByIdAction(userId) {
  return fetchAdminApi(`/api/admin/users/${userId}`, { method: "GET" });
}

export async function updateAdminUserAction(userId, payload) {
  return fetchAdminApi(`/api/admin/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function updateAdminUserRoleAction(userId, role) {
  return fetchAdminApi(`/api/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role })
  });
}

export async function setAdminUserVerificationAction(userId, isVerified) {
  return fetchAdminApi(`/api/admin/users/${userId}/verify`, {
    method: "PATCH",
    body: JSON.stringify({ isVerified })
  });
}

export async function deleteAdminUserAction(userId) {
  return fetchAdminApi(`/api/admin/users/${userId}`, {
    method: "DELETE"
  });
}

export async function getAdminUserStatsAction() {
  return fetchAdminApi("/api/admin/users/stats/summary", { method: "GET" });
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



