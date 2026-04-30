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

const examplePrompts: Record<string, string> = {
  javascript: "Create a fetch helper with retry logic and JSON parsing.",
  typescript: "Create a typed utility that filters active users from a list.",
  python: "Write a function that groups items by category and counts them.",
};

const buildCode = (language: string, prompt: string, includeComments: boolean, includeTests: boolean) => {
  const header = includeComments ? `// Generated for: ${prompt}\n` : "";
  const tests = includeTests ? `\n\n// Quick test\nconsole.log(example());\n` : "";

  if (language === "python") {
    const pyHeader = includeComments ? `# Generated for: ${prompt}\n` : "";
    const pyTests = includeTests ? `\n\nif __name__ == "__main__":\n    print(example())\n` : "";
    return `${pyHeader}def example():\n    """${prompt}"""\n    items = ["alpha", "beta", "gamma"]\n    return [item.upper() for item in items]\n${pyTests}`;
  }

  if (language === "typescript") {
    return `${header}type Item = { id: number; active: boolean };\n\nexport function example(items: Item[]): Item[] {\n  return items.filter((item) => item.active);\n}${tests}`;
  }

  return `${header}export function example() {\n  const values = ["alpha", "beta", "gamma"];\n  return values.map((value) => value.toUpperCase());\n}${tests}`;
};

const AiCodeGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [complexity, setComplexity] = useState<"simple" | "moderate" | "advanced">("moderate");
  const [includeComments, setIncludeComments] = useState(true);
  const [includeTests, setIncludeTests] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCode = async () => {
    if (!prompt.trim()) {
      toast.error("Describe the code you need first.");
      return;
    }

    setIsGenerating(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      const next = buildCode(language, prompt, includeComments, includeTests);
      setGeneratedCode(next);
      toast.success("Code draft generated.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <ToolWorkbench
        icon={Code2}
        eyebrow="AI Code Generator"
        title="Move from vague request to a structured code draft."
        description="Set the language, choose how much scaffolding to include, and generate a starting implementation you can refine by hand."
        badges={["Language presets", "Comment toggle", "Optional quick tests"]}
        metrics={[
          { label: "Language", value: language },
          { label: "Complexity", value: complexity },
          { label: "Lines", value: generatedCode ? generatedCode.split("\n").length : 0 },
        ]}
        aside={
          <div className="space-y-4">
            <ToolPanel title="Generation options" description="These toggles shape how much structure the draft includes.">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Complexity</Label>
                  <div className="flex flex-wrap gap-2">
                    {(["simple", "moderate", "advanced"] as const).map((value) => (
                      <Badge
                        key={value}
                        variant={complexity === value ? "default" : "outline"}
                        className="cursor-pointer rounded-full px-3 py-1 capitalize"
                        onClick={() => setComplexity(value)}
                      >
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Extras</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={includeComments ? "default" : "outline"}
                      className="cursor-pointer rounded-full px-3 py-1"
                      onClick={() => setIncludeComments((value) => !value)}
                    >
                      Comments
                    </Badge>
                    <Badge
                      variant={includeTests ? "default" : "outline"}
                      className="cursor-pointer rounded-full px-3 py-1"
                      onClick={() => setIncludeTests((value) => !value)}
                    >
                      Quick test
                    </Badge>
                  </div>
                </div>
              </div>
            </ToolPanel>
            <ToolPanel title="Good prompts" description="Ask for one contained behavior, one environment, and one expected output.">
              <ToolTagList tags={["API helper", "Data transform", "Typed utility", "UI helper", "Formatter", "Validation rule"]} />
            </ToolPanel>
          </div>
        }
      >
        <ToolPanel
          title="Prompt"
          description="Describe the function, utility, or component you need. Load a sample if you want to preview the code style."
          actions={
            <Button variant="ghost" size="sm" onClick={() => setPrompt(examplePrompts[language] ?? examplePrompts.javascript)}>
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
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Describe the code you want generated..."
              className="min-h-[220px] rounded-3xl border-black/10 bg-white/80 text-sm leading-7 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                This demo emits starter code. Expect to refine naming, edge cases, and production hardening.
              </p>
              <Button onClick={generateCode} disabled={isGenerating || !prompt.trim()} className="rounded-2xl px-6">
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate code
              </Button>
            </div>
          </div>
        </ToolPanel>
      </ToolWorkbench>

      {generatedCode ? (
        <ToolPanel
          title="Generated code"
          description="A starter implementation based on the current prompt and options."
          actions={
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(generatedCode).then(() => toast.success("Code copied."))}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          }
        >
          <div className="space-y-5">
            <ToolCodeBlock value={generatedCode} className="max-h-none" />
            <ToolMetricGrid
              metrics={[
                { label: "Lines", value: generatedCode.split("\n").length },
                { label: "Comments", value: includeComments ? "On" : "Off" },
                { label: "Quick test", value: includeTests ? "Included" : "Skipped" },
              ]}
            />
          </div>
        </ToolPanel>
      ) : null}
    </div>
  );
};

export default AiCodeGenerator;
