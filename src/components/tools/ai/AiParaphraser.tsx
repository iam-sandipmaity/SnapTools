import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Loader2, RotateCcw, Sparkles, Shuffle } from "lucide-react";
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

const sampleText =
  "SnapTools gives teams a faster way to handle browser-based utility work. It keeps everyday formatting, conversion, and cleanup tasks in one place, which makes the workflow easier to manage and easier to explain.";

const modePrefixes = {
  standard: "Keep the meaning, improve the phrasing, and stay close to the original structure.",
  fluent: "Make the writing smoother and more natural while keeping the original meaning.",
  creative: "Keep the meaning but make the language more vivid and fresh.",
  formal: "Rewrite in a formal and polished tone.",
  simple: "Rewrite in simpler, clearer language for a broad audience.",
};

const AiParaphraser = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<"standard" | "fluent" | "creative" | "formal" | "simple">("standard");
  const [strength, setStrength] = useState<"light" | "moderate" | "heavy">("moderate");
  const { settings, setSettings } = useAIProviderSettings();

  const inputWords = inputText.trim().split(/\s+/).filter(Boolean);
  const outputWords = outputText.trim().split(/\s+/).filter(Boolean);
  const changeRate = inputWords.length
    ? Math.max(0, Math.round((Math.abs(outputWords.length - inputWords.length) / inputWords.length) * 100))
    : 0;

  const paraphraseText = async () => {
    if (!inputText.trim()) {
      toast.error("Enter text before paraphrasing.");
      return;
    }

    setIsProcessing(true);

    try {
      const next = await generateTextWithProvider({
        settings,
        temperature: mode === "creative" ? 0.9 : 0.5,
        maxOutputTokens: Math.max(220, inputWords.length * 3),
        messages: [
          {
            role: "system",
            content:
              "You are a careful rewriting assistant. Preserve the original intent, avoid adding unsupported facts, and return only the rewritten text.",
          },
          {
            role: "user",
            content: `Rewrite the text below.\n\nMode guidance: ${modePrefixes[mode]}\nRewrite strength: ${strength}.\n\nText:\n${inputText}`,
          },
        ],
      });

      setOutputText(next);
      toast.success("Paraphrase ready.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The rewrite pass did not complete.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <ToolWorkbench
        icon={Shuffle}
        eyebrow="AI Paraphraser"
        title="Rewrite language without losing the original direction."
        description="Use the paraphraser when the meaning is right but the delivery needs a cleaner tone, fresher phrasing, or less repetition."
        badges={["Real provider calls", "Mode presets", "Strength control"]}
        metrics={[
          { label: "Original words", value: inputWords.length },
          { label: "Output words", value: outputWords.length },
          { label: "Drift estimate", value: `${changeRate}%` },
        ]}
        aside={<AIProviderConsole settings={settings} onChange={setSettings} />}
      >
        <ToolPanel
          title="Source copy"
          description="Paste the paragraph you want to restate, then let the selected provider rewrite it with your chosen tone."
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
            <ToolChoiceGrid
              label="Mode"
              value={mode}
              onChange={setMode}
              columns="5"
              options={[
                { value: "standard", title: "Standard", description: "Close to the original, just cleaner." },
                { value: "fluent", title: "Fluent", description: "Smoother rhythm and more natural phrasing." },
                { value: "creative", title: "Creative", description: "More color, more voice, more variation." },
                { value: "formal", title: "Formal", description: "Sharper and more polished for serious writing." },
                { value: "simple", title: "Simple", description: "Clearer language for faster understanding." },
              ]}
            />
            <ToolChoiceGrid
              label="Strength"
              value={strength}
              onChange={setStrength}
              columns="3"
              options={[
                { value: "light", title: "Light", description: "Keeps most of the original cadence." },
                { value: "moderate", title: "Moderate", description: "Balanced rewrite with visible improvement." },
                { value: "heavy", title: "Heavy", description: "Gives the model more room to reshape." },
              ]}
            />
            <Textarea
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              placeholder="Enter the text you want to rewrite..."
              className="min-h-[250px] rounded-3xl border-black/10 bg-white/80 text-sm leading-7 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Light keeps more of the original cadence. Heavy gives the model more room to reshape the writing.
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
