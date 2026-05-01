import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Code2, Copy, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { extractJsonObject, generateTextWithProvider } from "@/lib/ai/runtime";
import { AIProviderConsole } from "./provider-console";
import { useAIProviderSettings } from "./use-ai-provider-settings";
import {
  ToolChoiceGrid,
  ToolCodeBlock,
  ToolMetricGrid,
  ToolPanel,
  ToolTagList,
  ToolWorkbench,
} from "./tool-workbench";

type Analysis = {
  summary: string;
  patterns: string[];
  walkthrough: string[];
  cautions: string[];
};

const languageExamples: Record<string, string> = {
  javascript: `function fibonacci(limit) {\n  const series = [0, 1];\n  for (let index = 2; index < limit; index += 1) {\n    series.push(series[index - 1] + series[index - 2]);\n  }\n  return series;\n}\n\nconsole.log(fibonacci(8));`,
  python: `def normalize(values):\n    total = sum(values)\n    return [value / total for value in values if total]\n\nprint(normalize([2, 3, 5]))`,
  typescript: `interface User {\n  id: number;\n  active: boolean;\n}\n\nfunction getActiveUsers(users: User[]) {\n  return users.filter((user) => user.active);\n}`,
};

const fallbackAnalysis = (text: string): Analysis => ({
  summary: text.trim(),
  patterns: ["AI response could not be parsed into structured sections."],
  walkthrough: [],
  cautions: [],
});

const AiCodeExplainer = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [detailLevel, setDetailLevel] = useState<"basic" | "intermediate" | "advanced">("intermediate");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const { settings, setSettings } = useAIProviderSettings();

  const lineCount = code.split("\n").filter((line) => line.trim()).length;

  const explainCode = async () => {
    if (!code.trim()) {
      toast.error("Paste code before requesting an explanation.");
      return;
    }

    setIsExplaining(true);

    try {
      const raw = await generateTextWithProvider({
        settings,
        temperature: 0.25,
        maxOutputTokens: detailLevel === "basic" ? 700 : detailLevel === "intermediate" ? 1100 : 1600,
        messages: [
          {
            role: "system",
            content:
              "You are a code explainer. Return strict JSON with keys summary, patterns, walkthrough, cautions. Each non-summary field must be an array of strings.",
          },
          {
            role: "user",
            content: `Explain this ${language} snippet at a ${detailLevel} level.\n\nCode:\n${code}`,
          },
        ],
      });

      setAnalysis(extractJsonObject<Analysis>(raw) ?? fallbackAnalysis(raw));
      toast.success("Explanation ready.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Code explanation failed.");
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="space-y-6">
      <ToolWorkbench
        icon={Code2}
        eyebrow="AI Code Explainer"
        title="Translate raw code into a clearer walkthrough."
        description="Use the explainer to identify patterns, summarize intent, and get a line-level read of an unfamiliar snippet."
        badges={["Real provider calls", "Detail presets", "Structured analysis"]}
        metrics={[
          { label: "Language", value: language },
          { label: "Lines", value: lineCount },
          { label: "Detail", value: detailLevel },
        ]}
        aside={<AIProviderConsole settings={settings} onChange={setSettings} />}
      >
        <ToolPanel
          title="Snippet input"
          description="Paste the code you want explained. Load an example to preview the analysis format."
          actions={
            <Button variant="ghost" size="sm" onClick={() => setCode(languageExamples[language] ?? languageExamples.javascript)}>
              Load example
            </Button>
          }
        >
          <div className="space-y-4">
            <ToolChoiceGrid
              label="Language"
              value={language}
              onChange={setLanguage}
              columns="3"
              options={[
                { value: "javascript", title: "JavaScript", description: "Dynamic runtime logic and common app code." },
                { value: "typescript", title: "TypeScript", description: "Typed application and UI-heavy code." },
                { value: "python", title: "Python", description: "Readable scripts and data-friendly logic." },
                { value: "java", title: "Java", description: "Class-heavy, explicit backend patterns." },
                { value: "go", title: "Go", description: "Compact service code and utility packages." },
                { value: "rust", title: "Rust", description: "Ownership-heavy, low-level detail." },
              ]}
            />
            <ToolChoiceGrid
              label="Detail level"
              value={detailLevel}
              onChange={setDetailLevel}
              columns="3"
              options={[
                { value: "basic", title: "Basic", description: "Quick summary and broad interpretation." },
                { value: "intermediate", title: "Intermediate", description: "Balanced explanation with clearer structure." },
                { value: "advanced", title: "Advanced", description: "More walkthrough depth and caution notes." },
              ]}
            />
            <Textarea
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Paste the code you want explained..."
              className="min-h-[260px] rounded-3xl border-black/10 bg-white/80 font-mono text-sm leading-7 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Structured output depends on the selected model following the JSON instruction reliably.
              </p>
              <Button onClick={explainCode} disabled={isExplaining || !code.trim()} className="rounded-2xl px-6">
                {isExplaining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Explain code
              </Button>
            </div>
          </div>
        </ToolPanel>
      </ToolWorkbench>

      {analysis ? (
        <>
          <ToolPanel
            title="Code summary"
            description="A concise explanation of the snippet's main responsibility."
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigator.clipboard
                    .writeText([analysis.summary, ...analysis.patterns, ...analysis.walkthrough].join("\n"))
                    .then(() => toast.success("Explanation copied."))
                }
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            }
          >
            <div className="space-y-5">
              <p className="text-sm leading-7 text-muted-foreground">{analysis.summary}</p>
              <ToolMetricGrid
                metrics={[
                  { label: "Patterns", value: analysis.patterns.length },
                  { label: "Walkthrough lines", value: analysis.walkthrough.length },
                  { label: "Cautions", value: analysis.cautions.length },
                ]}
              />
            </div>
          </ToolPanel>

          <ToolPanel title="Detected patterns" description="High-level behavior surfaced from the current snippet.">
            <ToolTagList tags={analysis.patterns} />
          </ToolPanel>

          {analysis.walkthrough.length > 0 ? (
            <ToolPanel title="Walkthrough" description="A line-by-line explanation for the first visible logic blocks.">
              <ToolCodeBlock value={analysis.walkthrough.join("\n")} className="max-h-none bg-slate-900" />
            </ToolPanel>
          ) : null}

          {analysis.cautions.length > 0 ? (
            <ToolPanel title="Cautions" description="Potential review notes to verify before shipping.">
              <ToolTagList tags={analysis.cautions} />
            </ToolPanel>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

export default AiCodeExplainer;
