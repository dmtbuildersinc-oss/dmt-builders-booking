"use client";

import type { LucideIcon } from "lucide-react";

export function FormField({
  label,
  icon: Icon,
  error,
  ...inputProps
}: {
  label: string;
  icon: LucideIcon;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-navy">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />
        <input
          {...inputProps}
          className={[
            "w-full rounded-xl border bg-white py-3.5 pl-11 pr-4 text-sm text-ink placeholder:text-ink/35",
            "transition focus:outline-none focus:ring-2 focus:ring-gold/50",
            error ? "border-red-300" : "border-soft-gray focus:border-gold",
          ].join(" ")}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
