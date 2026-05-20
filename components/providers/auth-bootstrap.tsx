"use client";

import { useEffect } from "react";
import { useAuthStore, useDataStore } from "@/lib/store";

export function AuthBootstrap() {
  const authHydrated = useAuthStore((state) => state.hydrated);
  const dataHydrated = useDataStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const ensureBundle = useDataStore((state) => state.ensureBundle);

  useEffect(() => {
    if (authHydrated && dataHydrated && user) {
      ensureBundle(user.id);
    }
  }, [authHydrated, dataHydrated, ensureBundle, user]);

  return null;
}
