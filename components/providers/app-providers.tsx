"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { AuthBootstrap } from "@/components/providers/auth-bootstrap";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthBootstrap />
      {children}
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  );
}
