"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { useAuthStore, useUserBundle } from "@/lib/store";
import { average, normalizeFocusStatus } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";
import { GrowthChart } from "@/components/charts/growth-chart";
import { insightPrompts, welcomeMessages } from "@/lib/constants";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const bundle = useUserBundle(user?.id);
  const entries = bundle?.entries ?? [];
  const reflections = bundle?.reflections ?? [];
  const focus = (bundle?.focus ?? []).map((item) => ({
    ...item,
    status: normalizeFocusStatus(item.status)
  }));
  const activeFocus = focus.filter((item) => item.status !== "Completed");
  const averageRating = average(entries.map((entry) => entry.rating));

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "Builder"}`}
        description={welcomeMessages[0]}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total entries" value={String(entries.length)} meta="Growth moments captured" />
        <StatCard label="Average rating" value={`${averageRating}/5`} meta="Based on your recent reviews" />
        <StatCard label="Active phases" value={String(activeFocus.length)} meta="Current focus tracks in motion" />
        <StatCard label="Reflections" value={String(reflections.length)} meta="Journal and productivity logs" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <GlassCard className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Growth chart</h2>
            <p className="mt-1 text-sm text-muted">Track how your self-assessment evolves over time.</p>
          </div>
          <GrowthChart entries={entries} />
        </GlassCard>

        <GlassCard className="space-y-4 p-6">
          <div>
            <h2 className="text-xl font-semibold">AI-generated insights</h2>
            <p className="mt-1 text-sm text-muted">Actionable patterns inferred from your activity.</p>
          </div>
          {[...(entries.length ? insightPrompts : insightPrompts.slice(0, 2))].map((insight) => (
            <div key={insight} className="rounded-2xl border p-4 text-sm">
              {insight}
            </div>
          ))}
        </GlassCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <GlassCard className="space-y-4 p-6">
          <div>
            <h2 className="text-xl font-semibold">Recent activities</h2>
            <p className="mt-1 text-sm text-muted">Latest milestones across your personal growth timeline.</p>
          </div>
          <div className="space-y-3">
            {entries.slice(0, 4).map((entry) => (
              <div key={entry.id} className="rounded-2xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{entry.title}</p>
                  <span className="text-xs text-muted">{entry.category}</span>
                </div>
                <p className="mt-2 text-sm text-muted">{entry.description}</p>
              </div>
            ))}
            {entries.length === 0 ? <p className="text-sm text-muted">No activity yet. Add your first entry.</p> : null}
          </div>
        </GlassCard>

        <GlassCard className="space-y-4 p-6">
          <div>
            <h2 className="text-xl font-semibold">Progress analytics</h2>
            <p className="mt-1 text-sm text-muted">Current focus performance and momentum areas.</p>
          </div>
          <div className="space-y-3">
            {focus.map((item) => (
              <div key={item.id} className="rounded-2xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{item.title}</p>
                  <span className="text-xs text-muted">
                    {item.status} • {item.progress}%
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-[var(--accent-soft)]">
                  <div className="h-2 rounded-full bg-[var(--accent)]" style={{ width: `${item.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </motion.div>
  );
}
