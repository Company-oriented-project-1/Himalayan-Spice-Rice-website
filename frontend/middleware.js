// middleware.js
export { default } from "next-auth/middleware";

export const config = { 
  // List all pages that REQUIRE login
  matcher: ["/dashboard/:path*", "/profile/:path*", "/checkout", "/admin/:path*"], 
};