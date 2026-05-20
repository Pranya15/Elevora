import { NextResponse } from "next/server";

type AssistantRequest = {
  question?: string;
  context?: string;
  messages?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
};

type ProviderResult =
  | {
      ok: true;
      answer: string;
      provider: "gemini" | "openai";
    }
  | {
      ok: false;
      provider: "gemini" | "openai";
      status: number;
      message: string;
      retryable: boolean;
    };

const SYSTEM_INSTRUCTION =
  "You are Elevora AI, a concise career and productivity assistant inside a personal dashboard. Answer the user's question directly. Use the provided workspace context when relevant, but do not sound rigid or template-driven. Be helpful, natural, and practical. If the context is missing or insufficient, say so briefly and still answer generally when possible. When you break an answer into multiple points, use numbered lists like 1., 2., 3. Do not use markdown bold markers like **Heading** for section titles.";

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

function buildPrompt(question: string, context: string) {
  return context ? `Workspace context:\n${context}\n\nUser question:\n${question}` : question;
}

function isPlaceholderKey(value?: string) {
  if (!value) return true;

  const normalized = value.trim().toLowerCase();
  return (
    !normalized ||
    normalized.includes("your_") ||
    normalized.includes("your-") ||
    normalized.includes("placeholder") ||
    normalized === "test" ||
    normalized.startsWith("sk-abcdef") ||
    normalized.startsWith("AIzaSyBXocESd5V2ZVXxNrrl-gJC_W5LlIxfisk".toLowerCase())
  );
}

function extractContextSection(context: string, heading: string) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`${escapedHeading}\\n([\\s\\S]*?)(?=\\n\\n[A-Z][^\\n]*\\n|$)`);
  const match = context.match(regex);
  return match?.[1]?.trim() ?? "";
}

function buildLocalFallback(question: string, context: string) {
  const normalizedQuestion = question.toLowerCase();
  const skills = extractContextSection(context, "Profile")
    .split("\n")
    .find((line) => line.startsWith("Skills:"));
  const focus = extractContextSection(context, "Current focus")
    .split("\n")
    .filter(Boolean)
    .slice(0, 3);
  const resume = extractContextSection(context, "Resume analysis");

  if (normalizedQuestion.includes("resume")) {
    return [
      "1. I could not reach the model provider, so this is a local fallback reply.",
      resume ? `2. From your saved resume analysis:\n${resume}` : "2. No resume analysis is saved yet. Upload a resume in the Jobs page first.",
      "3. Ask again after fixing the API key if you want a more tailored rewrite or ATS critique."
    ].join("\n");
  }

  if (normalizedQuestion.includes("focus") || normalizedQuestion.includes("priority")) {
    return [
      "1. I could not reach the model provider, so this is a local fallback reply.",
      focus.length > 0 ? `2. Your current saved focus items are:\n${focus.join("\n")}` : "2. You do not have any current focus items saved yet.",
      "3. Keep one active high-priority focus item and make the next step concrete and time-bound."
    ].join("\n");
  }

  return [
    "1. I could not reach the model provider, so this is a local fallback reply.",
    skills ? `2. ${skills}` : "2. Your profile does not have saved skills yet, so the advice here is generic.",
    focus.length > 0 ? `3. Current focus:\n${focus.join("\n")}` : "3. Add profile details, focus items, entries, or a resume to make chatbot answers more specific."
  ].join("\n");
}

function buildGeminiContents(body: AssistantRequest, prompt: string) {
  const history = (body.messages ?? []).slice(-6);

  return [
    ...history.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }]
    })),
    {
      role: "user",
      parts: [{ text: prompt }]
    }
  ];
}

function buildOpenAIInput(body: AssistantRequest, prompt: string) {
  const history = (body.messages ?? []).slice(-6);

  return [
    ...history.map((message) => ({
      role: message.role,
      content: [{ type: "input_text", text: message.content }]
    })),
    {
      role: "user",
      content: [{ type: "input_text", text: prompt }]
    }
  ];
}

function extractGeminiText(payload: GeminiResponse): string {
  const parts =
    payload.candidates?.flatMap((candidate) => candidate.content?.parts?.map((part) => part.text ?? "").filter(Boolean) ?? []) ?? [];

  return parts.join("\n").trim();
}

function extractOpenAIText(payload: OpenAIResponse): string {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const parts =
    payload.output
      ?.flatMap((item) =>
        item.type === "message"
          ? (item.content ?? [])
              .filter((content) => content.type === "output_text" && typeof content.text === "string")
              .map((content) => content.text ?? "")
          : []
      )
      .filter(Boolean) ?? [];

  return parts.join("\n").trim();
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function isHighDemandMessage(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("high demand") ||
    normalized.includes("overloaded") ||
    normalized.includes("unavailable") ||
    normalized.includes("try again later") ||
    normalized.includes("timed out") ||
    normalized.includes("rate limit") ||
    normalized.includes("quota")
  );
}

