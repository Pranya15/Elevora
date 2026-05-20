"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuthStore, useUserBundle, useDataStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { Field } from "@/components/forms/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const bundle = useUserBundle(user?.id);
  const updateProfile = useDataStore((state) => state.updateProfile);
  const [savedAt, setSavedAt] = useState<string>("");
  const profile = bundle?.profile;

  useEffect(() => {
    if (!user || !profile) return;
    const timeout = setTimeout(() => {
      updateProfile(user.id, profile);
      setSavedAt(new Date().toLocaleTimeString());
    }, 400);

    return () => clearTimeout(timeout);
  }, [profile, updateProfile, user]);

  if (!bundle || !user) return null;

  const updateField = (key: string, value: string) => {
    updateProfile(user.id, { [key]: value });
  };

  const profilePhotoDataUrl = bundle.profile.profilePhotoDataUrl ?? "";
  const profilePhotoName = bundle.profile.profilePhotoName ?? "";

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Profile"
        title="Shape your professional identity"
        description="Your profile updates automatically as you type, and you can still save manually whenever you want."
        action={<p className="text-sm text-muted">{savedAt ? `Auto-saved at ${savedAt}` : "Auto-save ready"}</p>}
      />
      <GlassCard className="p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <div className="rounded-3xl border p-5">
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--background-elevated)] text-sm text-muted">
                  {profilePhotoDataUrl ? (
                    <Image src={profilePhotoDataUrl} alt="Profile preview" width={112} height={112} className="h-full w-full object-cover" />
                  ) : (
                    <span>No photo</span>
                  )}
                </div>
                <div className="flex-1">
                  <Field label="Name">
                    <Input value={bundle.profile.name} onChange={(event) => updateField("name", event.target.value)} />
                  </Field>
                </div>
              </div>
              <div className="mt-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Profile photo">
                    <div className="space-y-3">
                      <label className="relative flex min-h-12 w-full cursor-pointer items-center justify-center rounded-2xl border bg-[var(--background-elevated)] px-4 text-center transition hover:border-[var(--accent)]">
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) {
                              updateProfile(user.id, { profilePhotoName: "", profilePhotoDataUrl: "" });
                              return;
                            }

                            const reader = new FileReader();
                            reader.onload = () => {
                              updateProfile(user.id, {
                                profilePhotoName: file.name,
                                profilePhotoDataUrl: typeof reader.result === "string" ? reader.result : ""
                              });
                              toast.success("Profile photo attached.");
                            };
                            reader.onerror = () => {
                              toast.error("Failed to load profile photo.");
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                        <div className="flex flex-wrap items-center justify-center gap-3">
                          <span className="rounded-xl bg-[var(--accent)]/12 px-3 py-1.5 text-sm font-medium text-[var(--foreground)]">
                            Choose photo
                          </span>
                          <span className="text-sm text-muted">{profilePhotoName || "No file chosen"}</span>
                        </div>
                      </label>
                      {profilePhotoDataUrl ? (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            updateProfile(user.id, { profilePhotoName: "", profilePhotoDataUrl: "" });
                            toast.success("Profile photo removed.");
                          }}
                        >
                          Remove photo
                        </Button>
                      ) : null}
                    </div>
                  </Field>
                  <Field label="Resume upload">
                    <label className="relative flex min-h-12 w-full cursor-pointer items-center justify-center rounded-2xl border bg-[var(--background-elevated)] px-4 text-center transition hover:border-[var(--accent)]">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="sr-only"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          updateField("resumeFileName", file?.name ?? "");
                          toast.success(file ? "Resume attached to your profile." : "Resume cleared.");
                        }}
                      />
                      <div className="flex items-center justify-center gap-3">
                        <span className="rounded-xl bg-[var(--accent)]/12 px-3 py-1.5 text-sm font-medium text-[var(--foreground)]">
                          Choose file
                        </span>
                        <span className="text-sm text-muted">{bundle.profile.resumeFileName || "No file chosen"}</span>
                      </div>
                    </label>
                  </Field>
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <Field label="Bio">
              <Textarea value={bundle.profile.bio} onChange={(event) => updateField("bio", event.target.value)} />
            </Field>
          </div>
          <Field label="Skills">
            <Textarea value={bundle.profile.skills} onChange={(event) => updateField("skills", event.target.value)} />
          </Field>
          <Field label="Education">
            <Textarea value={bundle.profile.education} onChange={(event) => updateField("education", event.target.value)} />
          </Field>
          <Field label="Career goals">
            <Textarea value={bundle.profile.careerGoals} onChange={(event) => updateField("careerGoals", event.target.value)} />
          </Field>
          <Field label="Interests">
            <Textarea value={bundle.profile.interests} onChange={(event) => updateField("interests", event.target.value)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Social links">
              <Textarea value={bundle.profile.socialLinks} onChange={(event) => updateField("socialLinks", event.target.value)} />
            </Field>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button
              onClick={() => {
                updateProfile(user.id, bundle.profile);
                setSavedAt(new Date().toLocaleTimeString());
                toast.success("Profile saved.");
              }}
            >
              Save now
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
