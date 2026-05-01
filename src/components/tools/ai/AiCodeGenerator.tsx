import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Code2, Copy, Loader2, Sparkles } from "lucide-react";
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

const examplePrompts: Record<string, string> = {
  javascript: "Create a fetch helper with retry logic and JSON parsing.",
  typescript: "Create a typed utility that filters active users from a list.",
  python: "Write a function that groups items by category and counts them.",
};

const AiCodeGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [complexity, setComplexity] = useState<"simple" | "moderate" | "advanced">("moderate");
  const [includeComments, setIncludeComments] = useState(true);
  const [includeTests, setIncludeTests] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { settings, setSettings } = useAIProviderSettings();

  const generateCode = async () => {
    if (!prompt.trim()) {
      toast.error("Describe the code you need first.");
      return;
    }

    setIsGenerating(true);

    try {
      const next = await generateTextWithProvider({
        settings,
        temperature: 0.35,
        maxOutputTokens: complexity === "simple" ? 500 : complexity === "moderate" ? 900 : 1500,
        messages: [
          {
            role: "system",
            content:
              "You are a senior software engineer. Return code only unless brief inline comments are explicitly requested.",
          },
          {
            role: "user",
            content: `Generate ${language} code for the following request.\n\nPrompt: ${prompt}\nComplexity: ${complexity}\nInclude comments: ${includeComments ? "yes" : "no"}\nInclude tests or examples: ${includeTests ? "yes" : "no"}\n\nRequirements:\n- Use clear naming\n- Handle obvious edge cases\n- Return a complete snippet`,
          },
        ],
      });

      setGeneratedCode(next);
      toast.success("Code draft generated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Code generation failed.");
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
        aside={<AIProviderConsole settings={settings} onChange={setSettings} />}
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
            <ToolChoiceGrid
              label="Language"
              value={language}
              onChange={setLanguage}
              columns="3"
              options={[
                { value: "javascript", title: "JavaScript", description: "Fast general-purpose browser and Node snippets." },
                { value: "typescript", title: "TypeScript", description: "Typed helpers and app-ready utilities." },
                { value: "python", title: "Python", description: "Clean scripting and backend-style logic." },
                { value: "java", title: "Java", description: "Verbose but structured enterprise-style code." },
                { value: "go", title: "Go", description: "Lean services and concurrency-friendly helpers." },
                { value: "rust", title: "Rust", description: "Performance-focused systems code." },
              ]}
            />
            <ToolChoiceGrid
              label="Complexity"
              value={complexity}
              onChange={setComplexity}
              columns="3"
              options={[
                { value: "simple", title: "Simple", description: "Tight implementation with minimal scaffolding." },
                { value: "moderate", title: "Moderate", description: "Balanced structure for everyday production use." },
                { value: "advanced", title: "Advanced", description: "More edge cases, guards, and completeness." },
              ]}
            />
            <ToolChoiceGrid
              label="Extras"
              value={includeComments ? "comments" : includeTests ? "tests" : "clean"}
              onChange={(next) => {
                if (next === "comments") {
                  setIncludeComments(true);
                  setIncludeTests(false);
                } else if (next === "tests") {
                  setIncludeComments(false);
                  setIncludeTests(true);
                } else {
                  setIncludeComments(false);
                  setIncludeTests(false);
                }
              }}
              columns="3"
              options={[
                { value: "comments", title: "Comments", description: "Include brief guidance inside the snippet." },
                { value: "tests", title: "Quick Test", description: "Append a tiny usage or test example." },
                { value: "clean", title: "Clean Output", description: "Return the bare implementation only." },
              ]}
            />
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Describe the code you want generated..."
              className="min-h-[220px] rounded-3xl border-black/10 bg-white/80 text-sm leading-7 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Provider quality differs a lot here. Stronger reasoning models usually produce cleaner first drafts.
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
