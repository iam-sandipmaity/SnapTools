import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { generateTextWithProvider } from "@/lib/ai/runtime";
import { AIProviderConsole } from "./provider-console";
import { useAIProviderSettings } from "./use-ai-provider-settings";
import { ToolChoiceGrid, ToolCodeBlock, ToolMetricGrid, ToolPanel, ToolTagList, ToolWorkbench } from "./tool-workbench";

const sampleText = `SnapTools helps teams move through browser-based utility work without sending every task to a desktop app. The platform brings PDF, image, text, and data workflows into one interface, which makes it easier to stay focused and avoid context switching. Teams usually reach for summarization when they need the key signal from a long brief, customer note, or technical article without reading every line twice. A strong summary should preserve meaning, surface action items, and cut repetition so the next decision becomes obvious.`;

const splitSentences = (text: string) => {
  const matches = text.match(/[^.!?\n]+[.!?]?/g) ?? [];
  return matches.map((part) => part.trim()).filter(Boolean);
};

const AiTextSummarizer = () => {
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryLength, setSummaryLength] = useState<"brief" | "balanced" | "detailed">("balanced");
  const [summaryFormat, setSummaryFormat] = useState<"paragraph" | "bullets" | "highlights">("paragraph");
  const { settings, setSettings } = useAIProviderSettings();

  const inputWords = inputText.trim().split(/\s+/).filter(Boolean);
  const summaryWords = summary.trim().split(/\s+/).filter(Boolean);
  const reduction =
    inputWords.length > 0
      ? Math.max(0, Math.round((1 - summaryWords.length / inputWords.length) * 100))
      : 0;

  const summarizeText = async () => {
    if (!inputText.trim()) {
      toast.error("Paste or type text before summarizing.");
      return;
    }

    setIsSummarizing(true);

    try {
      const nextSummary = await generateTextWithProvider({
        settings,
        temperature: 0.3,
        maxOutputTokens: summaryLength === "brief" ? 220 : summaryLength === "balanced" ? 420 : 700,
        messages: [
          {
            role: "system",
            content:
              "You are a precise summarization assistant. Preserve meaning, remove repetition, and never invent facts.",
          },
          {
            role: "user",
            content: `Summarize the following text.\n\nLength profile: ${summaryLength}.\nDelivery format: ${summaryFormat}.\n\nFormatting rules:\n- paragraph: one compact paragraph\n- bullets: a concise bullet list\n- highlights: a numbered list of the key points\n\nText:\n${inputText}`,
          },
        ],
      });

      setSummary(nextSummary);
      toast.success("Summary ready.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something interrupted the summary pass.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const clearAll = () => {
    setInputText("");
    setSummary("");
  };

  const loadSample = () => {
    setInputText(sampleText);
    toast.success("Sample text loaded.");
  };

  return (
    <div className="space-y-6">
      <ToolWorkbench
        icon={Sparkles}
        eyebrow="AI Summarizer"
        title="Condense long writing into a fast decision brief."
        description="Trim articles, meeting notes, and internal docs into a tighter output while keeping the highest-signal statements visible."
        badges={["Real provider calls", "Length presets", "Bullet or paragraph output"]}
        metrics={[
          { label: "Source words", value: inputWords.length, hint: "Live count from the input buffer." },
          { label: "Summary words", value: summaryWords.length, hint: "Updates after each generation pass." },
          { label: "Reduction", value: `${reduction}%`, hint: "Estimated shrink from source to output." },
        ]}
        aside={<AIProviderConsole settings={settings} onChange={setSettings} />}
      >
        <ToolPanel
          title="Source text"
          description="Paste a long passage, report section, or article excerpt. The selected provider will generate a compressed version with your chosen shape."
          actions={
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={loadSample}>
                Load sample
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <ToolChoiceGrid
              label="Length profile"
              value={summaryLength}
              onChange={setSummaryLength}
              columns="3"
              options={[
                { value: "brief", title: "Brief", description: "Fast skim with only the essentials." },
                { value: "balanced", title: "Balanced", description: "Compact, but still preserves context." },
                { value: "detailed", title: "Detailed", description: "More nuance and stronger coverage." },
              ]}
            />
            <ToolChoiceGrid
              label="Delivery format"
              value={summaryFormat}
              onChange={setSummaryFormat}
              columns="3"
              options={[
                { value: "paragraph", title: "Paragraph", description: "One clean narrative block." },
                { value: "bullets", title: "Bullets", description: "Easy scanning for handoff or notes." },
                { value: "highlights", title: "Highlights", description: "Numbered key takeaways only." },
              ]}
            />
            <Textarea
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              placeholder="Paste the text you want to condense..."
              className="min-h-[260px] rounded-3xl border-black/10 bg-white/80 text-sm leading-7 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Best results come from 3 or more sentences with a clear argument or narrative.
              </p>
              <Button onClick={summarizeText} disabled={isSummarizing || !inputText.trim()} className="rounded-2xl px-6">
                {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate summary
              </Button>
            </div>
          </div>
        </ToolPanel>
      </ToolWorkbench>

      {summary ? (
        <ToolPanel
          title="Summary output"
          description="A compressed pass designed for quick scanning and handoff."
          actions={
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(summary).then(() => toast.success("Summary copied."))}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          }
        >
          <div className="space-y-5">
            <ToolCodeBlock value={summary} className="max-h-none bg-slate-900" />
            <ToolMetricGrid
              metrics={[
                { label: "Output blocks", value: Math.max(1, summary.split("\n").filter(Boolean).length) },
                { label: "Output style", value: summaryFormat },
                { label: "Profile", value: summaryLength },
              ]}
            />
          </div>
        </ToolPanel>
      ) : null}

      <ToolPanel
        title="How this behaves"
        description="This tool now calls the provider you choose in the browser, so quality, latency, and formatting will vary by model."
      >
        <ToolTagList tags={["Bring your own API key", "No SnapTools proxy", "Ollama works locally", "Provider quality varies"]} />
      </ToolPanel>
    </div>
  );
};

export default AiTextSummarizer;
