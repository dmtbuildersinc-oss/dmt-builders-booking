import { Compass, Hammer, HeartHandshake, Trophy } from "lucide-react";
import { siteConfig } from "@/config/site";

const pillars = [
  { icon: Compass, top: "Design", bottom: "Meets Vision" },
  { icon: Hammer, top: "Quality", bottom: "Meets Craftsmanship" },
  { icon: HeartHandshake, top: "Trust", bottom: "Meets Commitment" },
  { icon: Trophy, top: "Results", bottom: "Exceed Expectations" },
];

export function Footer() {
  return (
    <footer className="mt-16 bg-navy px-6 py-14 text-center md:py-16">
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-y-10 md:grid-cols-4 md:gap-8">
        {pillars.map(({ icon: Icon, top, bottom }) => (
          <div key={top} className="flex flex-col items-center gap-3">
            <Icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
            <p className="font-heading text-sm tracking-wide text-white">
              {top}
            </p>
            <p className="text-xs text-white/60">{bottom}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-14 h-px w-16 bg-gold/40" />

      <p className="mt-8 font-heading text-lg tracking-wide text-white">
        {siteConfig.company.name}
      </p>
      <p className="mt-1 text-xs text-white/50">{siteConfig.company.tagline}</p>
    </footer>
  );
}
