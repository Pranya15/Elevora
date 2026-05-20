"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore, useDataStore, useUserBundle } from "@/lib/store";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { Field } from "@/components/forms/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default function ReflectionsPage() {
  const user = useAuthStore((state) => state.user);
  const bundle = useUserBundle(user?.id);
  const addReflection = useDataStore((state) => state.addReflection);
  const [form, setForm] = useState({ title: "", content: "", mood: 4, productivity: 4 });

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Reflections"
        title="Daily journal and self-review"
        description="Capture productivity and lessons learned while AI-style insights surface recurring patterns."
      />
      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <GlassCard className="p-6">
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!user) return;
              addReflection(user.id, form);
              toast.success("Reflection saved.");
              setForm({ title: "", content: "", mood: 4, productivity: 4 });
            }}
          >
            <Field label="Title">
              <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </Field>
            <Field label="Reflection">
              <Textarea value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} />
            </Field>
            <Field label="Productivity (1-5)">
              <Input
                type="number"
                min={1}
                max={5}
                value={form.productivity}
                onChange={(event) => setForm((current) => ({ ...current, productivity: Number(event.target.value) }))}
              />
            </Field>
            <Button type="submit">Save reflection</Button>
          </form>
        </GlassCard>
        <GlassCard className="space-y-4 p-6">
          <div>
            <h2 className="text-xl font-semibold">Recent reflections</h2>
            <p className="mt-1 text-sm text-muted">Patterns in productivity and reflection quality are surfaced over time.</p>
          </div>
          {(bundle?.reflections ?? []).map((item) => (
            <div key={item.id} className="rounded-2xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-medium">{item.title}</p>
                <span className="text-xs text-muted">{formatDate(item.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{item.content}</p>
              <div className="mt-3 flex gap-3 text-xs text-muted">
                <span>Productivity {item.productivity}/5</span>
              </div>
            </div>
          ))}
        </GlassCard>
      </section>
    </div>
  );
}