async function callGemini(apiKey: string, model: string, body: AssistantRequest, prompt: string): Promise<ProviderResult> {
  const requestBody = JSON.stringify({
    system_instruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }]
    },
    contents: buildGeminiContents(body, prompt)
  });

  let lastStatus = 503;
  let lastMessage = "Gemini request failed.";

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: requestBody,
        signal: controller.signal
      });

      const rawBody = await response.text();
      const payload = rawBody ? (JSON.parse(rawBody) as GeminiResponse) : {};

      if (response.ok) {
        const answer = extractGeminiText(payload);
        if (answer) {
          return { ok: true, answer, provider: "gemini" };
        }

        return {
          ok: false,
          provider: "gemini",
          status: 500,
          message: "Gemini returned an empty response.",
          retryable: false
        };
      }

      lastStatus = response.status;
      lastMessage = payload.error?.message?.trim() || `Gemini request failed: ${response.status}`;
      const retryable = RETRYABLE_STATUS_CODES.has(response.status) || isHighDemandMessage(lastMessage);

      if (attempt < 2 && retryable) {
        await sleep(800 * (attempt + 1));
        continue;
      }

      return {
        ok: false,
        provider: "gemini",
        status: response.status,
        message: lastMessage,
        retryable
      };
    } catch (error) {
      const message =
        error instanceof Error && error.name === "AbortError"
          ? "Gemini request timed out during high demand."
          : "Gemini request failed before a response was received.";
      lastMessage = message;
      lastStatus = 503;

      if (attempt < 2) {
        await sleep(800 * (attempt + 1));
        continue;
      }

      return {
        ok: false,
        provider: "gemini",
        status: lastStatus,
        message,
        retryable: true
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return {
    ok: false,
    provider: "gemini",
    status: lastStatus,
    message: lastMessage,
    retryable: true
  };
}

async function callOpenAI(apiKey: string, model: string, body: AssistantRequest, prompt: string): Promise<ProviderResult> {
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        input: buildOpenAIInput(body, prompt),
        instructions: SYSTEM_INSTRUCTION,
        text: {
          verbosity: "medium"
        }
      })
    });

    const rawBody = await response.text();
    const payload = rawBody ? (JSON.parse(rawBody) as OpenAIResponse) : {};

    if (!response.ok) {
      const message = payload.error?.message?.trim() || `OpenAI request failed: ${response.status}`;
      return {
        ok: false,
        provider: "openai",
        status: response.status,
        message,
        retryable: RETRYABLE_STATUS_CODES.has(response.status) || isHighDemandMessage(message)
      };
    }

    const answer = extractOpenAIText(payload);
    if (!answer) {
      return {
        ok: false,
        provider: "openai",
        status: 500,
        message: "OpenAI returned an empty response.",
        retryable: false
      };
    }

    return { ok: true, answer, provider: "openai" };
  } catch {
    return {
      ok: false,
      provider: "openai",
      status: 503,
      message: "OpenAI request failed before a response was received.",
      retryable: true
    };
  }
}

export async function POST(request: Request) {
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
  const openaiApiKey = process.env.OPENAI_API_KEY?.trim();

  const body = (await request.json()) as AssistantRequest;
  const question = body.question?.trim();

  if (!question) {
    return NextResponse.json({ error: "Question is required." }, { status: 400 });
  }

  const context = body.context?.trim() ?? "";
  const prompt = buildPrompt(question, context);
  const geminiModel = process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash";
  const openaiModel = process.env.OPENAI_MODEL?.trim() || "gpt-5.5";
  const hasGemini = !isPlaceholderKey(geminiApiKey);
  const hasOpenAI = !isPlaceholderKey(openaiApiKey);

  if (!hasGemini && !hasOpenAI) {
    return NextResponse.json({ answer: buildLocalFallback(question, context), provider: "fallback" });
  }

  if (hasGemini) {
    const geminiResult = await callGemini(geminiApiKey!, geminiModel, body, prompt);
    if (geminiResult.ok) {
      return NextResponse.json({ answer: geminiResult.answer, provider: geminiResult.provider });
    }

    if (hasOpenAI && geminiResult.retryable) {
      const openaiResult = await callOpenAI(openaiApiKey!, openaiModel, body, prompt);
      if (openaiResult.ok) {
        return NextResponse.json({ answer: openaiResult.answer, provider: openaiResult.provider });
      }

      return NextResponse.json({ answer: buildLocalFallback(question, context), provider: "fallback" });
    }

    return NextResponse.json({ answer: buildLocalFallback(question, context), provider: "fallback" });
  }

  const openaiResult = await callOpenAI(openaiApiKey!, openaiModel, body, prompt);
  if (openaiResult.ok) {
    return NextResponse.json({ answer: openaiResult.answer, provider: openaiResult.provider });
  }

  return NextResponse.json({ answer: buildLocalFallback(question, context), provider: "fallback" });
}
