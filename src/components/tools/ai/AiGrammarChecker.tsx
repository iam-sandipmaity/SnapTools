import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { extractJsonObject, generateTextWithProvider } from "@/lib/ai/runtime";
import { AIProviderConsole } from "./provider-console";
import { useAIProviderSettings } from "./use-ai-provider-settings";
import {
  ToolCodeBlock,
  ToolMetricGrid,
  ToolPanel,
  ToolTagList,
  ToolWorkbench,
} from "./tool-workbench";

type GrammarResult = {
  corrected_text: string;
  issues: string[];
  notes: string[];
};

const sampleText =
  "snaptools  helps teams move faster. it keeps repeated utility work in one place. dont let tiny formatting problems slow the team team down.";

const fallbackResult = (text: string): GrammarResult => ({
  corrected_text: text,
  issues: ["The provider did not return structured grammar data."],
  notes: [],
});

const AiGrammarChecker = () => {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<GrammarResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { settings, setSettings } = useAIProviderSettings();

  const words = inputText.trim().split(/\s+/).filter(Boolean).length;

  const runAudit = async () => {
    if (!inputText.trim()) {
      toast.error("Enter text before checking.");
      return;
    }

    setIsChecking(true);

    try {
      const raw = await generateTextWithProvider({
        settings,
        temperature: 0.2,
        maxOutputTokens: 900,
        messages: [
          {
            role: "system",
            content:
              "You are a grammar and style checker. Return strict JSON with keys corrected_text, issues, notes. issues and notes must be arrays of strings.",
          },
          {
            role: "user",
            content: `Review the following text for grammar, capitalization, repeated words, punctuation, and awkward phrasing. Correct it and summarize the issues.\n\nText:\n${inputText}`,
          },
        ],
      });

      const parsed = extractJsonObject<GrammarResult>(raw) ?? fallbackResult(raw);
      setResult(parsed);
      toast.success(parsed.issues.length ? `Flagged ${parsed.issues.length} issues.` : "No issues detected.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Grammar check failed.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <ToolWorkbench
        icon={Sparkles}
        eyebrow="AI Grammar Checker"
        title="Catch writing defects with a real model-backed review pass."
        description="Audit a paragraph for grammar, punctuation, repetition, clarity, and sentence-level cleanup."
        badges={["Real provider calls", "Corrected preview", "Issue summary"]}
        metrics={[
          { label: "Words", value: words },
          { label: "Issues", value: result?.issues.length ?? 0 },
          { label: "Ready state", value: result ? (result.issues.length === 0 ? "Clean" : "Review") : "Idle" },
        ]}
        aside={<AIProviderConsole settings={settings} onChange={setSettings} />}
      >
        <ToolPanel
          title="Text under review"
          description="Paste a paragraph and run an AI review. Use the sample if you want to see the correction flow immediately."
          actions={
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setInputText(sampleText)}>
                Load sample
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInputText("");
                  setResult(null);
                }}
              >
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
              placeholder="Paste the text you want to review..."
              className="min-h-[240px] rounded-3xl border-black/10 bg-white/80 text-sm leading-7 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Stronger editorial models generally produce better issue summaries and smoother corrected text.
              </p>
              <Button onClick={runAudit} disabled={isChecking || !inputText.trim()} className="rounded-2xl px-6">
                {isChecking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Check grammar
              </Button>
            </div>
          </div>
        </ToolPanel>
      </ToolWorkbench>

      {result ? (
        <>
          <ToolPanel
            title="Corrected preview"
            description="A synthesized output after the AI correction pass."
            actions={
              <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(result.corrected_text).then(() => toast.success("Corrected text copied."))}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            }
          >
            <div className="space-y-5">
              <ToolCodeBlock value={result.corrected_text} className="max-h-none bg-slate-900" />
              <ToolMetricGrid
                metrics={[
                  { label: "Detected issues", value: result.issues.length },
                  { label: "Characters", value: result.corrected_text.length },
                  { label: "Status", value: result.issues.length === 0 ? "Clean" : "Review" },
                ]}
              />
            </div>
          </ToolPanel>

          {result.issues.length > 0 ? (
            <ToolPanel title="Issue summary" description="High-level items the model flagged during the pass.">
              <ToolTagList tags={result.issues} />
            </ToolPanel>
          ) : null}

          {result.notes.length > 0 ? (
            <ToolPanel title="Notes" description="Extra style or clarity suggestions from the model.">
              <ToolTagList tags={result.notes} />
            </ToolPanel>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

export default AiGrammarChecker;
