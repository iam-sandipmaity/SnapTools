export type AIProviderId =
  | "openai"
  | "anthropic"
  | "gemini"
  | "groq"
  | "xai"
  | "deepseek"
  | "zai"
  | "ollama"
  | "openai-compatible";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AIProviderSettings = {
  provider: AIProviderId;
  apiKey: string;
  model: string;
  baseUrl: string;
  rememberKey: boolean;
};

type ProviderDescriptor = {
  id: AIProviderId;
  label: string;
  defaultModel: string;
  defaultBaseUrl: string;
  apiKeyLabel: string;
  requiresApiKey: boolean;
  notes: string;
};

type UnknownRecord = Record<string, unknown>;

export const AI_PROVIDER_STORAGE_KEY = "snaptools.ai.provider-settings";

export const AI_PROVIDERS: ProviderDescriptor[] = [
  {
    id: "openai",
    label: "OpenAI",
    defaultModel: "gpt-5-mini",
    defaultBaseUrl: "https://api.openai.com",
    apiKeyLabel: "OpenAI API key",
    requiresApiKey: true,
    notes: "Uses the Responses API from the browser. Best for general writing, coding, and chat.",
  },
  {
    id: "anthropic",
    label: "Claude / Anthropic",
    defaultModel: "claude-sonnet-4-5",
    defaultBaseUrl: "https://api.anthropic.com",
    apiKeyLabel: "Anthropic API key",
    requiresApiKey: true,
    notes: "Uses the Messages API. Strong for reasoning, editorial work, and code explanations.",
  },
  {
    id: "gemini",
    label: "Gemini",
    defaultModel: "gemini-2.5-flash",
    defaultBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
    apiKeyLabel: "Gemini API key",
    requiresApiKey: true,
    notes: "Uses Gemini generateContent. Good browser fit, but response formatting can vary by model.",
  },
  {
    id: "groq",
    label: "Groq",
    defaultModel: "llama-3.3-70b-versatile",
    defaultBaseUrl: "https://api.groq.com/openai/v1",
    apiKeyLabel: "Groq API key",
    requiresApiKey: true,
    notes: "OpenAI-compatible chat endpoint with very fast latency.",
  },
  {
    id: "xai",
    label: "Grok / xAI",
    defaultModel: "grok-4-fast-reasoning",
    defaultBaseUrl: "https://api.x.ai/v1",
    apiKeyLabel: "xAI API key",
    requiresApiKey: true,
    notes: "Uses xAI chat completions. Great if the user already has Grok credits.",
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    defaultModel: "deepseek-chat",
    defaultBaseUrl: "https://api.deepseek.com/v1",
    apiKeyLabel: "DeepSeek API key",
    requiresApiKey: true,
    notes: "OpenAI-style chat endpoint. Strong value choice for summarization and coding.",
  },
  {
    id: "zai",
    label: "Z.AI / GLM",
    defaultModel: "glm-4.5-flash",
    defaultBaseUrl: "https://api.z.ai/api/paas/v4",
    apiKeyLabel: "Z.AI API key",
    requiresApiKey: true,
    notes: "Uses Z.AI chat completions with Bearer auth.",
  },
  {
    id: "ollama",
    label: "Ollama",
    defaultModel: "llama3.2",
    defaultBaseUrl: "http://localhost:11434",
    apiKeyLabel: "No key required",
    requiresApiKey: false,
    notes: "Runs against a local Ollama server for the strongest privacy, if the browser can reach it.",
  },
  {
    id: "openai-compatible",
    label: "Custom OpenAI-Compatible",
    defaultModel: "gpt-4o-mini",
    defaultBaseUrl: "https://api.openai.com/v1",
    apiKeyLabel: "Provider API key",
    requiresApiKey: true,
    notes: "Use this for OpenRouter or any provider that exposes an OpenAI-style chat endpoint.",
  },
];

export const DEFAULT_PROVIDER_SETTINGS: AIProviderSettings = {
  provider: "groq",
  apiKey: "",
  model: "llama-3.3-70b-versatile",
  baseUrl: "https://api.groq.com/openai/v1",
  rememberKey: false,
};

