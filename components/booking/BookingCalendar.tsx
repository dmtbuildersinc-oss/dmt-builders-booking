"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  startOfMonth,
  subMonths,
} from "date-fns";

const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

type DayStatus = { date: string; bookable: boolean };

export function BookingCalendar({
  selectedDate,
  onSelectDate,
}: {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}) {
  const today = useMemo(() => new Date(), []);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(today));
  const [dayStatus, setDayStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const monthKey = format(viewMonth, "yyyy-MM");
  const isCurrentMonth = isSameDay(startOfMonth(today), viewMonth);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag for an in-flight fetch keyed by month
    setLoading(true);
    fetch(`/api/availability?month=${monthKey}`)
      .then((res) => res.json())
      .then((data: { days: DayStatus[] }) => {
        if (cancelled) return;
        const map: Record<string, boolean> = {};
        for (const d of data.days ?? []) map[d.date] = d.bookable;
        setDayStatus(map);
      })
      .catch(() => {
        if (!cancelled) setDayStatus({});
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [monthKey]);

  const leadingBlanks = getDay(viewMonth);
  const daysInMonth = endOfMonth(viewMonth).getDate();
  const cells = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          disabled={isCurrentMonth}
          onClick={() => setViewMonth((m) => subMonths(m, 1))}
          className="rounded-full p-2 text-navy transition hover:bg-soft-gray disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="font-heading text-base text-navy">
          {format(viewMonth, "MMMM yyyy")}
        </p>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          className="rounded-full p-2 text-navy transition hover:bg-soft-gray"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-[10px] tracking-wide text-ink/40">
            {label}
          </div>
        ))}

        {cells.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} />;

          const dateKey = `${monthKey}-${String(day).padStart(2, "0")}`;
          const bookable = dayStatus[dateKey];
          const isSelected = selectedDate === dateKey;

          return (
            <button
              key={dateKey}
              type="button"
              disabled={!bookable || loading}
              onClick={() => onSelectDate(dateKey)}
              className={[
                "mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition",
                isSelected
                  ? "bg-navy text-white"
                  : bookable
                  ? "text-ink hover:bg-gold/20 hover:text-navy"
                  : "cursor-not-allowed text-ink/25 line-through",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
