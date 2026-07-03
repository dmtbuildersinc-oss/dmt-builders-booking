import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots, isDateBookable } from "@/lib/availability";

export const dynamic = "force-dynamic";

// GET /api/availability?month=YYYY-MM  -> day-level bookability for a month
// GET /api/availability?date=YYYY-MM-DD -> slot-level availability for a day
export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month");
  const date = request.nextUrl.searchParams.get("date");

  if (date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    const slots = await getAvailableSlots(date);
    return NextResponse.json({ date, slots });
  }

  if (month) {
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: "Invalid month" }, { status: 400 });
    }
    const [year, m] = month.split("-").map(Number);
    const daysInMonth = new Date(year, m, 0).getDate();

    const days = await Promise.all(
      Array.from({ length: daysInMonth }, async (_, i) => {
        const day = String(i + 1).padStart(2, "0");
        const dateKey = `${month}-${day}`;
        return { date: dateKey, bookable: await isDateBookable(dateKey) };
      })
    );

    return NextResponse.json({ month, days });
  }

  return NextResponse.json(
    { error: "Provide a `date` or `month` query parameter" },
    { status: 400 }
  );
}
