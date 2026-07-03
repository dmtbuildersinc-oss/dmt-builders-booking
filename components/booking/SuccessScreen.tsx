import { CheckCircle2 } from "lucide-react";
import { siteConfig } from "@/config/site";

export function SuccessScreen({
  clientName,
  dateLabel,
  timeLabel,
}: {
  clientName: string;
  dateLabel: string;
  timeLabel: string;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center md:py-20">
      <CheckCircle2 className="h-12 w-12 text-gold" strokeWidth={1.5} />
      <h2 className="mt-6 font-heading text-2xl text-navy md:text-3xl">
        Consultation Scheduled
      </h2>
      <p className="mt-4 max-w-md text-sm text-ink/70 md:text-base">
        Thank you, {clientName}. Your consultation has been successfully
        scheduled for:
      </p>

      <div className="mt-6 rounded-2xl border border-soft-gray bg-warm-white px-8 py-5">
        <p className="font-heading text-lg text-navy">{dateLabel}</p>
        <p className="mt-1 text-gold font-semibold">{timeLabel} (PT)</p>
      </div>

      <p className="mt-6 max-w-md text-sm text-ink/70">
        A calendar invitation has been sent to your email. We look forward to
        discussing your project.
      </p>

      <div className="mt-8 h-px w-12 bg-gold/50" />
      <p className="mt-6 font-heading text-base text-navy">
        — {siteConfig.company.owner}
      </p>
      <p className="text-sm text-ink/60">{siteConfig.company.name}</p>
      <p className="text-xs text-ink/40">{siteConfig.company.tagline}</p>
    </div>
  );
}
