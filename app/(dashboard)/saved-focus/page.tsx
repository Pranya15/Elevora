"use client";

import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { useAuthStore, useUserBundle } from "@/lib/store";
import { normalizeFocusStatus } from "@/lib/utils";

export default function SavedFocusPage() {
  const user = useAuthStore((state) => state.user);
  const bundle = useUserBundle(user?.id);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Saved Plans"
        title="Saved focus blueprints"
        description="Keep reusable learning and career plans ready for iteration when priorities change."
      />
      <div className="grid gap-4 xl:grid-cols-2">
        {(bundle?.savedFocus ?? []).map((item) => (
          <GlassCard key={item.id} className="space-y-4 p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm text-muted">{item.description}</p>
              </div>
              {item.status ? (
                <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs">
                  {normalizeFocusStatus(item.status)}
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {item.milestones.map((milestone) => (
                <span key={milestone} className="rounded-full border px-3 py-1 text-xs">
                  {milestone}
                </span>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
