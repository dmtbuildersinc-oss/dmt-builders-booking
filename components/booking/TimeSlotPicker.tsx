"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

type TimeSlot = { time: string; label: string; available: boolean };

export function TimeSlotPicker({
  date,
  selectedTime,
  onSelectTime,
}: {
  date: string | null;
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
}) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear stale slots when the date is deselected
      setSlots([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/availability?date=${date}`)
      .then((res) => res.json())
      .then((data: { slots: TimeSlot[] }) => {
        if (!cancelled) setSlots(data.slots ?? []);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date]);

  if (!date) {
    return (
      <p className="mt-6 rounded-xl bg-soft-gray/60 px-4 py-6 text-center text-sm text-ink/50">
        Select a date to see available times.
      </p>
    );
  }

  return (
    <div className="mt-6">
      <p className="text-sm font-semibold text-navy">Available Times</p>

      {loading ? (
        <p className="mt-3 text-sm text-ink/40">Loading times…</p>
      ) : slots.length === 0 ? (
        <p className="mt-3 text-sm text-ink/40">
          No times available on this date.
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.time}
              type="button"
              disabled={!slot.available}
              onClick={() => onSelectTime(slot.time)}
              className={[
                "rounded-xl border py-2.5 text-xs font-semibold transition md:text-sm",
                selectedTime === slot.time
                  ? "border-navy bg-navy text-white"
                  : slot.available
                  ? "border-soft-gray text-ink hover:border-gold hover:text-navy"
                  : "cursor-not-allowed border-soft-gray/60 text-ink/25 line-through",
              ].join(" ")}
            >
              {slot.label}
            </button>
          ))}
        </div>
      )}

      <p className="mt-4 flex items-center gap-1.5 text-[11px] text-ink/40">
        <Clock className="h-3 w-3" />
        All times are in Pacific Time (PT)
      </p>
    </div>
  );
}
