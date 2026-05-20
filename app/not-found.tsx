import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <GlassCard className="max-w-md space-y-4 p-8 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-muted">404</p>
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="text-sm text-muted">The route does not exist or your session has moved elsewhere.</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2 text-sm text-[var(--accent-foreground)]"
        >
          Back to dashboard
        </Link>
      </GlassCard>
    </main>
  );
}
