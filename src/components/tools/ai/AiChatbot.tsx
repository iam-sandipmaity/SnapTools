import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bot, Copy, Loader2, MessageSquare, RotateCcw, SendHorizonal, User } from "lucide-react";
import { toast } from "sonner";
import { ToolPanel, ToolTagList, ToolWorkbench } from "./tool-workbench";

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

const createResponse = (mode: Mode, prompt: string) => {
  const shortPrompt = prompt.trim();

  if (mode === "code") {
    return `Here is the coding read on "${shortPrompt}":\n\n1. Start by defining the core input and output.\n2. Separate pure transformation logic from side effects.\n3. Add one fast example or test so behavior is obvious.\n\nIf you want, I can turn this into a starter implementation next.`;
  }

  if (mode === "creative") {
    return `A more creative angle for "${shortPrompt}" would be:\n\n• Lead with contrast instead of features.\n• Use one strong image or metaphor.\n• End with a small, low-friction action.\n\nThat keeps the message vivid without losing clarity.`;
  }

  if (mode === "analysis") {
    return `Quick analysis for "${shortPrompt}":\n\n• Decision lens: speed, trust, maintenance cost.\n• Main risk: solving the surface issue while leaving workflow friction intact.\n• Next step: compare the smallest viable change against the most durable one.`;
  }

  return `Here is the short answer for "${shortPrompt}":\n\nFocus on the user's next action, remove avoidable friction, and make the outcome legible within a few seconds. When the interface is calm and the path is obvious, adoption goes up fast.`;
};

const AiChatbot = () => {
  const [mode, setMode] = useState<Mode>("general");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "Local assistant ready. Pick a mode, ask a question, and I will respond with a structured demo answer.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (nextDraft?: string) => {
    const prompt = (nextDraft ?? draft).trim();
    if (!prompt) return;

    const userMessage: Message = { id: Date.now(), role: "user", content: prompt };
    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setIsSending(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: createResponse(mode, prompt),
      };
      setMessages((current) => [...current, assistantMessage]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <ToolWorkbench
        icon={MessageSquare}
        eyebrow="AI Chatbot"
        title="Use a compact local assistant to sketch answers and next steps."
        description="This chat workspace is tuned for short, mode-based demo responses so the UI feels like a real operator console instead of a generic form."
        badges={["Conversation history", "Mode presets", "Quick prompts"]}
        metrics={[
          { label: "Messages", value: messages.length },
          { label: "Mode", value: mode },
          { label: "Draft chars", value: draft.length },
        ]}
        aside={
          <div className="space-y-4">
            <ToolPanel title="Modes" description="Shift the assistant's stance based on the type of help you need.">
              <div className="flex flex-wrap gap-2">
                {(["general", "code", "creative", "analysis"] as const).map((value) => (
                  <Badge
                    key={value}
                    variant={mode === value ? "default" : "outline"}
                    className="cursor-pointer rounded-full px-3 py-1 capitalize"
                    onClick={() => setMode(value)}
                  >
                    {value}
                  </Badge>
                ))}
              </div>
            </ToolPanel>
            <ToolPanel title="Suggested prompts" description="Use one to see the response style immediately.">
              <div className="space-y-2">
                {suggestions[mode].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setDraft(prompt);
                      toast.success("Prompt loaded into the composer.");
                    }}
                    className="w-full rounded-2xl border border-black/5 bg-white/70 px-4 py-3 text-left text-sm shadow-sm transition-colors hover:border-primary/20 hover:bg-primary/5 dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </ToolPanel>
            <ToolPanel title="Great for" description="Treat this as a local response sandbox before model integration.">
              <ToolTagList tags={["Answer framing", "Support macros", "Reasoning scaffolds", "Prompt testing"]} />
            </ToolPanel>
          </div>
        }
      >
        <ToolPanel
          title="Conversation"
          description="Write a prompt, send it, and the local responder will return a mode-aware answer."
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMessages([
                  {
                    id: 1,
                    role: "assistant",
                    content: "Local assistant ready. Pick a mode, ask a question, and I will respond with a structured demo answer.",
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
                      Thinking through a response...
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
                Enter sends a message only when you press the button, so you can draft multi-line prompts without interruption.
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
