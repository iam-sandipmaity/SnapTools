import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Loader2, RotateCcw, Sparkles, Shuffle } from "lucide-react";
import { toast } from "sonner";
import {
  ToolCodeBlock,
  ToolMetricGrid,
  ToolPanel,
  ToolTagList,
  ToolWorkbench,
} from "./tool-workbench";

const synonymSets: Record<string, string[]> = {
  important: ["essential", "critical", "high-priority"],
  useful: ["practical", "valuable", "helpful"],
  improve: ["refine", "strengthen", "elevate"],
  fast: ["quick", "rapid", "efficient"],
  use: ["use", "apply", "deploy"],
  build: ["build", "shape", "construct"],
  teams: ["teams", "operators", "contributors"],
  clear: ["clear", "direct", "easy to scan"],
};

const modePrefixes = {
  standard: "In other words,",
  fluent: "A smoother way to say it is:",
  creative: "A more vivid version might read:",
  formal: "A formal restatement would be:",
  simple: "Put simply,",
};

const sampleText =
  "SnapTools gives teams a faster way to handle browser-based utility work. It keeps everyday formatting, conversion, and cleanup tasks in one place, which makes the workflow easier to manage and easier to explain.";

const preserveCase = (source: string, next: string) =>
  source.charAt(0) === source.charAt(0).toUpperCase()
    ? `${next.charAt(0).toUpperCase()}${next.slice(1)}`
    : next;

const AiParaphraser = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<"standard" | "fluent" | "creative" | "formal" | "simple">("standard");
  const [strength, setStrength] = useState<"light" | "moderate" | "heavy">("moderate");

  const inputWords = inputText.trim().split(/\s+/).filter(Boolean);
  const outputWords = outputText.trim().split(/\s+/).filter(Boolean);

  const rewriteWord = (token: string, index: number) => {
    const punctuation = token.match(/[.,!?;:]+$/)?.[0] ?? "";
    const core = token.replace(/[.,!?;:]+$/, "");
    const lookup = core.toLowerCase();
    const choices = synonymSets[lookup];

    if (!choices) return token;

    const intensity = strength === "light" ? 3 : strength === "moderate" ? 2 : 1;
    if (index % intensity !== 0) return token;

    const next = choices[index % choices.length];
    return `${preserveCase(core, next)}${punctuation}`;
  };

  const paraphraseText = async () => {
    if (!inputText.trim()) {
      toast.error("Enter text before paraphrasing.");
      return;
    }

    setIsProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));

      const rewrittenBody = inputText
        .split(/\s+/)
        .map((token, index) => rewriteWord(token, index))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      let next = `${modePrefixes[mode]} ${rewrittenBody}`;

      if (mode === "formal") {
        next = next
          .replace(/\bcan't\b/gi, "cannot")
          .replace(/\bdon't\b/gi, "do not")
          .replace(/\bit's\b/gi, "it is");
      }

      if (mode === "simple") {
        next = next
          .replace(/\bdeploy\b/gi, "use")
          .replace(/\belevate\b/gi, "improve")
          .replace(/\bcontributors\b/gi, "teams");
      }

      if (mode === "creative") {
        next = `${next}\n\nThis version pushes the language slightly harder while keeping the same intent.`;
      }

      setOutputText(next);
      toast.success("Paraphrase ready.");
    } catch {
      toast.error("The rewrite pass did not complete.");
    } finally {
      setIsProcessing(false);
    }
  };

  const changeCount = inputWords.reduce((total, word, index) => {
    const next = outputWords[index];
    return total + (next && next.toLowerCase() !== word.toLowerCase() ? 1 : 0);
  }, 0);

  const changeRate = inputWords.length ? Math.round((changeCount / inputWords.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <ToolWorkbench
        icon={Shuffle}
        eyebrow="AI Paraphraser"
        title="Rewrite language without losing the original direction."
        description="Use the paraphraser when the meaning is right but the delivery needs a cleaner tone, fresher phrasing, or less repetition."
        badges={["Mode presets", "Strength control", "Client-side demo flow"]}
        metrics={[
          { label: "Original words", value: inputWords.length },
          { label: "Changed words", value: changeCount },
          { label: "Change rate", value: `${changeRate}%` },
        ]}
        aside={
          <div className="space-y-4">
            <ToolPanel title="Rewrite profile" description="Shift tone first, then decide how aggressively to change wording.">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Mode</Label>
                  <div className="flex flex-wrap gap-2">
                    {(["standard", "fluent", "creative", "formal", "simple"] as const).map((value) => (
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
                </div>
                <div className="space-y-2">
                  <Label>Strength</Label>
                  <div className="flex flex-wrap gap-2">
                    {(["light", "moderate", "heavy"] as const).map((value) => (
                      <Badge
                        key={value}
                        variant={strength === value ? "default" : "outline"}
                        className="cursor-pointer rounded-full px-3 py-1 capitalize"
                        onClick={() => setStrength(value)}
                      >
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </ToolPanel>
            <ToolPanel title="Good fit" description="Best for drafts that already have the right structure.">
              <ToolTagList tags={["Emails", "Blog intros", "Product copy", "Client updates", "Short briefs", "Academic polish"]} />
            </ToolPanel>
          </div>
        }
      >
        <ToolPanel
          title="Source copy"
          description="Paste the paragraph you want to restate. This demo leans on rule-based rewrites rather than a model call."
          actions={
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setInputText(sampleText)}>
                Load sample
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setInputText(""); setOutputText(""); }}>
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
              placeholder="Enter the text you want to rewrite..."
              className="min-h-[250px] rounded-3xl border-black/10 bg-white/80 text-sm leading-7 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Light keeps more of the original cadence. Heavy pushes vocabulary and framing further.
              </p>
              <Button onClick={paraphraseText} disabled={isProcessing || !inputText.trim()} className="rounded-2xl px-6">
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Rewrite text
              </Button>
            </div>
          </div>
        </ToolPanel>
      </ToolWorkbench>

      {outputText ? (
        <ToolPanel
          title="Paraphrased output"
          description="A revised version with adjusted wording and tone."
          actions={
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(outputText).then(() => toast.success("Paraphrase copied."))}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          }
        >
          <div className="space-y-5">
            <ToolCodeBlock value={outputText} className="max-h-none bg-slate-900" />
            <ToolMetricGrid
              metrics={[
                { label: "Mode", value: mode },
                { label: "Strength", value: strength },
                { label: "Output words", value: outputWords.length },
              ]}
            />
          </div>
        </ToolPanel>
      ) : null}
    </div>
  );
};

export default AiParaphraser;
