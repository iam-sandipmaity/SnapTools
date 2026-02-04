import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Copy, X, ArrowUpDown } from "lucide-react";
import AnimatedElement from "@/components/animated-element";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const TextSorter = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [sortType, setSortType] = useState("lines-asc");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(false);

  const sortText = () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text");
      return;
    }

    try {
      let result = "";
      const lines = inputText.split("\n");

      // Filter empty lines if option is enabled
      const processedLines = removeEmpty 
        ? lines.filter((line) => line.trim() !== "") 
        : lines;

      switch (sortType) {
        case "lines-asc":
          // Sort lines alphabetically (A to Z)
          result = processedLines
            .sort((a, b) => {
              const compareA = caseSensitive ? a : a.toLowerCase();
              const compareB = caseSensitive ? b : b.toLowerCase();
              return compareA.localeCompare(compareB);
            })
            .join("\n");
          break;

        case "lines-desc":
          // Sort lines reverse alphabetically (Z to A)
          result = processedLines
            .sort((a, b) => {
              const compareA = caseSensitive ? a : a.toLowerCase();
              const compareB = caseSensitive ? b : b.toLowerCase();
              return compareB.localeCompare(compareA);
            })
            .join("\n");
          break;

        case "length-asc":
          // Sort lines by length (shortest first)
          result = processedLines
            .sort((a, b) => a.length - b.length)
            .join("\n");
          break;

        case "length-desc":
          // Sort lines by length (longest first)
          result = processedLines
            .sort((a, b) => b.length - a.length)
            .join("\n");
          break;

        case "words-asc":
          // Sort words alphabetically
          const words = inputText.split(/\s+/);
          result = words
            .sort((a, b) => {
              const compareA = caseSensitive ? a : a.toLowerCase();
              const compareB = caseSensitive ? b : b.toLowerCase();
              return compareA.localeCompare(compareB);
            })
            .join(" ");
          break;

        case "words-desc":
          // Sort words reverse alphabetically
          const wordsDesc = inputText.split(/\s+/);
          result = wordsDesc
            .sort((a, b) => {
              const compareA = caseSensitive ? a : a.toLowerCase();
              const compareB = caseSensitive ? b : b.toLowerCase();
              return compareB.localeCompare(compareA);
            })
            .join(" ");
          break;

        case "reverse":
          // Reverse line order
          result = processedLines.reverse().join("\n");
          break;

        case "random":
          // Random shuffle
          const shuffled = [...processedLines];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          result = shuffled.join("\n");
          break;

        case "numeric-asc":
          // Sort numerically (ascending)
          result = processedLines
            .sort((a, b) => {
              const numA = parseFloat(a) || 0;
              const numB = parseFloat(b) || 0;
              return numA - numB;
            })
            .join("\n");
          break;

        case "numeric-desc":
          // Sort numerically (descending)
          result = processedLines
            .sort((a, b) => {
              const numA = parseFloat(a) || 0;
              const numB = parseFloat(b) || 0;
              return numB - numA;
            })
            .join("\n");
          break;

        default:
          result = inputText;
      }

      setOutputText(result);
      toast.success("Text sorted successfully");
    } catch (error) {
      toast.error("Failed to sort text");
      console.error("Sort error:", error);
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
  };

  const sortTypes = [
    { value: "lines-asc", label: "Lines A→Z", description: "Alphabetically ascending" },
    { value: "lines-desc", label: "Lines Z→A", description: "Alphabetically descending" },
    { value: "length-asc", label: "Length (Short→Long)", description: "By line length ascending" },
    { value: "length-desc", label: "Length (Long→Short)", description: "By line length descending" },
    { value: "words-asc", label: "Words A→Z", description: "Sort words alphabetically" },
    { value: "words-desc", label: "Words Z→A", description: "Sort words reverse alphabetically" },
    { value: "numeric-asc", label: "Numeric (Low→High)", description: "Sort numbers ascending" },
    { value: "numeric-desc", label: "Numeric (High→Low)", description: "Sort numbers descending" },
    { value: "reverse", label: "Reverse Order", description: "Reverse current order" },
    { value: "random", label: "Random Shuffle", description: "Randomize line order" },
  ];

  return (
    <AnimatedElement>
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Text Sorter</CardTitle>
          <CardDescription>
            Sort text alphabetically, by length, numerically, or shuffle randomly
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
                  placeholder="Enter your text here... (one item per line)"
                  className="min-h-[400px] font-mono text-sm"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <div className="text-sm text-muted-foreground">
                  Lines: {inputText ? inputText.split("\n").length : 0} | Characters: {inputText.length}
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
                  placeholder="Sorted text will appear here..."
                  className="min-h-[400px] font-mono text-sm"
                  value={outputText}
                  readOnly
                />
                <div className="text-sm text-muted-foreground">
                  Lines: {outputText ? outputText.split("\n").length : 0} | Characters: {outputText.length}
                </div>
              </div>
            </div>
          </div>

          {/* Sort Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="sortType">Sort Type</Label>
            <Select value={sortType} onValueChange={setSortType}>
              <SelectTrigger>
                <SelectValue placeholder="Select sort type" />
              </SelectTrigger>
              <SelectContent>
                {sortTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{type.label}</span>
                      <span className="text-xs text-muted-foreground">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                id="removeEmpty"
                checked={removeEmpty}
                onCheckedChange={(checked) => setRemoveEmpty(checked as boolean)}
              />
              <label
                htmlFor="removeEmpty"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remove empty lines
              </label>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button onClick={sortText} size="lg" disabled={!inputText.trim()}>
              <ArrowUpDown className="h-5 w-5 mr-2" />
              Sort Text
            </Button>
          </div>
        </CardContent>
      </Card>
    </AnimatedElement>
  );
};

export default TextSorter;
