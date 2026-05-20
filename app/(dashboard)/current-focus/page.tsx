"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Field } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore, useDataStore, useUserBundle } from "@/lib/store";
import { FocusItem, SavedFocusPlan } from "@/lib/types";
import { formatDate, makeId, normalizeFocusStatus } from "@/lib/utils";

function progressFromStatus(status: FocusItem["status"]) {
  if (status === "Completed") return 100;
  if (status === "In Progress") return 60;
  if (status === "Started") return 25;
  return 0;
}

export default function CurrentFocusPage() {
  const user = useAuthStore((state) => state.user);
  const updateFocus = useDataStore((state) => state.updateFocus);
  const updateSavedFocus = useDataStore((state) => state.updateSavedFocus);
  const bundle = useUserBundle(user?.id);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    summary: "",
    status: "Yet to Start" as FocusItem["status"],
    priority: "Medium" as FocusItem["priority"],
    dueDate: new Date().toISOString().slice(0, 10)
  });

  const focusItems = (bundle?.focus ?? []).map((item) => ({
    ...item,
    status: normalizeFocusStatus(item.status)
  }));
  const savedPlans = bundle?.savedFocus ?? [];

  const syncSavedFocus = (nextFocus: FocusItem[]) => {
    if (!user) return;
    const staticPlans = savedPlans.filter((plan) => !plan.sourceFocusId);
    const mirroredPlans: SavedFocusPlan[] = nextFocus.map((item) => ({
      id: `saved-${item.id}`,
      sourceFocusId: item.id,
      title: item.title,
      description: item.summary,
      milestones: [`${item.priority} priority`, `Progress ${item.progress}%`, `Due ${formatDate(item.dueDate)}`],
      status: item.status
    }));

    updateSavedFocus(user.id, [...mirroredPlans, ...staticPlans]);
  };

  const applyFocus = (nextFocus: FocusItem[]) => {
    if (!user) return;
    updateFocus(user.id, nextFocus);
    syncSavedFocus(nextFocus);
  };

  const activeCount = focusItems.filter((item) => item.status !== "Completed").length;

  const resetForm = () => {
    setForm({
      title: "",
      summary: "",
      status: "Yet to Start",
      priority: "Medium",
      dueDate: new Date().toISOString().slice(0, 10)
    });
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    const nextFocus: FocusItem[] = [
      {
        id: makeId("focus"),
        title: form.title.trim(),
        summary: form.summary.trim(),
        progress: progressFromStatus(form.status),
        priority: form.priority,
        dueDate: new Date(form.dueDate).toISOString(),
        status: form.status
      },
      ...focusItems
    ];

    applyFocus(nextFocus);
    toast.success("Current focus added.");
    resetForm();
    setShowForm(false);
  };

  const updateStatus = (id: string, status: FocusItem["status"]) => {
    const nextFocus = focusItems.map((item) =>
      item.id === id
        ? {
            ...item,
            status,
            progress: progressFromStatus(status)
          }
        : item
    );
    applyFocus(nextFocus);
  };

  const deleteFocus = (id: string) => {
    const nextFocus = focusItems.filter((item) => item.id !== id);
    applyFocus(nextFocus);
    toast.success("Focus removed.");
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Focus"
        title="Current goals and priorities"
        description="Track active learning goals, momentum, and execution priorities with visible progress."
        action={
          <Button type="button" onClick={() => setShowForm((current) => !current)}>
            {showForm ? "Close form" : "Add focus"}
          </Button>
        }
      />
      {showForm ? (
        <GlassCard className="p-6">
          <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2">
            <Field label="Focus title">
              <Input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </Field>
            <Field label="Priority">
              <Select
                value={form.priority}
                onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as FocusItem["priority"] }))}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Summary">
                <Textarea required value={form.summary} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} />
              </Field>
            </div>
            <Field label="Progress">
              <Select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as FocusItem["status"] }))}>
                <option value="Yet to Start">Yet to Start</option>
                <option value="Started">Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </Select>
            </Field>
            <Field label="Due date">
              <Input
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
              />
            </Field>
            <div className="md:col-span-2 flex flex-wrap justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Save focus</Button>
            </div>
          </form>
        </GlassCard>
      ) : null}
      <GlassCard className="flex items-center justify-between gap-3 p-5">
        <div>
          <p className="text-sm font-medium">Focus overview</p>
          <p className="mt-1 text-sm text-muted">{activeCount} open focus item{activeCount === 1 ? "" : "s"} across started and in-progress work.</p>
        </div>
        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs">{focusItems.length} total</span>
      </GlassCard>
      <div className="grid gap-4 xl:grid-cols-2">
        {focusItems.map((item) => (
          <GlassCard key={item.id} className="space-y-4 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <h2 className="text-xl font-semibold">{item.title}</h2>
                <p className="mt-1 text-sm text-muted">{item.summary}</p>
              </div>
              <div className="flex min-w-[220px] flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">Progress Status</span>
                <Select value={item.status} onChange={(event) => updateStatus(item.id, event.target.value as FocusItem["status"])}>
                  <option value="Yet to Start">Yet to Start</option>
                  <option value="Started">Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <span className="rounded-full border px-3 py-1 text-xs">{item.priority}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Progress</span>
                <span>{item.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--accent-soft)]">
                <div className="h-2 rounded-full bg-[var(--accent)]" style={{ width: `${item.progress}%` }} />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm text-muted">
              <span>Due {formatDate(item.dueDate)}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="ghost" onClick={() => deleteFocus(item.id)}>
                Delete
              </Button>
            </div>
          </GlassCard>
        ))}
        {focusItems.length === 0 ? <GlassCard className="p-6 text-sm text-muted">No current focus added yet.</GlassCard> : null}
      </div>
    </div>
  );
}
