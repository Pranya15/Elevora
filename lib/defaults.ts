import { FocusItem, ProfileData, ReflectionEntry, SavedFocusPlan, UserDataBundle } from "./types";
import { makeId } from "./utils";

const legacyPrefillProfile = {
  skills: "Next.js, TypeScript, Communication",
  careerGoals: "Grow into high-impact AI and product roles.",
  interests: "Design systems, AI products, self-improvement",
  socialLinks: "https://linkedin.com/in/your-profile"
} as const;

export const defaultProfile: ProfileData = {
  name: "",
  bio: "",
  skills: "",
  education: "",
  careerGoals: "",
  interests: "",
  socialLinks: "",
  resumeFileName: "",
  profilePhotoName: "",
  profilePhotoDataUrl: ""
};

export function clearLegacyProfilePrefill(profile: ProfileData): ProfileData {
  return {
    ...profile,
    skills: profile.skills === legacyPrefillProfile.skills ? "" : profile.skills,
    careerGoals: profile.careerGoals === legacyPrefillProfile.careerGoals ? "" : profile.careerGoals,
    interests: profile.interests === legacyPrefillProfile.interests ? "" : profile.interests,
    socialLinks: profile.socialLinks === legacyPrefillProfile.socialLinks ? "" : profile.socialLinks
  };
}

export const defaultFocus: FocusItem[] = [];

export const defaultSavedFocus: SavedFocusPlan[] = [
  {
    id: makeId("saved"),
    title: "Frontend Career Sprint",
    description: "Refine portfolio, resume, and interview positioning around product-grade frontend work.",
    milestones: ["Polish portfolio case study", "Map resume to target roles", "Practice two mock interviews"],
    status: "In Progress"
  }
];

export const defaultReflections: ReflectionEntry[] = [
  {
    id: makeId("reflection"),
    title: "Strong execution day",
    content: "Finished a meaningful feature and documented what made focus easier.",
    mood: 4,
    productivity: 5,
    createdAt: new Date().toISOString()
  }
];

export function createDefaultUserData(): UserDataBundle {
  return {
    entries: [],
    focus: defaultFocus,
    savedFocus: defaultSavedFocus,
    reflections: defaultReflections,
    profile: { ...defaultProfile },
    resumeAnalysis: null,
    uploadedResumeText: ""
  };
}
