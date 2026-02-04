import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { X, GitCompare } from "lucide-react";
import AnimatedElement from "@/components/animated-element";
import { Badge } from "@/components/ui/badge";

interface DiffResult {
  type: "added" | "removed" | "unchanged";
  line: string;
  lineNumber: number;
}

const TextDiff = () => {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [showDiff, setShowDiff] = useState(false);

  // Simple diff algorithm
  const calculateDiff = (): DiffResult[] => {
    const lines1 = text1.split("\n");
    const lines2 = text2.split("\n");
    const results: DiffResult[] = [];

    const maxLines = Math.max(lines1.length, lines2.length);

    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i];
      const line2 = lines2[i];

      if (line1 === undefined) {
        // Line only exists in text2 (added)
        results.push({
          type: "added",
          line: line2,
          lineNumber: i + 1,
        });
      } else if (line2 === undefined) {
        // Line only exists in text1 (removed)
        results.push({
          type: "removed",
          line: line1,
          lineNumber: i + 1,
        });
      } else if (line1 === line2) {
        // Lines are the same
        results.push({
          type: "unchanged",
          line: line1,
          lineNumber: i + 1,
        });
      } else {
        // Lines differ
        results.push({
          type: "removed",
          line: line1,
          lineNumber: i + 1,
        });
        results.push({
          type: "added",
          line: line2,
          lineNumber: i + 1,
        });
      }
    }

    return results;
  };

  const diffResults = useMemo(() => {
    if (showDiff && (text1 || text2)) {
      return calculateDiff();
    }
    return [];
  }, [text1, text2, showDiff]);

  const stats = useMemo(() => {
    const added = diffResults.filter((r) => r.type === "added").length;
    const removed = diffResults.filter((r) => r.type === "removed").length;
    const unchanged = diffResults.filter((r) => r.type === "unchanged").length;
    return { added, removed, unchanged };
  }, [diffResults]);

  const compareDiff = () => {
    if (!text1.trim() && !text2.trim()) {
      toast.error("Please enter text in both fields");
      return;
    }
    setShowDiff(true);
    toast.success("Comparison complete");
  };

  const clearAll = () => {
    setText1("");
    setText2("");
    setShowDiff(false);
  };

  const swapTexts = () => {
    const temp = text1;
    setText1(text2);
    setText2(temp);
    toast.success("Texts swapped");
  };

  return (
    <AnimatedElement>
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Text Diff/Compare</CardTitle>
          <CardDescription>
            Find differences between two text files with line-by-line comparison
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Input Section */}
          {!showDiff ? (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Text 1 */}
                <div className="space-y-2">
                  <Label htmlFor="text1">Original Text</Label>
                  <Textarea
                    id="text1"
                    placeholder="Enter original text..."
                    className="min-h-[400px] font-mono text-sm"
                    value={text1}
                    onChange={(e) => setText1(e.target.value)}
                  />
                  <div className="text-sm text-muted-foreground">
                    Lines: {text1 ? text1.split("\n").length : 0} | Characters: {text1.length}
                  </div>
                </div>

                {/* Text 2 */}
                <div className="space-y-2">
                  <Label htmlFor="text2">Modified Text</Label>
                  <Textarea
                    id="text2"
                    placeholder="Enter modified text..."
                    className="min-h-[400px] font-mono text-sm"
                    value={text2}
                    onChange={(e) => setText2(e.target.value)}
                  />
                  <div className="text-sm text-muted-foreground">
                    Lines: {text2 ? text2.split("\n").length : 0} | Characters: {text2.length}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <Button onClick={compareDiff} size="lg">
                  <GitCompare className="h-5 w-5 mr-2" />
                  Compare Texts
                </Button>
                <Button variant="outline" onClick={swapTexts} disabled={!text1 && !text2}>
                  Swap Texts
                </Button>
                <Button variant="outline" onClick={clearAll}>
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>
          ) : (
            /* Diff Results */
            <div className="space-y-4">
              {/* Stats */}
              <div className="flex gap-4 items-center">
                <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                  +{stats.added} Added
                </Badge>
                <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20">
                  -{stats.removed} Removed
                </Badge>
                <Badge variant="outline" className="bg-gray-500/10 text-gray-700 border-gray-500/20">
                  {stats.unchanged} Unchanged
                </Badge>
                <div className="ml-auto">
                  <Button variant="outline" onClick={() => setShowDiff(false)}>
                    Edit Texts
                  </Button>
                </div>
              </div>

              {/* Diff Display */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted p-2 font-mono text-sm max-h-[600px] overflow-y-auto">
                  {diffResults.map((result, index) => (
                    <div
                      key={index}
                      className={`px-3 py-1 ${
                        result.type === "added"
                          ? "bg-green-500/10 text-green-700"
                          : result.type === "removed"
                          ? "bg-red-500/10 text-red-700"
                          : ""
                      }`}
                    >
                      <span className="inline-block w-12 text-muted-foreground mr-3">
                        {result.lineNumber}
                      </span>
                      <span className="mr-2">
                        {result.type === "added" ? "+" : result.type === "removed" ? "-" : " "}
                      </span>
                      <span className="whitespace-pre-wrap break-all">{result.line || " "}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setShowDiff(false)}>
                  Edit Texts
                </Button>
                <Button variant="outline" onClick={clearAll}>
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AnimatedElement>
  );
};

export default TextDiff;
