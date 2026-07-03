import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { storeTokensFromCode } from "@/lib/google";

const STATE_COOKIE = "google_oauth_state";
const KEY_COOKIE = "google_oauth_admin_key";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  const adminKey = cookieStore.get(KEY_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);
  cookieStore.delete(KEY_COOKIE);

  const keyParam = adminKey ? `&key=${encodeURIComponent(adminKey)}` : "";

  if (error) {
    return NextResponse.redirect(
      `${appUrl}/admin?error=${encodeURIComponent(error)}${keyParam}`
    );
  }

  if (!code || !state || state !== expectedState) {
    return NextResponse.redirect(`${appUrl}/admin?error=invalid_state${keyParam}`);
  }

  try {
    await storeTokensFromCode(code);
    return NextResponse.redirect(`${appUrl}/admin?connected=1${keyParam}`);
  } catch (err) {
    console.error("Google OAuth callback failed:", err);
    const message =
      err instanceof Error ? err.message : "unknown_error";
    return NextResponse.redirect(
      `${appUrl}/admin?error=${encodeURIComponent(message)}${keyParam}`
    );
  }
}
