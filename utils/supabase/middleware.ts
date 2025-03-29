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

  const user = await supabase.auth.getUser();

  const profile = await supabase
    .from("users")
    .select()
    .eq("id", user.data.user?.id)
    .single();

  if (request.nextUrl.pathname.startsWith("/app")) {
    if (user.error) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    if (
      !profile.data?.onboarded &&
      request.nextUrl.pathname !== "/onboarding"
    ) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  if (
    request.nextUrl.pathname === "/" &&
    !user.error &&
    profile.data?.onboarded
  ) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return response;
};
