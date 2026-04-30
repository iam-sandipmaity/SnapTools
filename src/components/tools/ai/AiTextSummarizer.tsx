import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  ToolCodeBlock,
  ToolMetricGrid,
  ToolPanel,
  ToolTagList,
  ToolWorkbench,
} from "./tool-workbench";

const sampleText = `SnapTools helps teams move through browser-based utility work without sending every task to a desktop app. The platform brings PDF, image, text, and data workflows into one interface, which makes it easier to stay focused and avoid context switching. Teams usually reach for summarization when they need the key signal from a long brief, customer note, or technical article without reading every line twice. A strong summary should preserve meaning, surface action items, and cut repetition so the next decision becomes obvious.`;

const splitSentences = (text: string) => {
  const matches = text.match(/[^.!?\n]+[.!?]?/g) ?? [];
  return matches.map((part) => part.trim()).filter(Boolean);
};

const normalizeSentence = (sentence: string) => {
  const trimmed = sentence.trim();
  if (!trimmed) return trimmed;
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
};

const AiTextSummarizer = () => {
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryLength, setSummaryLength] = useState<"brief" | "balanced" | "detailed">("balanced");
  const [summaryFormat, setSummaryFormat] = useState<"paragraph" | "bullets" | "highlights">("paragraph");

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
      await new Promise((resolve) => setTimeout(resolve, 850));

      const sentences = splitSentences(inputText);
      const fallback = inputText
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean);
      const workingSet = sentences.length > 0 ? sentences : fallback;
      const pickCount = summaryLength === "brief" ? 2 : summaryLength === "balanced" ? 4 : 6;

      const selected = [
        workingSet[0],
        workingSet[Math.floor(workingSet.length / 3)],
        workingSet[Math.floor((workingSet.length * 2) / 3)],
        workingSet[workingSet.length - 1],
      ]
        .filter(Boolean)
        .filter((value, index, list) => list.indexOf(value) === index)
        .slice(0, Math.min(pickCount, workingSet.length))
        .map(normalizeSentence);

      let nextSummary = selected.join(" ");

      if (summaryFormat === "bullets") {
        nextSummary = selected.map((sentence) => `• ${sentence}`).join("\n");
      } else if (summaryFormat === "highlights") {
        nextSummary = selected
          .slice(0, 3)
          .map((sentence, index) => `${index + 1}. ${sentence}`)
          .join("\n");
      }

      setSummary(nextSummary);
      toast.success("Summary ready.");
    } catch {
      toast.error("Something interrupted the summary pass.");
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
        badges={["Extractive demo engine", "Length presets", "Bullet or paragraph output"]}
        metrics={[
          { label: "Source words", value: inputWords.length, hint: "Live count from the input buffer." },
          { label: "Summary words", value: summaryWords.length, hint: "Updates after each generation pass." },
          { label: "Reduction", value: `${reduction}%`, hint: "Estimated shrink from source to output." },
        ]}
        aside={
          <div className="space-y-4">
            <ToolPanel
              title="Output tuning"
              description="Choose how compressed the summary should feel and how it should be structured."
            >
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Length profile</Label>
                  <div className="flex flex-wrap gap-2">
                    {(["brief", "balanced", "detailed"] as const).map((value) => (
                      <Badge
                        key={value}
                        variant={summaryLength === value ? "default" : "outline"}
                        className="cursor-pointer rounded-full px-3 py-1 capitalize"
                        onClick={() => setSummaryLength(value)}
                      >
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Delivery format</Label>
                  <div className="flex flex-wrap gap-2">
                    {(["paragraph", "bullets", "highlights"] as const).map((value) => (
                      <Badge
                        key={value}
                        variant={summaryFormat === value ? "default" : "outline"}
                        className="cursor-pointer rounded-full px-3 py-1 capitalize"
                        onClick={() => setSummaryFormat(value)}
                      >
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </ToolPanel>
            <ToolPanel title="Best fit" description="Useful when speed matters more than full nuance.">
              <ToolTagList
                tags={["Research intake", "Client briefs", "Release notes", "Long-form drafts", "Meeting notes", "Support transcripts"]}
              />
            </ToolPanel>
          </div>
        }
      >
        <ToolPanel
          title="Source text"
          description="Paste a long passage, report section, or article excerpt. The demo engine will extract the strongest lines and compress them."
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
                { label: "Sentences used", value: splitSentences(summary).length || summary.split("\n").filter(Boolean).length },
                { label: "Output style", value: summaryFormat },
                { label: "Profile", value: summaryLength },
              ]}
            />
          </div>
        </ToolPanel>
      ) : null}

      <ToolPanel
        title="How this demo behaves"
        description="This is a client-side extractive summarizer, so it works best when the source already contains clear signal sentences."
      >
        <ToolTagList tags={["Preserves original phrasing", "No external API call", "Fast preview before model hookup"]} />
      </ToolPanel>
    </div>
  );
};

export default AiTextSummarizer;
