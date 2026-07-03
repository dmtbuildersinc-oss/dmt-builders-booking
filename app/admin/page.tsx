import { CheckCircle2, Lock, ShieldAlert } from "lucide-react";
import { siteConfig } from "@/config/site";
import { ConnectionStatus } from "@/components/admin/ConnectionStatus";

export const dynamic = "force-dynamic";

type Search = { key?: string; connected?: string; error?: string };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const authorized =
    Boolean(process.env.ADMIN_ACCESS_TOKEN) &&
    params.key === process.env.ADMIN_ACCESS_TOKEN;

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-navy px-6">
        <div className="max-w-md w-full rounded-3xl bg-warm-white p-10 text-center shadow-2xl">
          <Lock className="mx-auto mb-4 h-8 w-8 text-gold" strokeWidth={1.5} />
          <h1 className="font-heading text-2xl text-navy">Access Restricted</h1>
          <p className="mt-3 text-sm text-ink/70">
            This page requires your admin key. Open it as{" "}
            <code className="rounded bg-soft-gray px-1.5 py-0.5">
              /admin?key=YOUR_ADMIN_ACCESS_TOKEN
            </code>{" "}
            using the value of <code>ADMIN_ACCESS_TOKEN</code> from your
            environment variables.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy px-6 py-16">
      <div className="max-w-lg w-full rounded-3xl bg-warm-white p-10 shadow-2xl">
        <p className="text-xs tracking-[0.25em] text-gold uppercase">
          {siteConfig.company.name}
        </p>
        <h1 className="mt-2 font-heading text-3xl text-navy">
          Admin — Calendar Connection
        </h1>
        <div className="mt-2 h-px w-16 bg-gold" />

        {params.error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Connection failed: {params.error}</span>
          </div>
        )}

        {params.connected && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Google Calendar connected successfully.</span>
          </div>
        )}

        <ConnectionStatus adminKey={params.key ?? ""} />

        <p className="mt-6 text-xs leading-relaxed text-ink/50">
          This authorizes DMT Builders to read your Calendar&apos;s
          availability and create consultation events on your behalf. Keep
          this admin link private — anyone with it can reconnect the
          calendar.
        </p>
      </div>
    </main>
  );
}
