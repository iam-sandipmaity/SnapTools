import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Copy, X, Search, Replace } from "lucide-react";
import AnimatedElement from "@/components/animated-element";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const FindReplace = () => {
  const [inputText, setInputText] = useState("");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [resultText, setResultText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [matchCount, setMatchCount] = useState(0);

  const findMatches = () => {
    if (!inputText || !findText) {
      toast.error("Please enter text and search term");
      return;
    }

    try {
      let pattern: RegExp;

      if (useRegex) {
        pattern = new RegExp(findText, caseSensitive ? "g" : "gi");
      } else {
        const escapedFind = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const wordBoundary = wholeWord ? "\\b" : "";
        pattern = new RegExp(
          `${wordBoundary}${escapedFind}${wordBoundary}`,
          caseSensitive ? "g" : "gi"
        );
      }

      const matches = inputText.match(pattern);
      const count = matches ? matches.length : 0;
      setMatchCount(count);

      if (count === 0) {
        toast.info("No matches found");
      } else {
        toast.success(`Found ${count} match${count !== 1 ? "es" : ""}`);
      }
    } catch (error) {
      toast.error("Invalid search pattern");
      console.error("Find error:", error);
    }
  };

  const replaceAll = () => {
    if (!inputText || !findText) {
      toast.error("Please enter text and search term");
      return;
    }

    try {
      let pattern: RegExp;

      if (useRegex) {
        pattern = new RegExp(findText, caseSensitive ? "g" : "gi");
      } else {
        const escapedFind = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const wordBoundary = wholeWord ? "\\b" : "";
        pattern = new RegExp(
          `${wordBoundary}${escapedFind}${wordBoundary}`,
          caseSensitive ? "g" : "gi"
        );
      }

      const matches = inputText.match(pattern);
      const count = matches ? matches.length : 0;

      if (count === 0) {
        toast.info("No matches found to replace");
        setResultText(inputText);
        return;
      }

      const result = inputText.replace(pattern, replaceText);
      setResultText(result);
      setMatchCount(count);
      toast.success(`Replaced ${count} occurrence${count !== 1 ? "s" : ""}`);
    } catch (error) {
      toast.error("Invalid search pattern");
      console.error("Replace error:", error);
    }
  };

  const copyToClipboard = () => {
    if (!resultText) {
      toast.error("No result to copy");
      return;
    }
    navigator.clipboard
      .writeText(resultText)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
  };

  const clearAll = () => {
    setInputText("");
    setFindText("");
    setReplaceText("");
    setResultText("");
    setMatchCount(0);
  };

  const highlightMatches = () => {
    if (!inputText || !findText) return inputText;

    try {
      let pattern: RegExp;

      if (useRegex) {
        pattern = new RegExp(findText, caseSensitive ? "g" : "gi");
      } else {
        const escapedFind = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const wordBoundary = wholeWord ? "\\b" : "";
        pattern = new RegExp(
          `${wordBoundary}${escapedFind}${wordBoundary}`,
          caseSensitive ? "g" : "gi"
        );
      }

      return inputText.replace(pattern, (match) => `✓${match}✓`);
    } catch {
      return inputText;
    }
  };

  return (
    <AnimatedElement>
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Find & Replace</CardTitle>
          <CardDescription>
            Search and replace multiple strings in text instantly with advanced options
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Input Text */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="input">Input Text</Label>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                <X className="h-4 w-4 mr-1" /> Clear All
              </Button>
            </div>
            <Textarea
              id="input"
              placeholder="Enter or paste your text here..."
              className="min-h-[250px] font-mono text-sm"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className="text-sm text-muted-foreground">
              Characters: {inputText.length} | Lines: {inputText ? inputText.split("\n").length : 0}
            </div>
          </div>

          {/* Find & Replace Controls */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="find">Find</Label>
              <Input
                id="find"
                placeholder="Enter text to find..."
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="replace">Replace with</Label>
              <Input
                id="replace"
                placeholder="Enter replacement text..."
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
              />
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="caseSensitive"
                checked={caseSensitive}
                onCheckedChange={(checked) => setCaseSensitive(checked as boolean)}
              />
              <label
                htmlFor="caseSensitive"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Case sensitive
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="wholeWord"
                checked={wholeWord}
                onCheckedChange={(checked) => setWholeWord(checked as boolean)}
              />
              <label
                htmlFor="wholeWord"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Whole word
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="regex"
                checked={useRegex}
                onCheckedChange={(checked) => setUseRegex(checked as boolean)}
              />
              <label
                htmlFor="regex"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Use regex
              </label>
            </div>
          </div>

          {/* Match Count */}
          {matchCount > 0 && (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/20">
              {matchCount} match{matchCount !== 1 ? "es" : ""} found
            </Badge>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={findMatches} variant="outline" disabled={!inputText || !findText}>
              <Search className="h-4 w-4 mr-2" />
              Find
            </Button>
            <Button onClick={replaceAll} disabled={!inputText || !findText}>
              <Replace className="h-4 w-4 mr-2" />
              Replace All
            </Button>
          </div>

          {/* Result Text */}
          {resultText && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="result">Result</Label>
                <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
              </div>
              <Textarea
                id="result"
                placeholder="Result will appear here..."
                className="min-h-[250px] font-mono text-sm"
                value={resultText}
                readOnly
              />
              <div className="text-sm text-muted-foreground">
                Characters: {resultText.length} | Lines: {resultText ? resultText.split("\n").length : 0}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AnimatedElement>
  );
};

export default FindReplace;
