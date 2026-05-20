import { Briefcase, CalendarRange, CircleUserRound, LayoutDashboard, NotebookPen, PlusSquare, Target, TimerReset } from "lucide-react";
import { ExperienceLevel, JobPosting, JobType, WorkMode } from "./types";

export const sidebarItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/timeline", label: "Timeline", icon: CalendarRange },
  { href: "/add-entry", label: "Add Entry", icon: PlusSquare },
  { href: "/profile", label: "Profile", icon: CircleUserRound },
  { href: "/current-focus", label: "Current Focus", icon: Target },
  { href: "/saved-focus", label: "Saved Focus", icon: TimerReset },
  { href: "/reflections", label: "Reflections", icon: NotebookPen },
  { href: "/jobs", label: "Jobs", icon: Briefcase }
] as const;

export const categoryOptions = ["Skill", "Project", "Achievement", "Certification", "Reflection"] as const;
export const moodOptions = [1, 2, 3, 4, 5];
export const experienceOptions: ExperienceLevel[] = ["Entry", "Mid", "Senior"];
export const jobTypeOptions: JobType[] = ["Full-time", "Part-time", "Contract", "Internship"];
export const workModeOptions: WorkMode[] = ["Remote", "Onsite", "Hybrid"];
export const globalCountryOptions = [
  "Australia",
  "Brazil",
  "Canada",
  "France",
  "Germany",
  "India",
  "Japan",
  "Netherlands",
  "Singapore",
  "United Arab Emirates",
  "United Kingdom",
  "United States"
] as const;
export const countryCityOptions: Record<(typeof globalCountryOptions)[number], string[]> = {
  Australia: ["Adelaide", "Brisbane", "Canberra", "Melbourne", "Perth", "Sydney"],
  Brazil: ["Brasilia", "Campinas", "Curitiba", "Porto Alegre", "Rio de Janeiro", "Sao Paulo"],
  Canada: ["Calgary", "Montreal", "Ottawa", "Toronto", "Vancouver", "Waterloo"],
  France: ["Bordeaux", "Lille", "Lyon", "Marseille", "Paris", "Toulouse"],
  Germany: ["Berlin", "Frankfurt", "Hamburg", "Munich", "Stuttgart", "Cologne"],
  India: ["Ahmedabad", "Bengaluru", "Chandigarh", "Chennai", "Delhi", "Gurugram", "Hyderabad", "Jaipur", "Kochi", "Kolkata", "Lucknow", "Mumbai", "Noida", "Pune"],
  Japan: ["Fukuoka", "Kyoto", "Nagoya", "Osaka", "Sapporo", "Tokyo"],
  Netherlands: ["Amsterdam", "Delft", "Eindhoven", "Rotterdam", "The Hague", "Utrecht"],
  Singapore: ["Ang Mo Kio", "Bedok", "Jurong East", "Novena", "Queenstown", "Tampines"],
  "United Arab Emirates": ["Abu Dhabi", "Ajman", "Al Ain", "Dubai", "Sharjah", "Ras Al Khaimah"],
  "United Kingdom": ["Birmingham", "Bristol", "Edinburgh", "Leeds", "London", "Manchester"],
  "United States": ["Austin", "Boston", "Chicago", "New York", "San Francisco", "Seattle"]
};

