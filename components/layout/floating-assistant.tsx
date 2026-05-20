"use client";

import { FormEvent, useMemo, useState } from "react";
import { MessageSquareText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { assistantSuggestions, insightPrompts } from "@/lib/constants";
import { useAuthStore, useUserBundle } from "@/lib/store";
import { average } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function formatAssistantMessage(content: string) {
  let index = 0;

  return content
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      const boldHeadingMatch = trimmed.match(/^\*\*(.+?)\*\*:?$/);

      if (boldHeadingMatch) {
        index += 1;
        return `${index}. ${boldHeadingMatch[1].trim()}`;
      }

      return line.replace(/\*\*(.+?)\*\*/g, "$1");
    })
    .join("\n");
}

export function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const user = useAuthStore((state) => state.user);
  const bundle = useUserBundle(user?.id);

  const insight = useMemo(() => {
    if (!bundle) return "Start adding entries and reflections to unlock personalized guidance.";
    if (bundle.entries.length === 0) return insightPrompts[0];
    const avg = average(bundle.entries.map((item) => item.rating));
    if (avg >= 4) return "Your recent work quality is strong. Turn this into visible project proof and job-ready narratives.";
    if (bundle.reflections.length > bundle.entries.length) return "You reflect consistently. Pair that with more output-focused entries to sharpen momentum.";
    return "Career alignment improves when your profile, entries, and resume repeat the same high-signal skills.";
  }, [bundle]);

  const assistantContext = useMemo(() => {
    if (!bundle) return "";

    const profile = [
      bundle.profile.name ? `Name: ${bundle.profile.name}` : "",
      bundle.profile.bio ? `Bio: ${bundle.profile.bio}` : "",
      bundle.profile.skills ? `Skills: ${bundle.profile.skills}` : "",
      bundle.profile.education ? `Education: ${bundle.profile.education}` : "",
      bundle.profile.careerGoals ? `Career goals: ${bundle.profile.careerGoals}` : "",
      bundle.profile.interests ? `Interests: ${bundle.profile.interests}` : "",
      bundle.profile.socialLinks ? `Social links: ${bundle.profile.socialLinks}` : ""
    ]
      .filter(Boolean)
      .join("\n");

    const focus = bundle.focus
      .slice(0, 4)
      .map((item) => `${item.title} | ${item.status} | ${item.priority} priority | ${item.progress}%`)
      .join("\n");

    const entries = bundle.entries
      .slice(0, 5)
      .map((item) => `${item.title} | ${item.category} | rating ${item.rating}/5 | ${item.description}`)
      .join("\n");

    const reflections = bundle.reflections
      .slice(0, 4)
      .map((item) => `${item.title} | productivity ${item.productivity}/5 | ${item.content}`)
      .join("\n");

    const resume = bundle.resumeAnalysis
      ? [
          `Resume score: ${bundle.resumeAnalysis.score}%`,
          `Missing skills: ${bundle.resumeAnalysis.missingSkills.join(", ")}`,
          `Suggestions: ${bundle.resumeAnalysis.suggestions.join(" | ")}`
        ].join("\n")
      : "";

    return [
      profile ? `Profile\n${profile}` : "",
      focus ? `Current focus\n${focus}` : "",
      entries ? `Recent entries\n${entries}` : "",
      reflections ? `Recent reflections\n${reflections}` : "",
      resume ? `Resume analysis\n${resume}` : ""
    ]
      .filter(Boolean)
      .join("\n\n");
  }, [bundle]);

  async function submitPrompt(prompt: string) {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || loading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedPrompt
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: trimmedPrompt,
          context: assistantContext,
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content
          }))
        })
      });

      const payload = (await response.json()) as { answer?: string; error?: string };
      if (!response.ok || !payload.answer) {
        throw new Error(payload.error || "The assistant could not answer right now.");
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: payload.answer || ""
        }
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "The assistant could not answer right now.";
      toast.error(message);
      const normalizedMessage = message.toLowerCase();
      const fallbackMessage =
        normalizedMessage.includes("high demand") || normalizedMessage.includes("timed out")
          ? "I could not generate a model-backed reply because Gemini is under high demand right now. Wait a few seconds and try again."
          : normalizedMessage.includes("429") || normalizedMessage.includes("rate limit") || normalizedMessage.includes("quota")
            ? "I could not generate a model-backed reply because the configured Gemini API key has hit a quota or rate limit. Check your Gemini API plan and try again."
            : "I could not generate a model-backed reply right now. Check whether the Gemini API key is configured correctly and try again.";
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: fallbackMessage
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitPrompt(question);
  }

  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-3">
      {open ? (
        <GlassCard className="flex max-h-[calc(100vh-6.5rem)] w-[min(340px,calc(100vw-2rem))] flex-col gap-4 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)]">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-sm font-medium">Elevora AI</p>
              <p className="text-xs text-muted">Model-backed assistant</p>
            </div>
          </div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            <div className="rounded-2xl bg-[var(--background-elevated)] px-4 py-3 text-sm">
              {insight}
            </div>
            {messages.map((message) => (
              <div
                key={message.id}
                className={message.role === "assistant" ? "rounded-2xl bg-[var(--background-elevated)] px-4 py-3 text-sm" : "rounded-2xl border px-4 py-3 text-sm"}
              >
                {message.role === "assistant" ? formatAssistantMessage(message.content) : message.content}
              </div>
            ))}
            {loading ? <div className="rounded-2xl bg-[var(--background-elevated)] px-4 py-3 text-sm text-muted">Thinking...</div> : null}
          </div>
          <div className="max-h-32 space-y-2 overflow-y-auto pr-1">
            {assistantSuggestions.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="w-full rounded-2xl border bg-[var(--background-elevated)] px-4 py-3 text-left text-sm transition hover:bg-[var(--accent-soft)]"
                onClick={() => void submitPrompt(prompt)}
                disabled={loading}
              >
                {prompt}
              </button>
            ))}
          </div>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <Textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask anything about your career, profile, resume, or growth..."
              className="min-h-[88px] max-h-32 bg-[var(--background-elevated)]"
            />
            <Button type="submit" className="w-full" disabled={!question.trim() || loading}>
              {loading ? "Thinking..." : "Ask question"}
            </Button>
          </form>
        </GlassCard>
      ) : null}
      <Button className="gap-2" onClick={() => setOpen((current) => !current)}>
        <MessageSquareText size={18} />
        AI Assistant
      </Button>
    </div>
  );
}
