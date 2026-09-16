import { NextResponse } from "next/server";
import { createMiddlewareSupabaseClient } from "./lib/supabaseServerClient";

export async function middleware(request) {
  const response = NextResponse.next();
  const supabase = createMiddlewareSupabaseClient(request, response);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
