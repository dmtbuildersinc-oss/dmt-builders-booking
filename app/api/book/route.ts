import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import { bookingSchema } from "@/lib/validation";
import {
  formatDateLabel,
  formatSlotLabel,
  getAvailableSlots,
  slotToUtcRange,
} from "@/lib/availability";
import { getCalendarClient, isCalendarConnected } from "@/lib/google";
import { sendClientConfirmationEmail, sendOwnerNotificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid submission", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const input = parsed.data;

  if (!(await isCalendarConnected())) {
    return NextResponse.json(
      {
        error:
          "Booking is temporarily unavailable — the calendar isn't connected yet. Please contact us directly.",
      },
      { status: 503 }
    );
  }

  // Re-check availability server-side to prevent race conditions between
  // two clients booking the same slot at the same time.
  const slots = await getAvailableSlots(input.date);
  const chosen = slots.find((s) => s.time === input.time);
  if (!chosen || !chosen.available) {
    return NextResponse.json(
      { error: "That time was just booked. Please choose another slot." },
      { status: 409 }
    );
  }

  const { start, end } = slotToUtcRange(input.date, input.time);
  const dateLabel = formatDateLabel(input.date);
  const timeLabel = formatSlotLabel(input.time);

  const description = [
    "Client Name:",
    input.name,
    "",
    "Phone:",
    input.phone,
    "",
    "Email:",
    input.email,
    "",
    "Project Address:",
    input.address,
    "",
    "Project Title:",
    input.projectTitle,
  ].join("\n");

  let googleEventId: string | undefined;
  try {
    const calendar = await getCalendarClient();
    const event = await calendar.events.insert({
      calendarId: "primary",
      sendUpdates: "all",
      requestBody: {
        summary: `DMT Consultation – ${input.projectTitle}`,
        description,
        location: input.address,
        start: { dateTime: start.toISOString(), timeZone: siteConfig.booking.timezone },
        end: { dateTime: end.toISOString(), timeZone: siteConfig.booking.timezone },
        attendees: [{ email: input.email, displayName: input.name }],
      },
    });
    googleEventId = event.data.id ?? undefined;
  } catch (err) {
    console.error("Failed to create Google Calendar event:", err);
    return NextResponse.json(
      { error: "We couldn't reach the calendar system. Please try again shortly." },
      { status: 502 }
    );
  }

  try {
    await prisma.booking.create({
      data: {
        name: input.name,
        phone: input.phone,
        email: input.email,
        address: input.address,
        projectTitle: input.projectTitle,
        startTime: start,
        endTime: end,
        dateKey: input.date,
        timeSlot: input.time,
        googleEventId,
      },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "That time was just booked. Please choose another slot." },
        { status: 409 }
      );
    }
    console.error("Failed to save booking:", err);
    return NextResponse.json(
      { error: "Something went wrong saving your booking. Please try again." },
      { status: 500 }
    );
  }

  await Promise.allSettled([
    sendClientConfirmationEmail({ booking: input, dateLabel, timeLabel }),
    sendOwnerNotificationEmail({ booking: input, dateLabel, timeLabel }),
  ]);

  return NextResponse.json({
    success: true,
    clientName: input.name,
    dateLabel,
    timeLabel,
  });
}
