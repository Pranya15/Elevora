"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore, useDataStore } from "@/lib/store";

export function AuthForm({
  mode,
  title,
  description,
  footer
}: {
  mode: "sign-in" | "sign-up";
  title: string;
  description: string;
  footer: React.ReactNode;
}) {
  const router = useRouter();
  const authHydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const signIn = useAuthStore((state) => state.signIn);
  const signUp = useAuthStore((state) => state.signUp);
  const ensureBundle = useDataStore((state) => state.ensureBundle);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (authHydrated && user) router.replace("/dashboard");
  }, [authHydrated, router, user]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    const result =
      mode === "sign-up"
        ? signUp(form)
        : signIn({ email: form.email, password: form.password });

    if (!result.ok) {
      toast.error(result.message);
      setPending(false);
      return;
    }

    if (mode === "sign-up") {
      const createdUser = useAuthStore.getState().user;
      if (createdUser) ensureBundle(createdUser.id);
    }

    toast.success(result.message);
    router.replace("/dashboard");
    setPending(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl">
      <div className="grid overflow-hidden rounded-[36px] border border-[var(--border)] bg-[var(--background-elevated)] shadow-[var(--shadow)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid-pattern surface-strong relative hidden min-h-[620px] overflow-hidden lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_26%),radial-gradient(circle_at_78%_18%,rgba(255,214,170,0.18),transparent_22%)]" />
          <div className="relative flex h-full flex-col justify-between p-10">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-white/64">Elevora</p>
              <h2 className="max-w-md text-5xl font-semibold leading-tight">
                Personal growth intelligence built like a premium product.
              </h2>
            </div>
            <div className="space-y-3 text-sm text-white/72">
              <p>Track your timeline, sharpen your focus, and align your resume with better opportunities.</p>
              <p>Stable routing. Persistent sessions. Thoughtful analytics.</p>
            </div>
          </div>
        </div>
        <GlassCard className="rounded-none border-0 bg-transparent p-6 shadow-none ring-0 md:p-10">
          <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-md flex-col justify-center space-y-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.32em] text-muted">{mode === "sign-in" ? "Sign in" : "Sign up"}</p>
              <div>
                <h1 className="text-3xl font-semibold">{title}</h1>
                <p className="mt-2 text-sm text-muted">{description}</p>
              </div>
            </div>
            {mode === "sign-up" ? (
              <Input
                required
                placeholder="Full name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
            ) : null}
            <Input
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
            <Input
              required
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
            <Button type="submit" disabled={pending}>
              {pending ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Create account"}
            </Button>
            {footer}
          </form>
        </GlassCard>
      </div>
    </motion.div>
  );
}
