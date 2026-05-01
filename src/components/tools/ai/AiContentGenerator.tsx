import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Copy, FileText, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { generateTextWithProvider } from "@/lib/ai/runtime";
import { AIProviderConsole } from "./provider-console";
import { useAIProviderSettings } from "./use-ai-provider-settings";
import {
  ToolChoiceGrid,
  ToolCodeBlock,
  ToolMetricGrid,
  ToolPanel,
  ToolWorkbench,
} from "./tool-workbench";

const contentTypes = [
  { value: "blog", label: "Blog post", description: "Structured educational writing" },
  { value: "article", label: "Article", description: "More editorial and analytical" },
  { value: "product", label: "Product copy", description: "Positioning and value framing" },
  { value: "social", label: "Social post", description: "Short, punchy, distribution-ready" },
  { value: "email", label: "Email", description: "Clear subject, body, and CTA" },
] as const;

const tones = ["professional", "casual", "friendly", "authoritative"] as const;
const lengths = ["short", "medium", "long"] as const;

const sampleTopics: Record<(typeof contentTypes)[number]["value"], string> = {
  blog: "How browser-based utility suites reduce context switching for teams",
  article: "Why privacy-first online tools are gaining traction in modern workflows",
  product: "A browser toolkit for PDFs, images, and text cleanup",
  social: "Launching a faster way to handle daily browser utilities",
  email: "A product update introducing new operator-friendly tools",
};

const AiContentGenerator = () => {
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState<(typeof contentTypes)[number]["value"]>("blog");
  const [tone, setTone] = useState<(typeof tones)[number]>("professional");
  const [length, setLength] = useState<(typeof lengths)[number]>("medium");
  const [keywords, setKeywords] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { settings, setSettings } = useAIProviderSettings();

  const generateContent = async () => {
    if (!topic.trim()) {
      toast.error("Add a topic before generating.");
      return;
    }

    setIsGenerating(true);

    try {
      const generated = await generateTextWithProvider({
        settings,
        temperature: contentType === "social" ? 0.9 : 0.7,
        maxOutputTokens: length === "short" ? 420 : length === "medium" ? 900 : 1400,
        messages: [
          {
            role: "system",
            content:
              "You are a senior content strategist. Write usable content directly, match the requested channel, and return only the draft.",
          },
          {
            role: "user",
            content: `Create ${contentType} content.\n\nTopic: ${topic}\nTone: ${tone}\nLength: ${length}\nKeywords or angles: ${keywords || "none supplied"}\n\nRequirements:\n- Fit the selected channel exactly\n- Use clear structure when appropriate\n- Include a strong opening and a useful close\n- Avoid placeholder text`,
          },
        ],
      });

      setGeneratedContent(generated);
      toast.success("Draft generated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The content pass did not finish.");
    } finally {
      setIsGenerating(false);
    }
  };

  const wordCount = generatedContent.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <ToolWorkbench
        icon={FileText}
        eyebrow="AI Content Generator"
        title="Shape a working draft with a real model instead of a placeholder template."
        description="Set the format, tone, and intent, then generate a draft that already fits the delivery channel."
        badges={["Channel presets", "Tone control", "Keyword steering"]}
        metrics={[
          { label: "Draft words", value: wordCount },
          { label: "Format", value: contentType },
          { label: "Voice", value: tone },
        ]}
        aside={<AIProviderConsole settings={settings} onChange={setSettings} />}
      >
        <ToolPanel
          title="Content brief"
          description="Pick the channel, define the topic, and optionally seed the draft with keywords you want the final version to include."
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTopic(sampleTopics[contentType]);
                setKeywords("workflow automation, browser utilities, privacy-first tools");
                toast.success("Example brief loaded.");
              }}
            >
              Load sample
            </Button>
          }
        >
          <div className="space-y-5">
            <ToolChoiceGrid
              label="Content type"
              value={contentType}
              onChange={setContentType}
              columns="5"
              options={contentTypes.map((type) => ({
                value: type.value,
                title: type.label,
                description: type.description,
              }))}
            />
            <ToolChoiceGrid
              label="Tone"
              value={tone}
              onChange={setTone}
              columns="2"
              options={[
                { value: "professional", title: "Professional", description: "Measured, clean, and credible." },
                { value: "casual", title: "Casual", description: "Relaxed and more conversational." },
                { value: "friendly", title: "Friendly", description: "Warm and approachable without losing clarity." },
                { value: "authoritative", title: "Authoritative", description: "More conviction and stronger positioning." },
              ]}
            />
            <ToolChoiceGrid
              label="Length"
              value={length}
              onChange={setLength}
              columns="3"
              options={[
                { value: "short", title: "Short", description: "Quick draft with minimal expansion." },
                { value: "medium", title: "Medium", description: "Balanced structure for most use cases." },
                { value: "long", title: "Long", description: "More detail, examples, and development." },
              ]}
            />
            <div className="space-y-2">
              <Label htmlFor="topic">Topic or subject</Label>
              <Textarea
                id="topic"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Describe what you want the content to cover..."
                className="min-h-[120px] rounded-3xl border-black/10 bg-white/80 text-sm leading-7 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords or angles</Label>
              <Textarea
                id="keywords"
                value={keywords}
                onChange={(event) => setKeywords(event.target.value)}
                placeholder="Optional comma-separated terms to reinforce..."
                className="min-h-[90px] rounded-3xl border-black/10 bg-white/80 text-sm leading-7 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTopic("");
                  setKeywords("");
                  setGeneratedContent("");
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button onClick={generateContent} disabled={isGenerating || !topic.trim()} className="rounded-2xl px-6">
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate draft
              </Button>
            </div>
          </div>
        </ToolPanel>
      </ToolWorkbench>

      {generatedContent ? (
        <ToolPanel
          title="Generated draft"
          description="Structured output you can refine further or move directly into editing."
          actions={
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(generatedContent).then(() => toast.success("Draft copied."))}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          }
        >
          <div className="space-y-5">
            <ToolCodeBlock value={generatedContent} className="max-h-none bg-slate-900" />
            <ToolMetricGrid
              metrics={[
                { label: "Target channel", value: contentType },
                { label: "Word count", value: wordCount },
                { label: "Approx. read", value: `${Math.max(1, Math.ceil(wordCount / 180))} min` },
              ]}
            />
          </div>
        </ToolPanel>
      ) : null}
    </div>
  );
};

export default AiContentGenerator;
