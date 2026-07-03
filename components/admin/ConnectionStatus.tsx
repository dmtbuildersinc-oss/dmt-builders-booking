"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

type Status = { connected: boolean; email: string | null } | null;

export function ConnectionStatus({ adminKey }: { adminKey: string }) {
  const [status, setStatus] = useState<Status>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/status?key=${encodeURIComponent(adminKey)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setStatus(data);
      })
      .catch(() => {
        if (!cancelled) setStatus({ connected: false, email: null });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [adminKey]);

  const connectHref = `/api/auth/google?key=${encodeURIComponent(adminKey)}`;

  return (
    <>
      <div className="mt-8 rounded-2xl border border-soft-gray p-6">
        <p className="text-sm font-semibold text-navy">Status</p>
        {loading ? (
          <p className="mt-2 text-sm text-ink/50">Checking connection…</p>
        ) : status?.connected ? (
          <p className="mt-2 flex items-center gap-2 text-sm text-ink/80">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Connected as{" "}
            <span className="font-medium">
              {status.email ?? "unknown account"}
            </span>
          </p>
        ) : (
          <p className="mt-2 text-sm text-ink/60">
            Not connected yet. Connect your Google Calendar so consultations
            can be scheduled automatically.
          </p>
        )}
      </div>

      <a
        href={connectHref}
        className="mt-6 block w-full rounded-full bg-gradient-to-r from-navy to-gold py-4 text-center text-sm font-semibold tracking-wide text-white transition hover:-translate-y-0.5 hover:shadow-lg"
      >
        {status?.connected ? "RECONNECT GOOGLE CALENDAR" : "CONNECT GOOGLE CALENDAR"}
      </a>
    </>
  );
}
