import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Bot, Copy, Loader2, MessageSquare, RotateCcw, SendHorizonal, User } from "lucide-react";
import { toast } from "sonner";
import { generateTextWithProvider } from "@/lib/ai/runtime";
import { AIProviderConsole } from "./provider-console";
import { useAIProviderSettings } from "./use-ai-provider-settings";
import { ToolChoiceGrid, ToolPanel, ToolWorkbench } from "./tool-workbench";

type Mode = "general" | "code" | "creative" | "analysis";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const suggestions: Record<Mode, string[]> = {
  general: ["Summarize what SnapTools does in two sentences.", "What should I test before a release?"],
  code: ["Explain debounce vs throttle.", "How would you structure a retry helper?"],
  creative: ["Give me three launch slogans.", "Rewrite this intro to sound sharper."],
  analysis: ["What metrics should a tools page track?", "How do I compare two rollout options?"],
};

const modeInstructions: Record<Mode, string> = {
  general: "Answer clearly and directly. Optimize for usefulness over flourish.",
  code: "Answer like a senior engineer. Be concrete and implementation-oriented.",
  creative: "Answer with stronger phrasing, more originality, and clean readability.",
  analysis: "Answer with frameworks, tradeoffs, and crisp decision support.",
};

const AiChatbot = () => {
  const [mode, setMode] = useState<Mode>("general");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "AI workspace ready. Choose a provider, pick a mode, and send a prompt.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { settings, setSettings } = useAIProviderSettings();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (nextDraft?: string) => {
    const prompt = (nextDraft ?? draft).trim();
    if (!prompt) return;

    const userMessage: Message = { id: Date.now(), role: "user", content: prompt };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setDraft("");
    setIsSending(true);

    try {
      const reply = await generateTextWithProvider({
        settings,
        temperature: mode === "creative" ? 0.9 : 0.5,
        maxOutputTokens: 900,
        messages: [
          {
            role: "system",
            content: `You are SnapTools AI. ${modeInstructions[mode]}`,
          },
          ...nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        ],
      });

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Message failed.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <ToolWorkbench
        icon={MessageSquare}
        eyebrow="AI Chatbot"
        title="Use a provider-backed assistant instead of a local mock responder."
        description="This chat workspace now runs through the model you choose, while keeping the key in the browser."
        badges={["Conversation history", "Mode presets", "Bring your own provider"]}
        metrics={[
          { label: "Messages", value: messages.length },
          { label: "Mode", value: mode },
          { label: "Draft chars", value: draft.length },
        ]}
        aside={<AIProviderConsole settings={settings} onChange={setSettings} />}
      >
        <ToolPanel
          title="Conversation"
          description="Write a prompt, send it, and the selected provider will respond."
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMessages([
                  {
                    id: 1,
                    role: "assistant",
                    content: "AI workspace ready. Choose a provider, pick a mode, and send a prompt.",
                  },
                ]);
                setDraft("");
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          }
        >
          <div className="space-y-4">
            <ToolChoiceGrid
              label="Mode"
              value={mode}
              onChange={setMode}
              columns="2"
              options={[
                { value: "general", title: "General", description: "Straight answers for everyday prompts." },
                { value: "code", title: "Code", description: "Sharper engineering and implementation help." },
                { value: "creative", title: "Creative", description: "Higher-voice writing and ideation." },
                { value: "analysis", title: "Analysis", description: "Tradeoffs, frameworks, and decision support." },
              ]}
            />
            <div className="max-h-[420px] space-y-3 overflow-auto rounded-3xl border border-black/5 bg-white/70 p-4 shadow-inner dark:border-white/10 dark:bg-white/[0.03]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-7 shadow-sm ${
                      message.role === "assistant"
                        ? "border border-black/5 bg-background dark:border-white/10"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] opacity-70">
                      {message.role === "assistant" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                      {message.role}
                    </div>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 px-2 text-xs"
                      onClick={() => navigator.clipboard.writeText(message.content).then(() => toast.success("Message copied."))}
                    >
                      <Copy className="mr-2 h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                </div>
              ))}
              {isSending ? (
                <div className="flex justify-start">
                  <div className="rounded-3xl border border-black/5 bg-background px-4 py-3 text-sm shadow-sm dark:border-white/10">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Waiting for the selected provider...
                    </div>
                  </div>
                </div>
              ) : null}
              <div ref={endRef} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chat-input">Prompt</Label>
              <Textarea
                id="chat-input"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask a question or describe what you need..."
                className="min-h-[120px] rounded-3xl border-black/10 bg-white/80 text-sm leading-7 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Frontend-only chat is private from SnapTools, but some hosted providers may still block direct browser calls.
              </p>
              <Button onClick={() => sendMessage()} disabled={isSending || !draft.trim()} className="rounded-2xl px-6">
                {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SendHorizonal className="mr-2 h-4 w-4" />}
                Send prompt
              </Button>
            </div>
          </div>
        </ToolPanel>
      </ToolWorkbench>
    </div>
  );
};

export default AiChatbot;
