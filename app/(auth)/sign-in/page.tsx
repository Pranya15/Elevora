"use client";

import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export default function SignInPage() {
  return (
    <AuthForm
      mode="sign-in"
      title="Welcome back"
      description="Sign in to continue tracking your growth, focus, and career momentum."
      footer={
        <p className="text-sm text-muted">
          New to Elevora?{" "}
          <Link href="/sign-up" className="font-medium text-[var(--foreground)]">
            Create an account
          </Link>
        </p>
      }
    />
  );
}