export function getProviderMeta(providerId: AIProviderId) {
  return AI_PROVIDERS.find((provider) => provider.id === providerId) ?? AI_PROVIDERS[0];
}

function normalizeBaseUrl(baseUrl: string, fallback: string) {
  const value = baseUrl.trim() || fallback;
  return value.replace(/\/+$/, "");
}

function getRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function parseOpenAIResponsesText(payload: unknown) {
  const root = getRecord(payload);
  const outputText = getString(root.output_text).trim();

  if (outputText) {
    return outputText;
  }

  const chunks: string[] = [];

  const output = Array.isArray(root.output) ? root.output : [];

  for (const item of output) {
    const contentList = Array.isArray(getRecord(item).content) ? (getRecord(item).content as unknown[]) : [];
    for (const content of contentList) {
      const contentRecord = getRecord(content);
      const text = getString(contentRecord.text || contentRecord.output_text).trim();
      if (text) {
        chunks.push(text);
      }
    }
  }

  return chunks.join("\n\n").trim();
}

function parseChatCompletionText(payload: unknown) {
  const root = getRecord(payload);
  const choices = Array.isArray(root.choices) ? root.choices : [];
  const firstChoice = getRecord(choices[0]);
  const message = getRecord(firstChoice.message);
  const content = message.content;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        const entry = getRecord(item);
        return getString(entry.text || entry.content);
      })
      .filter((value) => Boolean(value))
      .join("\n")
      .trim();
  }

  return "";
}

function parseAnthropicText(payload: unknown) {
  const root = getRecord(payload);
  const content = Array.isArray(root.content) ? root.content : [];

  return content
    .map((item) => {
      const entry = getRecord(item);
      return entry.type === "text" ? getString(entry.text) : "";
    })
    .filter((value) => Boolean(value))
    .join("\n")
    .trim();
}

function parseGeminiText(payload: unknown) {
  const root = getRecord(payload);
  const candidates = Array.isArray(root.candidates) ? root.candidates : [];
  const firstCandidate = getRecord(candidates[0]);
  const content = getRecord(firstCandidate.content);
  const parts = Array.isArray(content.parts) ? content.parts : [];

  return parts
    .map((part) => getString(getRecord(part).text))
    .filter((value) => Boolean(value))
    .join("\n")
    .trim();
}

function parseOllamaText(payload: unknown) {
  const root = getRecord(payload);
  const message = getRecord(root.message);
  return getString(message.content).trim();
}

function toOpenAIChatMessages(messages: ChatMessage[]) {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

function toAnthropicMessages(messages: ChatMessage[]) {
  const systemMessages = messages.filter((message) => message.role === "system");
  const conversationalMessages = messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));

  return {
    system: systemMessages.map((message) => message.content).join("\n\n").trim(),
    messages: conversationalMessages,
  };
}

function toGeminiPayload(messages: ChatMessage[]) {
  const systemInstruction = messages
    .filter((message) => message.role === "system")
    .map((message) => message.content)
    .join("\n\n")
    .trim();

  const contents = messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

  return {
    ...(systemInstruction
      ? {
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
        }
      : {}),
    contents,
  };
}

export function loadProviderSettings(): AIProviderSettings {
  if (typeof window === "undefined") {
    return DEFAULT_PROVIDER_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(AI_PROVIDER_STORAGE_KEY);
    if (!raw) return DEFAULT_PROVIDER_SETTINGS;

    const parsed = JSON.parse(raw) as Partial<AIProviderSettings>;
    const providerMeta = getProviderMeta(parsed.provider ?? DEFAULT_PROVIDER_SETTINGS.provider);

    return {
      provider: parsed.provider ?? DEFAULT_PROVIDER_SETTINGS.provider,
      apiKey: parsed.apiKey ?? "",
      model: parsed.model?.trim() || providerMeta.defaultModel,
      baseUrl: parsed.baseUrl?.trim() || providerMeta.defaultBaseUrl,
      rememberKey: Boolean(parsed.rememberKey),
    };
  } catch {
    return DEFAULT_PROVIDER_SETTINGS;
  }
}

