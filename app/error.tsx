"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="grid min-h-screen place-items-center p-6">
        <GlassCard className="max-w-lg space-y-4 p-8 text-center">
          <p className="text-xs uppercase tracking-[0.38em] text-muted">Application error</p>
          <h1 className="text-3xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted">The page failed safely instead of locking the interface.</p>
          <Button onClick={reset}>Try again</Button>
        </GlassCard>
      </body>
    </html>
  );
}
