import Image from "next/image";
import { siteConfig } from "@/config/site";

export function Hero() {
  return (
    <section className="relative flex min-h-[46vh] md:min-h-[30vh] w-full items-center justify-center overflow-hidden">
      <Image
        src={siteConfig.images.heroBackground}
        alt="Luxury residential interior"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-navy/75" />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 py-16 pb-24 text-center md:pb-20">
        <div className="animate-fade-in-up">
          <Image
            src={siteConfig.images.logo}
            alt={siteConfig.company.name}
            width={220}
            height={146}
            className="mx-auto h-auto w-[150px] md:w-[190px] brightness-0 invert"
            priority
          />
        </div>

        <h1
          className="animate-fade-in-up mt-8 font-heading text-3xl leading-tight text-white md:text-5xl"
          style={{ animationDelay: "120ms" }}
        >
          Let&rsquo;s Build Something{" "}
          <span className="text-gold">Exceptional</span>
        </h1>

        <p
          className="animate-fade-in-up mt-4 max-w-xl text-sm text-white/80 md:text-base"
          style={{ animationDelay: "240ms" }}
        >
          Schedule your complimentary consultation and let&rsquo;s bring your
          vision to life.
        </p>
      </div>
    </section>
  );
}
