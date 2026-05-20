"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { clearLegacyProfilePrefill, createDefaultUserData } from "./defaults";
import { sampleJobs } from "./constants";
import type { AuthUser, FocusItem, GrowthEntry, JobPosting, ProfileData, ReflectionEntry, ResumeAnalysis, SavedFocusPlan, UserDataBundle, UserRecord } from "./types";
import { makeId } from "./utils";

type AuthState = {
  users: UserRecord[];
  user: AuthUser | null;
  hydrated: boolean;
  signUp: (payload: { name: string; email: string; password: string }) => { ok: boolean; message: string };
  signIn: (payload: { email: string; password: string }) => { ok: boolean; message: string };
  logout: () => void;
  finishHydration: () => void;
};

type DataState = {
  bundles: Record<string, UserDataBundle>;
  hydrated: boolean;
  addEntry: (userId: string, entry: Omit<GrowthEntry, "id">) => void;
  updateProfile: (userId: string, patch: Partial<ProfileData>) => void;
  addReflection: (userId: string, reflection: Omit<ReflectionEntry, "id" | "createdAt">) => void;
  updateFocus: (userId: string, focus: FocusItem[]) => void;
  updateSavedFocus: (userId: string, plans: SavedFocusPlan[]) => void;
  saveResumeAnalysis: (userId: string, analysis: ResumeAnalysis, text: string) => void;
  ensureBundle: (userId: string) => void;
  finishHydration: () => void;
};

function sanitizeUser(user: UserRecord): AuthUser {
  return { id: user.id, name: user.name, email: user.email };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      user: null,
      hydrated: false,
      signUp: ({ name, email, password }) => {
        const normalizedEmail = email.trim().toLowerCase();
        const exists = get().users.some((item) => item.email.toLowerCase() === normalizedEmail);
        if (exists) return { ok: false, message: "Account already exists for this email." };

        const record: UserRecord = {
          id: makeId("user"),
          name: name.trim(),
          email: normalizedEmail,
          password,
          createdAt: new Date().toISOString()
        };

        set((state) => ({ users: [...state.users, record], user: sanitizeUser(record) }));
        return { ok: true, message: "Account created successfully." };
      },
      signIn: ({ email, password }) => {
        const normalizedEmail = email.trim().toLowerCase();
        const match = get().users.find((item) => item.email === normalizedEmail && item.password === password);
        if (!match) return { ok: false, message: "Invalid email or password." };
        set({ user: sanitizeUser(match) });
        return { ok: true, message: "Signed in successfully." };
      },
      logout: () => set({ user: null }),
      finishHydration: () => set({ hydrated: true })
    }),
    {
      name: "elevora-auth",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.finishHydration();
      }
    }
  )
);

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      bundles: {},
      hydrated: false,
      ensureBundle: (userId) =>
        set((state) => ({
          bundles: state.bundles[userId] ? state.bundles : { ...state.bundles, [userId]: createDefaultUserData() }
        })),
      addEntry: (userId, entry) =>
        set((state) => {
          const bundle = state.bundles[userId] ?? createDefaultUserData();
          return {
            bundles: {
              ...state.bundles,
              [userId]: {
                ...bundle,
                entries: [{ ...entry, id: makeId("entry") }, ...bundle.entries]
              }
            }
          };
        }),
      updateProfile: (userId, patch) =>
        set((state) => {
          const bundle = state.bundles[userId] ?? createDefaultUserData();
          return {
            bundles: {
              ...state.bundles,
              [userId]: {
                ...bundle,
                profile: { ...bundle.profile, ...patch }
              }
            }
          };
        }),
      addReflection: (userId, reflection) =>
        set((state) => {
          const bundle = state.bundles[userId] ?? createDefaultUserData();
          return {
            bundles: {
              ...state.bundles,
              [userId]: {
                ...bundle,
                reflections: [
                  { ...reflection, id: makeId("reflection"), createdAt: new Date().toISOString() },
                  ...bundle.reflections
                ]
              }
            }
          };
        }),
      updateFocus: (userId, focus) =>
        set((state) => {
          const bundle = state.bundles[userId] ?? createDefaultUserData();
          return { bundles: { ...state.bundles, [userId]: { ...bundle, focus } } };
        }),
      updateSavedFocus: (userId, plans) =>
        set((state) => {
          const bundle = state.bundles[userId] ?? createDefaultUserData();
          return { bundles: { ...state.bundles, [userId]: { ...bundle, savedFocus: plans } } };
        }),
      saveResumeAnalysis: (userId, analysis, text) =>
        set((state) => {
          const bundle = state.bundles[userId] ?? createDefaultUserData();
          return {
            bundles: {
              ...state.bundles,
              [userId]: {
                ...bundle,
                resumeAnalysis: analysis,
                uploadedResumeText: text
              }
            }
          };
        }),
      finishHydration: () => set({ hydrated: true })
    }),
    {
      name: "elevora-data",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => {
        const state = persistedState as DataState | undefined;
        if (!state?.bundles) return state as DataState;

        return {
          ...state,
          bundles: Object.fromEntries(
            Object.entries(state.bundles).map(([userId, bundle]) => [
              userId,
              {
                ...bundle,
                profile: clearLegacyProfilePrefill(bundle.profile)
              }
            ])
          )
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.finishHydration();
      }
    }
  )
);

export function useUserBundle(userId?: string | null) {
  const bundle = useDataStore((state) => (userId ? state.bundles[userId] : undefined));
  return bundle;
}

export function getJobs(): JobPosting[] {
  return sampleJobs;
}
