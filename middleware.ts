import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware to check for Typesense connection in cookies and redirect
export function middleware(request: NextRequest) {
  // Check if the cookie for Typesense connection exists
  const typesenseCookie = request.cookies.get("typesenseConnected");

  if (typesenseCookie === "true" && request.nextUrl.pathname === "/") {
    // If the user is connected and trying to access '/', redirect to '/metrics'
    return NextResponse.redirect(new URL("/metrics", request.url));
  }

  // Continue with the request if no redirection is needed
  return NextResponse.next();
}

// Specify the routes where this middleware should apply
export const config = {
  matcher: ["/"], // Apply only to the root route
};
