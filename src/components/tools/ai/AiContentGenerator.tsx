import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, FileText, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  ToolCodeBlock,
  ToolMetricGrid,
  ToolPanel,
  ToolTagList,
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

  const generateContent = async () => {
    if (!topic.trim()) {
      toast.error("Add a topic before generating.");
      return;
    }

    setIsGenerating(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 950));

      const keywordLine = keywords
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .join(", ");
      const voice =
        tone === "professional"
          ? "measured and confident"
          : tone === "casual"
            ? "direct and relaxed"
            : tone === "friendly"
              ? "warm and helpful"
              : "decisive and high-conviction";
      const scope =
        length === "short"
          ? "Keep the piece tight and immediately actionable."
          : length === "medium"
            ? "Give enough structure for someone to publish with light editing."
            : "Expand the message with sections, examples, and a stronger close.";

      const sections =
        contentType === "blog"
          ? [
              `# ${topic}`,
              `## Opening angle\n${topic} matters because teams need faster, cleaner ways to move from raw input to a useful outcome. This draft uses a ${voice} voice and is designed to read like a practical blog entry.`,
              `## Core takeaways\n- Establish the problem quickly.\n- Show where the workflow slows down today.\n- Explain how a better system changes the day-to-day experience.`,
              `## What to emphasize\nFocus on adoption friction, workflow clarity, and the speed advantage of keeping everything in one browser-based environment.`,
              `## Closing thought\nEnd with a next step that feels low-risk and easy to try.`,
            ]
          : contentType === "article"
            ? [
                `# ${topic}`,
                `## Thesis\nThis article argues that ${topic.toLowerCase()} is moving from a nice-to-have into core infrastructure for modern digital teams.`,
                `## Context\nFrame the market shift, the user pressure, and the operational gap the reader should care about.`,
                `## Analysis\nBreak the topic into adoption, trust, cost, and workflow impact.`,
                `## Conclusion\nFinish with the implication: teams that simplify the workflow compound speed over time.`,
              ]
            : contentType === "product"
              ? [
                  `# ${topic}`,
                  `## Positioning\nA ${voice} product description should make the value obvious within the first two lines.`,
                  `## Feature framing\n- Faster setup\n- Lower workflow friction\n- Cleaner outputs\n- Reliable browser-side execution`,
                  `## CTA\nInvite the reader to try the product immediately with a clear value promise.`,
                ]
              : contentType === "social"
                ? [
                    `${topic}\n\nA short social version should lead with one strong point, then stack two or three proof beats underneath.`,
                    `Hook: The easiest way to remove friction from everyday browser utility work.`,
                    `Support: Faster tasks, fewer tabs, cleaner handoffs.`,
                    `CTA: Try it, compare it, and keep what saves real time.`,
                  ]
                : [
                    `Subject: ${topic}`,
                    `Hi team,\n\nHere is the short version: ${topic.toLowerCase()} should be easier to ship, easier to explain, and faster to adopt.`,
                    `Why it matters:\n- Less friction in the workflow\n- Faster time to value\n- Clearer output for the recipient`,
                    `Close with a direct CTA and one line that reduces hesitation.`,
                  ];

      const generated = [
        ...sections,
        keywordLine ? `## Keywords to weave in\n${keywordLine}` : "",
        `## Production notes\nVoice: ${voice}. ${scope}`,
      ]
        .filter(Boolean)
        .join("\n\n");

      setGeneratedContent(generated);
      toast.success("Draft generated.");
    } catch {
      toast.error("The content pass did not finish.");
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
        title="Shape a working draft before you move to full model generation."
        description="Use the workbench to set format, tone, and intent, then generate a structured draft that already fits the delivery channel."
        badges={["Channel presets", "Tone control", "Keyword steering"]}
        metrics={[
          { label: "Draft words", value: wordCount },
          { label: "Format", value: contentType },
          { label: "Voice", value: tone },
        ]}
        aside={
          <div className="space-y-4">
            <ToolPanel title="Output profile" description="Set the container first, then tune how assertive or expansive the writing should feel.">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <div className="flex flex-wrap gap-2">
                    {tones.map((value) => (
                      <Badge
                        key={value}
                        variant={tone === value ? "default" : "outline"}
                        className="cursor-pointer rounded-full px-3 py-1 capitalize"
                        onClick={() => setTone(value)}
                      >
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Length</Label>
                  <div className="flex flex-wrap gap-2">
                    {lengths.map((value) => (
                      <Badge
                        key={value}
                        variant={length === value ? "default" : "outline"}
                        className="cursor-pointer rounded-full px-3 py-1 capitalize"
                        onClick={() => setLength(value)}
                      >
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </ToolPanel>
            <ToolPanel title="Strong use cases" description="This draft mode works best as a pre-production content accelerator.">
              <ToolTagList tags={["Launch notes", "SEO briefs", "Product pages", "Newsletter starts", "Social hooks", "Article outlines"]} />
            </ToolPanel>
          </div>
        }
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
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {contentTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setContentType(type.value)}
                  className={`rounded-3xl border p-4 text-left transition-all ${
                    contentType === type.value
                      ? "border-primary/30 bg-primary/5 shadow-sm"
                      : "border-black/5 bg-white/70 hover:border-primary/20 dark:border-white/10 dark:bg-white/[0.03]"
                  }`}
                >
                  <div className="text-sm font-bold">{type.label}</div>
                  <div className="mt-2 text-xs leading-5 text-muted-foreground">{type.description}</div>
                </button>
              ))}
            </div>
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
          description="Structured output you can refine further or hand to a model-backed writing stage."
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