export const sampleJobs: JobPosting[] = [
  {
    id: "job-1",
    title: "Software Engineer - Fullstack",
    company: "Priceline",
    source: "LinkedIn",
    country: "India",
    city: "Mumbai",
    workMode: "Hybrid",
    type: "Full-time",
    experienceLevel: "Senior",
    skills: ["Full-stack", "Product Engineering", "Testing", "Automation", "Collaboration"],
    description: "Build reliable software in Priceline's product operating model with a hybrid setup in Mumbai.",
    link: "https://in.linkedin.com/jobs/view/software-engineer-fullstack-at-priceline-4355072304",
    salary: "Not listed",
    postedAt: "1 week ago"
  },
  {
    id: "job-2",
    title: "Frontend Engineer",
    company: "Tessact",
    source: "LinkedIn",
    country: "India",
    city: "Mumbai",
    workMode: "Hybrid",
    type: "Full-time",
    experienceLevel: "Entry",
    skills: ["React", "TypeScript", "UI", "CSS", "JavaScript"],
    description: "Build frontend product experiences and ship interface improvements across web surfaces.",
    link: "https://www.linkedin.com/jobs/view/frontend-developer-at-tessact-3957013707",
    salary: "₹8,00,000 - ₹15,00,000/year",
    postedAt: "7 months ago"
  },
  {
    id: "job-3",
    title: "Software Engineer",
    company: "Zoom",
    source: "Indeed",
    country: "United States",
    city: "Remote",
    workMode: "Remote",
    type: "Full-time",
    experienceLevel: "Mid",
    skills: ["Backend Systems", "Cloud", "Cross-functional", "Scalability", "Performance"],
    description: "Design and build scalable backend systems for global collaboration products in a remote role.",
    link: "https://www.indeed.com/viewjob?jk=76952bdd1db77c87",
    salary: "$98/hour",
    postedAt: "Last month"
  },
  {
    id: "job-4",
    title: "Frontend Software Engineer",
    company: "Tesla",
    source: "LinkedIn",
    country: "India",
    city: "Mumbai",
    workMode: "Hybrid",
    type: "Full-time",
    experienceLevel: "Mid",
    skills: ["Frontend", "JavaScript", "Web", "UI", "Engineering"],
    description: "Work on frontend software experiences and product interfaces with a hybrid team.",
    link: "https://www.linkedin.com/jobs/view/frontend-software-engineer-at-tesla-3940510187",
    salary: "Not listed",
    postedAt: "11 months ago"
  },
  {
    id: "job-5",
    title: "Java Back End Developer",
    company: "The Glove",
    source: "Naukri",
    country: "India",
    city: "Bengaluru",
    workMode: "Onsite",
    type: "Full-time",
    experienceLevel: "Mid",
    skills: ["Java", "Spring Boot", "Microservices", "Architecture", "Scalable Applications"],
    description: "Build secure, high-performance Java services using Spring Boot and microservices architecture.",
    link: "https://www.naukri.com/job-listings-java-back-end-developer-bangalore-the-glove-bengaluru-3-to-8-years-260525016801",
    salary: "Not disclosed",
    postedAt: "19 days ago"
  },
  {
    id: "job-6",
    title: "Lead Front End Developer(Vue.js)",
    company: "GSPANN",
    source: "Naukri",
    country: "India",
    city: "Hyderabad",
    workMode: "Hybrid",
    type: "Full-time",
    experienceLevel: "Senior",
    skills: ["Vue.js", "Frontend", "JavaScript", "UI", "Web Development"],
    description: "Lead frontend development for customer-facing web applications from the Hyderabad office.",
    link: "https://www.naukri.com/job-listings-170924807292",
    salary: "₹18L - ₹33L/year",
    postedAt: "271 days ago"
  },
  {
    id: "job-7",
    title: "Cloud Engineer III",
    company: "RealPage",
    source: "Naukri",
    country: "India",
    city: "Hyderabad",
    workMode: "Hybrid",
    type: "Full-time",
    experienceLevel: "Mid",
    skills: ["Cloud", "Infrastructure", "Deployment", "Engineering", "Systems"],
    description: "Design and deploy cloud systems in a hybrid engineering role based in Hyderabad.",
    link: "https://companies.naukri.com/realpagenew-jobs/jobs/",
    salary: "Not disclosed",
    postedAt: "2 days ago"
  },
  {
    id: "job-8",
    title: "Staff Software Engineer - Applications",
    company: "LinkedIn",
    source: "LinkedIn",
    country: "United States",
    city: "Mountain View",
    workMode: "Hybrid",
    type: "Full-time",
    experienceLevel: "Senior",
    skills: ["Distributed Systems", "Architecture", "Code Review", "Technical Leadership", "Scalable Applications"],
    description: "Lead application engineering with distributed design patterns, code quality, and large-scale delivery.",
    link: "https://www.linkedin.com/jobs/view/staff-software-engineer-applications-at-linkedin-4361321748",
    salary: "$152,000 - $248,000/year",
    postedAt: "5 days ago"
  },
  {
    id: "job-9",
    title: "Software Engineer, (L2) CDP",
    company: "Twilio",
    source: "Indeed",
    country: "United States",
    city: "Remote",
    workMode: "Remote",
    type: "Full-time",
    experienceLevel: "Mid",
    skills: ["APIs", "Scalable Systems", "Data Models", "Performance", "Engineering"],
    description: "Build APIs and improve scalable systems in a remote software engineering role.",
    link: "https://www.indeed.com/viewjob?jk=f39c8fb407045f84",
    salary: "$116,960 - $154,700/year",
    postedAt: "6 days ago"
  },
];

export const insightPrompts = [
  "Your consistency trend is rising. Keep feeding high-rated work into projects and certifications.",
  "You are strongest when reflection follows execution. Pair daily notes with project milestones.",
  "Job fit improves materially when your profile skills and recent entries reuse the same language."
];

export const welcomeMessages = [
  "Design your next phase with evidence, not guesswork.",
  "Track your momentum across learning, execution, and career movement."
];

export const assistantSuggestions = [
  "Summarize my recent growth patterns",
  "Suggest what skill to prioritize next",
  "Tell me how my resume fits remote frontend roles"
];
