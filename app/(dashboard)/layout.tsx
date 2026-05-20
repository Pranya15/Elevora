"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { FullScreenLoader } from "@/components/ui/full-screen-loader";
import { useAuthStore, useDataStore } from "@/lib/store";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const authHydrated = useAuthStore((state) => state.hydrated);
  const dataHydrated = useDataStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const ensureBundle = useDataStore((state) => state.ensureBundle);

  useEffect(() => {
    if (!authHydrated) return;
    if (!user) {
      router.replace("/sign-in");
      return;
    }
    if (dataHydrated) ensureBundle(user.id);
  }, [authHydrated, dataHydrated, ensureBundle, router, user]);

  if (!authHydrated || !dataHydrated || !user) {
    return <FullScreenLoader label="Restoring your workspace" />;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
