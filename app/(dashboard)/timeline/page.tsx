"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { categoryOptions } from "@/lib/constants";
import { EntryCategory } from "@/lib/types";
import { formatDate, getEntryUploadAccept, isValidEntryUpload, parseTagInput } from "@/lib/utils";
import { useAuthStore, useDataStore, useUserBundle } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/forms/field";

export default function TimelinePage() {
  const user = useAuthStore((state) => state.user);
  const addEntry = useDataStore((state) => state.addEntry);
  const bundle = useUserBundle(user?.id);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [dateOrder, setDateOrder] = useState("latest");
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Skill" as EntryCategory,
    rating: 4,
    tags: "",
    notes: "",
    date: new Date().toISOString().slice(0, 10)
  });

  const items = useMemo(() => {
    const filtered = (bundle?.entries ?? []).filter((entry) => {
      const matchesSearch = [entry.title, entry.description, entry.tags.join(" ")].join(" ").toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || entry.category === category;
      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) =>
      dateOrder === "latest"
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [bundle?.entries, category, dateOrder, search]);

  const uploadHint = useMemo(() => {
    if (form.category === "Project") return "Upload a ZIP file with source code or project assets.";
    if (form.category === "Skill" || form.category === "Achievement" || form.category === "Certification") {
      return "Upload a certificate as PDF or image.";
    }
    return "Optional supporting file.";
  }, [form.category]);

  const resetForm = () => {
    setFile(null);
    setFileInputKey((current) => current + 1);
    setForm({
      title: "",
      description: "",
      category: "Skill",
      rating: 4,
      tags: "",
      notes: "",
      date: new Date().toISOString().slice(0, 10)
    });
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    if (file && !isValidEntryUpload(form.category, file)) {
      toast.error(form.category === "Project" ? "Project uploads must be ZIP files." : "Certificates must be uploaded as a PDF or image.");
      return;
    }

    addEntry(user.id, {
      ...form,
      fileName: file?.name,
      fileType: file?.type,
      tags: parseTagInput(form.tags),
      date: new Date(form.date).toISOString()
    });

    toast.success("Entry added to your timeline.");
    resetForm();
    setShowEntryForm(false);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Timeline"
        title="Your growth journey"
        description="Search, filter, and review the chronology of your skills, projects, achievements, and reflections."
        action={
          <Button type="button" onClick={() => setShowEntryForm((current) => !current)}>
            {showEntryForm ? "Close entry form" : "Add entry"}
          </Button>
        }
      />
      {showEntryForm ? (
        <GlassCard className="p-6">
          <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2">
            <Field label="Title">
              <Input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </Field>
            <Field label="Category">
              <Select
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as EntryCategory }))}
              >
                {categoryOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Description">
                <Textarea
                  required
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                />
              </Field>
            </div>
            <Field label="Rating">
              <Input
                type="number"
                min={1}
                max={5}
                value={form.rating}
                onChange={(event) => setForm((current) => ({ ...current, rating: Number(event.target.value) }))}
              />
            </Field>
            <Field label="Date">
              <Input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
            </Field>
            <Field label="Tags" hint="Comma-separated tags">
              <Input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} />
            </Field>
            <Field label="Upload" hint={uploadHint}>
              <div className="space-y-2">
                <Input
                  key={fileInputKey}
                  type="file"
                  accept={getEntryUploadAccept(form.category)}
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                />
                {file ? <p className="text-sm text-muted">Selected file: {file.name}</p> : null}
              </div>
            </Field>
            <div className="md:col-span-2">
              <Field label="Notes">
                <Textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
              </Field>
            </div>
            <div className="md:col-span-2 flex flex-wrap justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  resetForm();
                  setShowEntryForm(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Save entry</Button>
            </div>
          </form>
        </GlassCard>
      ) : null}
      <GlassCard className="grid gap-3 p-5 md:grid-cols-3">
        <Input placeholder="Search entries" value={search} onChange={(event) => setSearch(event.target.value)} />
        <Select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="All">All categories</option>
          {categoryOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select value={dateOrder} onChange={(event) => setDateOrder(event.target.value)}>
          <option value="latest">Latest first</option>
          <option value="oldest">Oldest first</option>
        </Select>
      </GlassCard>
      <div className="space-y-4">
        {items.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <GlassCard className="grid gap-4 p-5 md:grid-cols-[120px_1fr]">
              <div className="text-sm text-muted">{formatDate(entry.date)}</div>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold">{entry.title}</h2>
                  <span className="rounded-full border px-3 py-1 text-xs">{entry.category}</span>
                  <span className="text-xs text-muted">{entry.rating}/5</span>
                </div>
                <p className="text-sm text-muted">{entry.description}</p>
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
                {entry.fileName ? <p className="text-sm text-muted">Supporting file: {entry.fileName}</p> : null}
              </div>
            </GlassCard>
          </motion.div>
        ))}
        {items.length === 0 ? (
          <GlassCard className="p-6 text-sm text-muted">No timeline items match the current filters.</GlassCard>
        ) : null}
      </div>
    </div>
  );
}
