"use client";

import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export default function SignUpPage() {
  return (
    <AuthForm
      mode="sign-up"
      title="Build your growth operating system"
      description="Create your account and start organizing personal growth, reflection, and career strategy."
      footer={
        <p className="text-sm text-muted">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-[var(--foreground)]">
            Sign in
          </Link>
        </p>
      }
    />
  );
}
