import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/google";

const STATE_COOKIE = "google_oauth_state";
const KEY_COOKIE = "google_oauth_admin_key";

// Starts the OAuth flow that authorizes Michael's Google Calendar.
// Gated by ADMIN_ACCESS_TOKEN so only the owner can trigger it.
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (!key || key !== process.env.ADMIN_ACCESS_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const state = randomUUID();
  const cookieStore = await cookies();
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 10,
    path: "/",
  };
  cookieStore.set(STATE_COOKIE, state, cookieOpts);
  // Round-trips the admin key through the OAuth flow so the callback can
  // redirect back to an authenticated /admin view.
  cookieStore.set(KEY_COOKIE, key, cookieOpts);

  const authUrl = getGoogleAuthUrl(state);
  return NextResponse.redirect(authUrl);
}
