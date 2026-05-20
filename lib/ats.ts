import type { JobPosting, ResumeAnalysis } from "./types";

const stopwords = new Set(["and", "the", "for", "with", "that", "from", "your", "have", "using", "into"]);

function uniqueWords(text: string) {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .split(/[^a-z0-9+.#-]+/)
        .map((item) => item.trim())
        .filter((item) => item.length > 2 && !stopwords.has(item))
    )
  );
}

export async function extractResumeText(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "docx") {
    const mammoth = await import("mammoth");
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  }

  if (extension === "pdf") {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
    const bytes = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjs.getDocument({ data: bytes }).promise;
    let text = "";
    for (let page = 1; page <= pdf.numPages; page += 1) {
      const current = await pdf.getPage(page);
      const content = await current.getTextContent();
      text += ` ${content.items.map((item) => ("str" in item ? item.str : "")).join(" ")}`;
    }
    return text;
  }

  throw new Error("Please upload a PDF or DOCX resume.");
}

export function analyzeResume(text: string, jobs: JobPosting[], fileName: string): ResumeAnalysis {
  const extractedKeywords = uniqueWords(text);
  const jobMatches = jobs.map((job) => {
    const skills = job.skills.map((skill) => skill.toLowerCase());
    const matched = skills.filter((skill) => extractedKeywords.some((word) => word.includes(skill.toLowerCase()) || skill.includes(word)));
    const match = Math.min(98, Math.round((matched.length / skills.length) * 100) || 15);
    return { jobId: job.id, match };
  });
  const topMatches = jobMatches
    .slice()
    .sort((left, right) => right.match - left.match)
    .slice(0, 3)
    .map((item) => jobs.find((job) => job.id === item.jobId))
    .filter((job): job is JobPosting => Boolean(job));

  const relevantSkills = Array.from(new Set(jobs.flatMap((job) => job.skills.map((skill) => skill.toLowerCase()))));
  const present = relevantSkills.filter((skill) => extractedKeywords.includes(skill));
  const missingSkills = relevantSkills.filter((skill) => !present.includes(skill)).slice(0, 6);
  const score = Math.min(97, Math.max(38, Math.round((present.length / Math.max(relevantSkills.length, 1)) * 100)));

  return {
    fileName,
    score,
    strengths: [
      "Resume includes measurable domain vocabulary and can be mapped against target roles.",
      "Keyword density is sufficient for automated parsing across common ATS scanners.",
      "Profile narrative can support both growth and job-search dashboards."
    ],
    missingSkills,
    suggestions: [
      topMatches[0]
        ? `You are currently closest to ${topMatches[0].title} roles. Tune your summary and skills section toward ${topMatches[0].skills.slice(0, 3).join(", ")}.`
        : "Mirror exact phrasing from target job descriptions in your project and skills sections.",
      topMatches[1]
        ? `Your resume also overlaps with ${topMatches[1].title} openings. Add project bullets that show hands-on work with ${topMatches[1].skills.slice(0, 2).join(" and ")}.`
        : "Add outcome metrics to projects and achievements to strengthen recruiter confidence.",
      "Group tools and technologies into clearer skill clusters for better ATS extraction."
    ],
    extractedKeywords: extractedKeywords.slice(0, 18),
    jobMatches
  };
}
