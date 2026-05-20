"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { FullScreenLoader } from "@/components/ui/full-screen-loader";

export default function HomePage() {
  const router = useRouter();
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!hydrated) return;
    router.replace(user ? "/dashboard" : "/sign-in");
  }, [hydrated, router, user]);

  return <FullScreenLoader label="Preparing Elevora" />;
}
