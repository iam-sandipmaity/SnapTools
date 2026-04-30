import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Code2, Copy, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
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

const analyzeCode = (code: string, language: string, detail: string): Analysis => {
  const lines = code.split("\n").map((line) => line.trim()).filter(Boolean);
  const patterns: string[] = [];
  const cautions: string[] = [];

  if (/(function|=>|def )/.test(code)) patterns.push("Defines reusable logic through one or more functions.");
  if (/(for|while|map|filter|forEach)/.test(code)) patterns.push("Iterates over values to transform or inspect data.");
  if (/(if|else|switch)/.test(code)) patterns.push("Uses control flow to branch on conditions.");
  if (/(interface|type|class)/.test(code)) patterns.push("Introduces explicit structure for data or behavior.");
  if (/(fetch|axios|await|async)/.test(code)) patterns.push("Contains asynchronous or network-oriented behavior.");
  if (patterns.length === 0) patterns.push("Uses straightforward statements without complex branching.");

  if (!/return/.test(code) && /(function|def )/.test(code)) cautions.push("Functions are defined, but not all branches appear to return a value.");
  if (/console\.log|print\(/.test(code)) cautions.push("Logging statements are present and may be temporary debugging output.");
  if (lines.length > 12) cautions.push("The snippet is long enough that splitting it into smaller units might improve readability.");

  const walkthrough = lines.slice(0, detail === "advanced" ? 8 : detail === "intermediate" ? 5 : 3).map((line, index) => {
    let note = "Executes a plain statement.";
    if (/function|def /.test(line)) note = "Declares a reusable block of logic.";
    else if (/for|while/.test(line)) note = "Begins an iteration step.";
    else if (/return/.test(line)) note = "Hands a value back to the caller.";
    else if (/if|else/.test(line)) note = "Branches execution based on a condition.";
    else if (/interface|type|class/.test(line)) note = "Describes the shape of data or a custom abstraction.";
    return `Line ${index + 1}: ${line} — ${note}`;
  });

  return {
    summary: `This ${language} snippet is primarily concerned with ${patterns[0].toLowerCase()}`,
    patterns,
    walkthrough,
    cautions,
  };
};

const AiCodeExplainer = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [detailLevel, setDetailLevel] = useState<"basic" | "intermediate" | "advanced">("intermediate");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const lineCount = code.split("\n").filter((line) => line.trim()).length;

  const explainCode = async () => {
    if (!code.trim()) {
      toast.error("Paste code before requesting an explanation.");
      return;
    }

    setIsExplaining(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      setAnalysis(analyzeCode(code, language, detailLevel));
      toast.success("Explanation ready.");
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
        badges={["Language-aware examples", "Detail presets", "Pattern detection"]}
        metrics={[
          { label: "Language", value: language },
          { label: "Lines", value: lineCount },
          { label: "Detail", value: detailLevel },
        ]}
        aside={
          <div className="space-y-4">
            <ToolPanel title="Analysis depth" description="Raise the depth when you want a longer walkthrough.">
              <div className="flex flex-wrap gap-2">
                {(["basic", "intermediate", "advanced"] as const).map((value) => (
                  <Badge
                    key={value}
                    variant={detailLevel === value ? "default" : "outline"}
                    className="cursor-pointer rounded-full px-3 py-1 capitalize"
                    onClick={() => setDetailLevel(value)}
                  >
                    {value}
                  </Badge>
                ))}
              </div>
            </ToolPanel>
            <ToolPanel title="Typical use cases" description="Useful when onboarding into unfamiliar logic or preparing review notes.">
              <ToolTagList tags={["Learning", "Code review prep", "Interview study", "Documentation support", "Handoff notes", "Debugging context"]} />
            </ToolPanel>
          </div>
        }
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
            <div className="flex flex-wrap gap-2">
              {["javascript", "typescript", "python", "java", "go", "rust"].map((value) => (
                <Badge
                  key={value}
                  variant={language === value ? "default" : "outline"}
                  className="cursor-pointer rounded-full px-3 py-1"
                  onClick={() => setLanguage(value)}
                >
                  {value}
                </Badge>
              ))}
            </div>
            <Textarea
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Paste the code you want explained..."
              className="min-h-[260px] rounded-3xl border-black/10 bg-white/80 font-mono text-sm leading-7 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                The current explainer is a local heuristic pass, so it is strongest on structure and intent.
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

          <ToolPanel title="Walkthrough" description="A line-by-line explanation for the first visible logic blocks.">
            <ToolCodeBlock value={analysis.walkthrough.join("\n")} className="max-h-none bg-slate-900" />
          </ToolPanel>

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
