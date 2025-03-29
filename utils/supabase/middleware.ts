import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // Default profile state
  let profileData = null;
  let profileError = null;

  // Only check for profile if user exists
  if (user) {
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("id", user.id)
      .single();
    
    profileData = data;
    profileError = error;
  }

  // Handle app routes that require authentication
  if (request.nextUrl.pathname.startsWith("/app")) {
    // If no user or error, redirect to sign-in
    if (userError || !user) {
      console.log("No authenticated user, redirecting to sign-in");
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // If user not onboarded and not on onboarding page, redirect to onboarding
    if (
      profileData && 
      !profileData.onboarded &&
      request.nextUrl.pathname !== "/app/onboarding"
    ) {
      console.log("User not onboarded, redirecting to onboarding");
      return NextResponse.redirect(new URL("/app/onboarding", request.url));
    }
  }

  // Redirect from home page to app if user is authenticated and onboarded
  if (
    request.nextUrl.pathname === "/" &&
    user &&
    !userError &&
    profileData?.onboarded
  ) {
    console.log("Authenticated and onboarded user at home, redirecting to app");
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return response;
};