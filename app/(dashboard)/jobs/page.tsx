"use client";

import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { analyzeResume, extractResumeText } from "@/lib/ats";
import { countryCityOptions, experienceOptions, globalCountryOptions, jobTypeOptions, sampleJobs, workModeOptions } from "@/lib/constants";
import { useAuthStore, useDataStore, useUserBundle } from "@/lib/store";
import { JobPosting } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type JobFilters = {
  search: string;
  country: string;
  city: string;
  type: string;
  workMode: string;
  experience: string;
};

const defaultFilters: JobFilters = {
  search: "",
  country: "All",
  city: "All",
  type: "All",
  workMode: "All",
  experience: "All"
};

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSearchableText(job: JobPosting) {
  return normalizeSearchText(
    [
      job.title,
      job.company,
      job.description,
      job.skills.join(" "),
      job.source,
      job.country,
      job.city,
      job.workMode,
      job.type,
      job.experienceLevel
    ].join(" ")
  );
}

function matchesSearch(job: JobPosting, search: string) {
  const normalizedSearch = normalizeSearchText(search);

  if (!normalizedSearch) return true;

  const searchableText = buildSearchableText(job);

  if (searchableText.includes(normalizedSearch)) return true;

  const synonymMap: Record<string, string[]> = {
    developer: ["engineer", "software"],
    engineer: ["developer", "software"],
    frontend: ["front end", "front-end", "full stack", "fullstack", "react", "ui"],
    backend: ["back end", "back-end", "api", "java", "spring"],
    fullstack: ["full stack", "frontend", "backend"],
    remote: ["work from home"],
    data: ["analytics", "analyst", "sql"]
  };

  const tokens = normalizedSearch.split(" ").filter(Boolean);
  let matchCount = 0;

  for (const token of tokens) {
    if (searchableText.includes(token)) {
      matchCount += 1;
      continue;
    }

    const alternatives = synonymMap[token] ?? [];
    if (alternatives.some((alternative) => searchableText.includes(normalizeSearchText(alternative)))) {
      matchCount += 1;
    }
  }

  if (tokens.length === 1) return matchCount === 1;

  return matchCount >= Math.max(1, Math.ceil(tokens.length / 2));
}

