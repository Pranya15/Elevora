"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, PanelLeftClose } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { sidebarItems } from "@/lib/constants";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { FloatingAssistant } from "@/components/layout/floating-assistant";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRowClass =
    "flex min-h-[48px] w-full select-none items-center gap-3 rounded-2xl px-4 py-3 text-sm text-[var(--foreground)] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";
  const sidebarIconClass = "grid h-[18px] w-[18px] shrink-0 place-items-center";

  const sidebar = (
    <GlassCard
      className={cn(
        "flex h-full flex-col gap-5 p-4 transition-all duration-300",
        collapsed ? "w-[92px]" : "w-[280px]"
      )}
    >
      <div className="space-y-3">
        <div className={cn("px-4", collapsed && "hidden")}>
          <p className="text-xs uppercase tracking-[0.38em] text-muted">Elevora</p>
          <p className="mt-1 text-sm font-medium">Growth OS</p>
        </div>
        <button
          type="button"
          className={cn(
            sidebarRowClass,
            "hover:bg-[var(--accent-soft)]",
            collapsed && "justify-center"
          )}
          onClick={() => setCollapsed((current) => !current)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className={sidebarIconClass}>
            <PanelLeftClose size={18} />
          </span>
          <span className={cn(collapsed && "hidden")}>Collapse sidebar</span>
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {sidebarItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                sidebarRowClass,
                active
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[var(--shadow-soft)]"
                  : "hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)] active:bg-[var(--accent)] active:text-[var(--accent-foreground)]"
              )}
            >
              <span className={sidebarIconClass}>
                <item.icon size={18} />
              </span>
              <span className={cn(collapsed && "hidden")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3">
        <div className={cn("rounded-2xl border p-4", collapsed && "hidden")}>
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="mt-1 text-xs text-muted">{user?.email}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className={cn("flex-1", collapsed && "px-0")}
            onClick={() => {
              logout();
              router.replace("/sign-in");
            }}
          >
            {collapsed ? "Out" : "Logout"}
          </Button>
        </div>
      </div>
    </GlassCard>
  );

  return (
    <div className="min-h-screen p-3 md:p-5">
      <div className="mx-auto flex max-w-[1600px] gap-4">
        <div className="hidden xl:block">{sidebar}</div>
        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 xl:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <motion.div
                initial={{ x: -24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -24, opacity: 0 }}
                className="h-full p-3"
                onClick={(event) => event.stopPropagation()}
              >
                {sidebar}
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="min-w-0 flex-1">
          <div className="mb-4 xl:hidden">
            <div>
              <Button variant="secondary" className="w-11 px-0" onClick={() => setMobileOpen(true)}>
                <Menu size={18} />
              </Button>
            </div>
          </div>
          <main className="space-y-4">{children}</main>
        </div>
      </div>
      <FloatingAssistant />
    </div>
  );
}
