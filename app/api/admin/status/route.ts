import { NextRequest, NextResponse } from "next/server";
import { getConnectedAccountEmail, isCalendarConnected } from "@/lib/google";

// Fetched client-side from /admin so the Google API call happens outside
// of server-side rendering (avoids a Next.js dev/Turbopack streaming crash
// when an outbound fetch happens mid-render).
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (!key || key !== process.env.ADMIN_ACCESS_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const connected = await isCalendarConnected();
  const email = connected ? await getConnectedAccountEmail() : null;

  return NextResponse.json({ connected, email });
}
