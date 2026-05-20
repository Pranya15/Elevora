export type EntryCategory = "Skill" | "Project" | "Achievement" | "Certification" | "Reflection";

export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";
export type WorkMode = "Remote" | "Onsite" | "Hybrid";
export type ExperienceLevel = "Entry" | "Mid" | "Senior";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type GrowthEntry = {
  id: string;
  title: string;
  description: string;
  category: EntryCategory;
  rating: number;
  tags: string[];
  notes: string;
  date: string;
  fileName?: string;
  fileType?: string;
};

export type FocusItem = {
  id: string;
  title: string;
  summary: string;
  progress: number;
  priority: "Low" | "Medium" | "High";
  dueDate: string;
  status: "Yet to Start" | "Started" | "In Progress" | "Completed";
};

export type LegacyFocusStatus = FocusItem["status"] | "Active";

export type SavedFocusPlan = {
  id: string;
  sourceFocusId?: string;
  title: string;
  description: string;
  milestones: string[];
  status?: "Yet to Start" | "Started" | "In Progress" | "Completed";
};

export type ReflectionEntry = {
  id: string;
  title: string;
  content: string;
  mood: number;
  productivity: number;
  createdAt: string;
};

export type ProfileData = {
  name: string;
  bio: string;
  skills: string;
  education: string;
  careerGoals: string;
  interests: string;
  socialLinks: string;
  resumeFileName: string;
  profilePhotoName: string;
  profilePhotoDataUrl: string;
};

export type JobPosting = {
  id: string;
  title: string;
  company: string;
  source: "LinkedIn" | "Naukri" | "Indeed";
  country: string;
  city: string;
  workMode: WorkMode;
  type: JobType;
  experienceLevel: ExperienceLevel;
  skills: string[];
  description: string;
  link: string;
  salary: string;
  postedAt: string;
};

export type ResumeAnalysis = {
  fileName: string;
  score: number;
  strengths: string[];
  missingSkills: string[];
  suggestions: string[];
  extractedKeywords: string[];
  jobMatches: Array<{
    jobId: string;
    match: number;
  }>;
};

export type UserDataBundle = {
  entries: GrowthEntry[];
  focus: FocusItem[];
  savedFocus: SavedFocusPlan[];
  reflections: ReflectionEntry[];
  profile: ProfileData;
  resumeAnalysis: ResumeAnalysis | null;
  uploadedResumeText: string;
};