export default function JobsPage() {
  const user = useAuthStore((state) => state.user);
  const bundle = useUserBundle(user?.id);
  const saveResumeAnalysis = useDataStore((state) => state.saveResumeAnalysis);
  const [draftFilters, setDraftFilters] = useState<JobFilters>(defaultFilters);
  const [submittedFilters, setSubmittedFilters] = useState<JobFilters | null>(null);
  const [pending, setPending] = useState(false);

  const jobs = useMemo(() => {
    if (!submittedFilters) return [];

    return sampleJobs.filter((job) => {
      return (
        matchesSearch(job, submittedFilters.search) &&
        (submittedFilters.country === "All" || job.country === submittedFilters.country) &&
        (submittedFilters.city === "All" || job.city === submittedFilters.city) &&
        (submittedFilters.type === "All" || job.type === submittedFilters.type) &&
        (submittedFilters.workMode === "All" || job.workMode === submittedFilters.workMode) &&
        (submittedFilters.experience === "All" || job.experienceLevel === submittedFilters.experience)
      );
    });
  }, [submittedFilters]);

  const suggestedJobs = useMemo(() => {
    if (!bundle?.resumeAnalysis) return [];

    return bundle.resumeAnalysis.jobMatches
      .slice()
      .sort((left, right) => right.match - left.match)
      .map((item) => {
        const job = sampleJobs.find((current) => current.id === item.jobId);
        return job ? { job, match: item.match } : null;
      })
      .filter((item): item is { job: JobPosting; match: number } => Boolean(item))
      .slice(0, 3);
  }, [bundle?.resumeAnalysis]);

  const countries = useMemo(
    () => Array.from(new Set([...globalCountryOptions, ...sampleJobs.map((job) => job.country)])).sort((left, right) => left.localeCompare(right)),
    []
  );
  const cities = useMemo(() => {
    if (draftFilters.country === "All") {
      return Array.from(new Set(sampleJobs.map((job) => job.city))).sort((left, right) => left.localeCompare(right));
    }

    const configuredCities = countryCityOptions[draftFilters.country as keyof typeof countryCityOptions] ?? [];
    const sampleCities = sampleJobs.filter((job) => job.country === draftFilters.country).map((job) => job.city);

    return Array.from(new Set([...configuredCities, ...sampleCities])).sort((left, right) => left.localeCompare(right));
  }, [draftFilters.country]);
  const directSourceLinks = useMemo(() => {
    const seenSources = new Set<JobPosting["source"]>();

    return jobs.filter((job) => {
      if (seenSources.has(job.source)) return false;

      seenSources.add(job.source);
      return true;
    });
  }, [jobs]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedFilters({ ...draftFilters, search: draftFilters.search.trim() });
  }

  function handleSearchReset() {
    setDraftFilters(defaultFilters);
    setSubmittedFilters(null);
  }

  function handleCountryChange(country: string) {
    setDraftFilters((current) => ({
      ...current,
      country,
      city: "All"
    }));
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Career Intelligence"
        title="AI-powered jobs dashboard"
        description="Search roles on demand, then upload your resume to get ATS analysis and job suggestions based on your profile."
      />

      <form onSubmit={handleSearchSubmit}>
        <GlassCard className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-6">
          <Input
            placeholder="Search jobs"
            value={draftFilters.search}
            onChange={(event) => setDraftFilters((current) => ({ ...current, search: event.target.value }))}
          />
          <Select value={draftFilters.country} onChange={(event) => handleCountryChange(event.target.value)}>
            <option value="All">Country</option>
            {countries.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select value={draftFilters.city} onChange={(event) => setDraftFilters((current) => ({ ...current, city: event.target.value }))}>
            <option value="All">{draftFilters.country === "All" ? "City" : `City in ${draftFilters.country}`}</option>
            {cities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select value={draftFilters.type} onChange={(event) => setDraftFilters((current) => ({ ...current, type: event.target.value }))}>
            <option value="All">Job type</option>
            {jobTypeOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select value={draftFilters.workMode} onChange={(event) => setDraftFilters((current) => ({ ...current, workMode: event.target.value }))}>
            <option value="All">Remote/Onsite</option>
            {workModeOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select value={draftFilters.experience} onChange={(event) => setDraftFilters((current) => ({ ...current, experience: event.target.value }))}>
            <option value="All">Experience</option>
            {experienceOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <div className="flex flex-wrap gap-3 md:col-span-2 xl:col-span-6">
            <Button type="submit">Search jobs</Button>
            <Button type="button" variant="secondary" onClick={handleSearchReset}>
              Clear
            </Button>
          </div>
        </GlassCard>
      </form>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <GlassCard className="space-y-2 p-5">
            <p className="text-sm font-medium">Search results</p>
            <p className="text-sm text-muted">
              {submittedFilters
                ? `${jobs.length} matching job${jobs.length === 1 ? "" : "s"} found for the current search.`
                : "No jobs are shown by default. Search for a role to see matching openings."}
            </p>
          </GlassCard>
          {submittedFilters ? (
            <GlassCard className="space-y-3 p-5">
              <p className="text-sm font-medium">Direct job links</p>
              <div className="grid gap-3 md:grid-cols-3">
                {directSourceLinks.map((job) => (
                  <a key={job.id} href={job.link} target="_blank" rel="noreferrer" className="rounded-3xl border p-4 transition hover:border-[var(--accent)]">
                    <p className="font-medium">{job.source}</p>
                    <p className="mt-2 text-sm">{job.title}</p>
                    <p className="mt-1 text-sm text-muted">
                      {job.company} • {job.city}, {job.country}
                    </p>
                  </a>
                ))}
              </div>
            </GlassCard>
          ) : null}
          {jobs.map((job) => {
            const match = bundle?.resumeAnalysis?.jobMatches.find((item) => item.jobId === job.id)?.match;
            return (
              <GlassCard key={job.id} className="space-y-4 p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-semibold">{job.title}</h2>
                      <span className="rounded-full border px-3 py-1 text-xs">{job.source}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted">
                      {job.company} • {job.city}, {job.country} • {job.workMode}
                    </p>
                    <p className="mt-3 max-w-2xl text-sm text-muted">{job.description}</p>
                  </div>
                  <div className="text-sm text-muted">
                    <p>{job.salary}</p>
                    <p className="mt-1">{job.postedAt}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span key={skill} className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-muted">
                    <span>{job.type}</span> • <span>{job.experienceLevel}</span>
                    {typeof match === "number" ? <span> • Resume fit {match}%</span> : null}
                  </div>
                  <a href={job.link} target="_blank" rel="noreferrer" className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm text-[var(--accent-foreground)]">
                    View job
                  </a>
                </div>
              </GlassCard>
            );
          })}
          {jobs.length === 0 ? (
            <GlassCard className="p-6 text-sm text-muted">
              {submittedFilters ? "No jobs match the current search and filters." : "Search for a job to load results here."}
            </GlassCard>
          ) : null}
        </div>

        <GlassCard className="space-y-5 p-6">
          <div>
            <h2 className="text-xl font-semibold">ATS Resume Review</h2>
            <p className="mt-1 text-sm text-muted">Upload a PDF or DOCX to evaluate keyword coverage and get suggested roles.</p>
          </div>
          <Input
            type="file"
            accept=".pdf,.docx"
            className="h-auto min-h-[56px] py-3 file:mr-4 file:rounded-full file:border-0 file:bg-[var(--accent-soft)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--foreground)]"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file || !user) return;

              try {
                setPending(true);
                const text = await extractResumeText(file);
                const analysis = analyzeResume(text, sampleJobs, file.name);
                saveResumeAnalysis(user.id, analysis, text);
                toast.success("Resume analyzed successfully.");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to analyze resume.");
              } finally {
                setPending(false);
              }
            }}
          />
          {pending ? <p className="text-sm text-muted">Analyzing resume...</p> : null}
          {bundle?.resumeAnalysis ? (
            <div className="space-y-4">
              <div className="surface-strong rounded-3xl p-5">
                <p className="text-sm opacity-70">{bundle.resumeAnalysis.fileName}</p>
                <p className="mt-2 text-4xl font-semibold">{bundle.resumeAnalysis.score}%</p>
                <p className="mt-1 text-sm opacity-70">ATS strength score</p>
              </div>
              <div>
                <p className="text-sm font-medium">Missing skills</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {bundle.resumeAnalysis.missingSkills.map((skill) => (
                    <span key={skill} className="rounded-full border px-3 py-1 text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Suggestions</p>
                <div className="mt-2 space-y-2">
                  {bundle.resumeAnalysis.suggestions.map((suggestion) => (
                    <div key={suggestion} className="rounded-2xl border p-3 text-sm">
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Suggested jobs from your resume</p>
                <div className="mt-2 space-y-2">
                  {suggestedJobs.map(({ job, match }) => (
                    <div key={job.id} className="rounded-2xl border p-4 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <p className="text-muted">
                            {job.company} • {job.city}, {job.country}
                          </p>
                        </div>
                        <span>{match}% fit</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {job.skills.slice(0, 4).map((skill) => (
                          <span key={skill} className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border p-4 text-sm text-muted">
              No resume analysis yet. Upload a resume to generate ATS score and role suggestions aligned to your resume.
            </div>
          )}
          <Button variant="secondary" disabled>
            Resume-based suggestions enabled
          </Button>
        </GlassCard>
      </section>
    </div>
  );
}
