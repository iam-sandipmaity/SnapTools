import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Copy, X, Trash2 } from "lucide-react";
import AnimatedElement from "@/components/animated-element";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const DuplicateRemover = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [removedCount, setRemovedCount] = useState(0);

  const removeDuplicates = () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text");
      return;
    }

    try {
      const lines = inputText.split("\n");
      const seen = new Set<string>();
      const uniqueLines: string[] = [];
      let duplicateCount = 0;

      lines.forEach((line) => {
        let processedLine = line;
        
        if (trimWhitespace) {
          processedLine = line.trim();
        }
        
        const comparisonLine = caseSensitive 
          ? processedLine 
          : processedLine.toLowerCase();

        if (!seen.has(comparisonLine)) {
          seen.add(comparisonLine);
          uniqueLines.push(line);
        } else {
          duplicateCount++;
        }
      });

      const result = uniqueLines.join("\n");
      setOutputText(result);
      setRemovedCount(duplicateCount);

      if (duplicateCount === 0) {
        toast.info("No duplicate lines found");
      } else {
        toast.success(`Removed ${duplicateCount} duplicate line${duplicateCount !== 1 ? "s" : ""}`);
      }
    } catch (error) {
      toast.error("Failed to remove duplicates");
      console.error("Remove duplicates error:", error);
    }
  };

  const copyToClipboard = () => {
    if (!outputText) {
      toast.error("No text to copy");
      return;
    }
    navigator.clipboard
      .writeText(outputText)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
  };

  const clearAll = () => {
    setInputText("");
    setOutputText("");
    setRemovedCount(0);
  };

  const getStats = (text: string) => {
    const lines = text.split("\n");
    const nonEmptyLines = lines.filter((line) => line.trim() !== "");
    return {
      totalLines: lines.length,
      nonEmptyLines: nonEmptyLines.length,
      characters: text.length,
    };
  };

  const inputStats = getStats(inputText);
  const outputStats = getStats(outputText);

  return (
    <AnimatedElement>
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Duplicate Line Remover</CardTitle>
          <CardDescription>
            Remove duplicate lines from text. Clean up text by removing duplicate entries
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="input">Input Text</Label>
                  <Button variant="ghost" size="sm" onClick={clearAll}>
                    <X className="h-4 w-4 mr-1" /> Clear
                  </Button>
                </div>
                <Textarea
                  id="input"
                  placeholder="Enter your text here... (one line per entry)"
                  className="min-h-[400px] font-mono text-sm"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Total Lines: {inputStats.totalLines}</span>
                  <span>Non-empty: {inputStats.nonEmptyLines}</span>
                  <span>Characters: {inputStats.characters}</span>
                </div>
              </div>
            </div>

            {/* Output Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="output">Output Text</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    disabled={!outputText}
                  >
                    <Copy className="h-4 w-4 mr-1" /> Copy
                  </Button>
                </div>
                <Textarea
                  id="output"
                  placeholder="Unique lines will appear here..."
                  className="min-h-[400px] font-mono text-sm"
                  value={outputText}
                  readOnly
                />
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Total Lines: {outputStats.totalLines}</span>
                  <span>Non-empty: {outputStats.nonEmptyLines}</span>
                  <span>Characters: {outputStats.characters}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-6 items-center">
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
                id="trimWhitespace"
                checked={trimWhitespace}
                onCheckedChange={(checked) => setTrimWhitespace(checked as boolean)}
              />
              <label
                htmlFor="trimWhitespace"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Trim whitespace
              </label>
            </div>
            {removedCount > 0 && (
              <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20">
                {removedCount} duplicate{removedCount !== 1 ? "s" : ""} removed
              </Badge>
            )}
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button onClick={removeDuplicates} size="lg" disabled={!inputText.trim()}>
              <Trash2 className="h-5 w-5 mr-2" />
              Remove Duplicates
            </Button>
          </div>
        </CardContent>
      </Card>
    </AnimatedElement>
  );
};

export default DuplicateRemover;
