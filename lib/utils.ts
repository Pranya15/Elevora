import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FocusItem, LegacyFocusStatus } from "./types";

export function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export function makeId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function average(values: number[]) {
  if (!values.length) return 0;
  return Number((values.reduce((sum, current) => sum + current, 0) / values.length).toFixed(1));
}

export function normalizeFocusStatus(status: LegacyFocusStatus): FocusItem["status"] {
  return status === "Active" ? "In Progress" : status;
}

export function parseTagInput(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function getEntryUploadAccept(category: string) {
  if (category === "Project") return ".zip";
  if (category === "Skill" || category === "Achievement" || category === "Certification") return ".pdf,image/*";
  return "*";
}

export function isValidEntryUpload(category: string, file: File) {
  const fileName = file.name.toLowerCase();

  if (category === "Project") {
    return fileName.endsWith(".zip");
  }

  if (category === "Skill" || category === "Achievement" || category === "Certification") {
    return fileName.endsWith(".pdf") || file.type.startsWith("image/");
  }

  return true;
}