export function persistProviderSettings(settings: AIProviderSettings) {
  if (typeof window === "undefined") return;

  if (!settings.rememberKey) {
    window.localStorage.removeItem(AI_PROVIDER_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AI_PROVIDER_STORAGE_KEY, JSON.stringify(settings));
}

export async function generateTextWithProvider({
  settings,
  messages,
  temperature = 0.4,
  maxOutputTokens = 1200,
}: {
  settings: AIProviderSettings;
  messages: ChatMessage[];
  temperature?: number;
  maxOutputTokens?: number;
}) {
  const providerMeta = getProviderMeta(settings.provider);
  const provider = settings.provider;
  const model = settings.model.trim() || providerMeta.defaultModel;
  const baseUrl = normalizeBaseUrl(settings.baseUrl, providerMeta.defaultBaseUrl);
  const apiKey = settings.apiKey.trim();

  if (providerMeta.requiresApiKey && !apiKey) {
    throw new Error(`Add your ${providerMeta.apiKeyLabel.toLowerCase()} to continue.`);
  }

  try {
    if (provider === "openai") {
      const response = await fetch(`${baseUrl}/v1/responses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          input: messages.map((message) => ({
            role: message.role,
            content: [{ type: "input_text", text: message.content }],
          })),
          max_output_tokens: maxOutputTokens,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error?.message || `OpenAI request failed with status ${response.status}.`);
      }

      return parseOpenAIResponsesText(payload);
    }

    if (provider === "anthropic") {
      const prepared = toAnthropicMessages(messages);
      const response = await fetch(`${baseUrl}/v1/messages`, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: maxOutputTokens,
          system: prepared.system || undefined,
          messages: prepared.messages,
          temperature,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error?.message || `Anthropic request failed with status ${response.status}.`);
      }

      return parseAnthropicText(payload);
    }

    if (provider === "gemini") {
      const prepared = toGeminiPayload(messages);
      const response = await fetch(`${baseUrl}/models/${model}:generateContent`, {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...prepared,
          generationConfig: {
            temperature,
            maxOutputTokens,
          },
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error?.message || `Gemini request failed with status ${response.status}.`);
      }

      return parseGeminiText(payload);
    }

    if (provider === "ollama") {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: toOpenAIChatMessages(messages),
          stream: false,
          options: {
            temperature,
            num_predict: maxOutputTokens,
          },
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || `Ollama request failed with status ${response.status}.`);
      }

      return parseOllamaText(payload);
    }

    const openAICompatibleUrl =
      provider === "zai" ? `${baseUrl}/chat/completions` : `${baseUrl}/chat/completions`;

    const extraHeaders =
      provider === "zai"
        ? { "Accept-Language": "en-US,en" }
        : {};

    const response = await fetch(openAICompatibleUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...extraHeaders,
      },
      body: JSON.stringify({
        model,
        messages: toOpenAIChatMessages(messages),
        temperature,
        max_tokens: maxOutputTokens,
        stream: false,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const nestedError =
        payload?.error?.message ||
        payload?.message ||
        payload?.msg ||
        `Request failed with status ${response.status}.`;
      throw new Error(nestedError);
    }

    return parseChatCompletionText(payload);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `The browser could not reach ${providerMeta.label}. This is often a CORS or local-network restriction with frontend-only AI calls.`,
      );
    }

    throw error;
  }
}

export function extractJsonObject<T>(value: string): T | null {
  const direct = value.trim();

  try {
    return JSON.parse(direct) as T;
  } catch {
    // continue
  }

  const codeFenceMatch = direct.match(/```json\s*([\s\S]*?)```/i) ?? direct.match(/```\s*([\s\S]*?)```/i);
  const candidate = codeFenceMatch?.[1] ?? direct.slice(direct.indexOf("{"), direct.lastIndexOf("}") + 1);

  if (!candidate || !candidate.includes("{")) {
    return null;
  }

  try {
    return JSON.parse(candidate) as T;
  } catch {
    return null;
  }
}
