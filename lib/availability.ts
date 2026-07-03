import { addMinutes, format, isBefore, parse } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { siteConfig } from "@/config/site";
import { prisma } from "@/lib/prisma";
import { getCalendarClient } from "@/lib/google";

const TZ = siteConfig.booking.timezone;

export type TimeSlot = { time: string; label: string; available: boolean };

function parseHHmm(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return { h, m };
}

export function formatSlotLabel(hhmm: string) {
  const { h, m } = parseHHmm(hhmm);
  const period = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

export function formatDateLabel(dateKey: string) {
  const date = parse(dateKey, "yyyy-MM-dd", new Date());
  return format(date, "EEEE, MMMM d, yyyy");
}

/** Candidate slot start times ("HH:mm", Pacific) for a working day, ignoring bookings. */
function candidateSlotTimes(): string[] {
  const { workingHours, meetingDurationMinutes, excludedTimes } =
    siteConfig.booking;
  const times: string[] = [];
  const { h: startH, m: startM } = parseHHmm(workingHours.start);
  const { h: endH, m: endM } = parseHHmm(workingHours.end);

  let cursorMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (cursorMinutes + meetingDurationMinutes <= endMinutes) {
    const h = Math.floor(cursorMinutes / 60);
    const m = cursorMinutes % 60;
    const hhmm = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    if (!(excludedTimes as readonly string[]).includes(hhmm)) times.push(hhmm);
    cursorMinutes += meetingDurationMinutes;
  }
  return times;
}

export function isWorkingDay(date: Date): boolean {
  const day = date.getDay();
  return (siteConfig.booking.workingDays as readonly number[]).includes(day);
}

/** Cheap, DB-only check for whether a calendar day can be selected at all
 * (working day, within the booking window, not fully booked). Does not
 * call the Google API — used to render the calendar grid quickly. */
export async function isDateBookable(dateKey: string): Promise<boolean> {
  const date = parse(dateKey, "yyyy-MM-dd", new Date());
  if (!isWorkingDay(date)) return false;

  const nowInPacific = toZonedTime(new Date(), TZ);
  const todayKey = format(nowInPacific, "yyyy-MM-dd");
  if (dateKey < todayKey) return false;

  const maxDate = new Date(nowInPacific);
  maxDate.setDate(maxDate.getDate() + siteConfig.booking.bookingWindowDays);
  if (dateKey > format(maxDate, "yyyy-MM-dd")) return false;

  const bookingCount = await prisma.booking.count({
    where: { dateKey, status: "confirmed" },
  });
  if (bookingCount >= siteConfig.booking.maxBookingsPerDay) return false;

  return true;
}

export function slotToUtcRange(dateKey: string, hhmm: string) {
  const start = fromZonedTime(`${dateKey}T${hhmm}:00`, TZ);
  const end = addMinutes(start, siteConfig.booking.meetingDurationMinutes);
  return { start, end };
}

async function getGoogleBusyIntervals(dateKey: string) {
  const dayStart = fromZonedTime(`${dateKey}T00:00:00`, TZ);
  const dayEnd = fromZonedTime(`${dateKey}T23:59:59`, TZ);

  try {
    const calendar = await getCalendarClient();
    const res = await calendar.freebusy.query({
      requestBody: {
        timeMin: dayStart.toISOString(),
        timeMax: dayEnd.toISOString(),
        timeZone: TZ,
        items: [{ id: "primary" }],
      },
    });
    const busy = res.data.calendars?.primary?.busy ?? [];
    return busy.map((b) => ({
      start: new Date(b.start ?? dayStart),
      end: new Date(b.end ?? dayStart),
    }));
  } catch (err) {
    console.error("Failed to fetch Google Calendar freebusy:", err);
    // Fail safe: treat the day as having no external conflicts rather than
    // blocking all bookings if Calendar is briefly unreachable.
    return [];
  }
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

/** Full slot-level availability for a single day: candidate times checked
 * against existing DB bookings (+ buffer) and live Google Calendar busy
 * blocks (+ buffer). Only called once, when a client selects a date. */
export async function getAvailableSlots(dateKey: string): Promise<TimeSlot[]> {
  const bookable = await isDateBookable(dateKey);
  if (!bookable) return [];

  const candidates = candidateSlotTimes();
  const bufferMs = siteConfig.booking.bufferMinutesBetweenMeetings * 60 * 1000;

  const [dbBookings, busyIntervals] = await Promise.all([
    prisma.booking.findMany({
      where: { dateKey, status: "confirmed" },
      select: { startTime: true, endTime: true },
    }),
    getGoogleBusyIntervals(dateKey),
  ]);

  const now = new Date();
  const minBookableTime = addMinutes(
    now,
    siteConfig.booking.minNoticeHours * 60
  );

  return candidates.map((hhmm) => {
    const { start, end } = slotToUtcRange(dateKey, hhmm);
    const label = formatSlotLabel(hhmm);

    if (isBefore(start, minBookableTime)) {
      return { time: hhmm, label, available: false };
    }

    const paddedStart = new Date(start.getTime() - bufferMs);
    const paddedEnd = new Date(end.getTime() + bufferMs);

    const conflictsDb = dbBookings.some((b) =>
      overlaps(paddedStart, paddedEnd, b.startTime, b.endTime)
    );
    const conflictsGoogle = busyIntervals.some((b) =>
      overlaps(paddedStart, paddedEnd, b.start, b.end)
    );

    return { time: hhmm, label, available: !conflictsDb && !conflictsGoogle };
  });
}
