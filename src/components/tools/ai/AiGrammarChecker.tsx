import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Copy, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  ToolCodeBlock,
  ToolMetricGrid,
  ToolPanel,
  ToolTagList,
  ToolWorkbench,
} from "./tool-workbench";

type Issue = {
  id: string;
  type: string;
  label: string;
  replacement: string;
  start: number;
  end: number;
};

const sampleText =
  "snaptools  helps teams move faster. it keeps repeated utility work in one place. dont let tiny formatting problems slow the team team down.";

const collectIssues = (text: string): Issue[] => {
  const issues: Issue[] = [];

  for (const match of text.matchAll(/ {2,}/g)) {
    issues.push({
      id: `space-${match.index}`,
      type: "Spacing",
      label: "Collapse repeated spaces.",
      replacement: " ",
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
    });
  }

  for (const match of text.matchAll(/\b(dont|cant|wont|im)\b/gi)) {
    const replacements: Record<string, string> = {
      dont: "don't",
      cant: "can't",
      wont: "won't",
      im: "I'm",
    };
    const key = match[0].toLowerCase();
    issues.push({
      id: `word-${match.index}`,
      type: "Usage",
      label: `Replace "${match[0]}" with standard punctuation.`,
      replacement: replacements[key],
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
    });
  }

  for (const match of text.matchAll(/\b(\w+)\s+(\1)\b/gi)) {
    const replacement = match[1];
    issues.push({
      id: `repeat-${match.index}`,
      type: "Repetition",
      label: `Remove the repeated word "${match[1]}".`,
      replacement,
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
    });
  }

  let capitalizeNext = true;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (capitalizeNext && /[a-z]/.test(char)) {
      issues.push({
        id: `caps-${index}`,
        type: "Capitalization",
        label: "Capitalize the start of the sentence.",
        replacement: char.toUpperCase(),
        start: index,
        end: index + 1,
      });
      capitalizeNext = false;
      continue;
    }

    if (/[A-Z]/.test(char) || /\w/.test(char)) {
      capitalizeNext = false;
    }

    if (/[.!?]/.test(char)) {
      capitalizeNext = true;
    }
  }

  return issues.sort((a, b) => a.start - b.start);
};

const applyIssues = (text: string, issues: Issue[]) =>
  [...issues]
    .sort((a, b) => b.start - a.start)
    .reduce((current, issue) => `${current.slice(0, issue.start)}${issue.replacement}${current.slice(issue.end)}`, text);

const AiGrammarChecker = () => {
  const [inputText, setInputText] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const words = inputText.trim().split(/\s+/).filter(Boolean).length;

  const runAudit = async () => {
    if (!inputText.trim()) {
      toast.error("Enter text before checking.");
      return;
    }

    setIsChecking(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 850));
      const nextIssues = collectIssues(inputText);
      setIssues(nextIssues);
      setCorrectedText(applyIssues(inputText, nextIssues));
      toast.success(nextIssues.length ? `Flagged ${nextIssues.length} potential issues.` : "No issues detected.");
    } finally {
      setIsChecking(false);
    }
  };

  const rerunWithText = (nextText: string) => {
    const nextIssues = collectIssues(nextText);
    setInputText(nextText);
    setIssues(nextIssues);
    setCorrectedText(applyIssues(nextText, nextIssues));
  };

  const applyIssue = (issue: Issue) => {
    const nextText = `${inputText.slice(0, issue.start)}${issue.replacement}${inputText.slice(issue.end)}`;
    rerunWithText(nextText);
    toast.success("Correction applied.");
  };

  const applyAll = () => {
    const nextText = applyIssues(inputText, issues);
    rerunWithText(nextText);
    toast.success("All corrections applied.");
  };

  return (
    <div className="space-y-6">
      <ToolWorkbench
        icon={Sparkles}
        eyebrow="AI Grammar Checker"
        title="Catch small writing defects before they leave the page."
        description="Audit a paragraph for repeated words, collapsed punctuation, spacing drift, and basic sentence-start capitalization."
        badges={["Rule-based review", "One-click fixes", "Live corrected preview"]}
        metrics={[
          { label: "Words", value: words },
          { label: "Issues", value: issues.length },
          { label: "Ready state", value: issues.length === 0 && correctedText ? "Clean" : "Needs pass" },
        ]}
        aside={
          <div className="space-y-4">
            <ToolPanel title="Strongest use cases" description="Helpful as a final polish step for shorter text.">
              <ToolTagList tags={["Emails", "Blog drafts", "Announcements", "Support replies", "Internal notes", "Landing copy"]} />
            </ToolPanel>
            <ToolPanel title="Coverage" description="This demo focuses on surface-level cleanup rather than full linguistic analysis.">
              <ToolTagList tags={["Spacing", "Repeated words", "Missing apostrophes", "Sentence starts"]} />
            </ToolPanel>
          </div>
        }
      >
        <ToolPanel
          title="Text under review"
          description="Paste a paragraph and run a local audit. Use the sample if you want to see the fixer pass immediately."
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
                  setCorrectedText("");
                  setIssues([]);
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
                Run the audit after each major rewrite pass to catch last-mile issues.
              </p>
              <Button onClick={runAudit} disabled={isChecking || !inputText.trim()} className="rounded-2xl px-6">
                {isChecking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Check grammar
              </Button>
            </div>
          </div>
        </ToolPanel>
      </ToolWorkbench>

      {correctedText ? (
        <ToolPanel
          title="Corrected preview"
          description="A synthesized output after applying all currently detected fixes."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={applyAll} disabled={issues.length === 0}>
                Apply all
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(correctedText).then(() => toast.success("Corrected text copied."))}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </div>
          }
        >
          <div className="space-y-5">
            <ToolCodeBlock value={correctedText} className="max-h-none bg-slate-900" />
            <ToolMetricGrid
              metrics={[
                { label: "Detected issues", value: issues.length },
                { label: "Characters", value: correctedText.length },
                { label: "Status", value: issues.length === 0 ? "Clean" : "Review" },
              ]}
            />
          </div>
        </ToolPanel>
      ) : null}

      {issues.length > 0 ? (
        <ToolPanel title="Issue queue" description="Apply fixes individually if you want to keep tighter editorial control.">
          <div className="space-y-3">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="font-semibold">{issue.label}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Suggested replacement: <span className="font-mono text-foreground">{issue.replacement}</span>
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => applyIssue(issue)}>
                    Apply fix
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ToolPanel>
      ) : correctedText ? (
        <ToolPanel title="Clean pass" description="No remaining issues are currently flagged by the local rule set.">
          <div className="flex items-center gap-3 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-sm font-medium">This draft is clean against the checks currently enabled.</p>
          </div>
        </ToolPanel>
      ) : null}
    </div>
  );
};

export default AiGrammarChecker;
