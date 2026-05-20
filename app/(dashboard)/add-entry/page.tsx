"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { categoryOptions } from "@/lib/constants";
import { useAuthStore, useDataStore } from "@/lib/store";
import { EntryCategory } from "@/lib/types";
import { getEntryUploadAccept, isValidEntryUpload, parseTagInput } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/forms/field";

export default function AddEntryPage() {
  const user = useAuthStore((state) => state.user);
  const addEntry = useDataStore((state) => state.addEntry);
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

  const uploadHint = useMemo(() => {
    if (form.category === "Project") return "Upload a ZIP file with source code or project assets.";
    if (form.category === "Skill" || form.category === "Achievement" || form.category === "Certification") {
      return "Upload a certificate as PDF or image.";
    }
    return "Optional supporting file.";
  }, [form.category]);

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

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Capture"
        title="Add a growth entry"
        description="Document skills, projects, achievements, certifications, and reflections with context and supporting files."
      />
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
              <Textarea required value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
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
                className="h-auto min-h-[56px] py-3 leading-normal file:mr-3 file:rounded-full file:border-0 file:bg-[var(--accent-soft)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--foreground)]"
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
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit">Save entry</Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
