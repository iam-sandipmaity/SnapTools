import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Copy, X } from "lucide-react";
import AnimatedElement from "@/components/animated-element";

const CaseConverter = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");

  const convertCase = (type: string) => {
    if (!inputText.trim()) {
      toast.error("Please enter some text");
      return;
    }

    let result = "";
    try {
      switch (type) {
        case "uppercase":
          result = inputText.toUpperCase();
          break;
        case "lowercase":
          result = inputText.toLowerCase();
          break;
        case "titlecase":
          result = inputText
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          break;
        case "sentencecase":
          result = inputText
            .toLowerCase()
            .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
          break;
        case "camelcase":
          result = inputText
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
            .replace(/^[A-Z]/, (c) => c.toLowerCase());
          break;
        case "pascalcase":
          result = inputText
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
            .replace(/^[a-z]/, (c) => c.toUpperCase());
          break;
        case "snakecase":
          result = inputText
            .trim()
            .replace(/\s+/g, "_")
            .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
            .replace(/^_/, "")
            .replace(/_+/g, "_");
          break;
        case "kebabcase":
          result = inputText
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
            .replace(/^-/, "")
            .replace(/-+/g, "-");
          break;
        case "constantcase":
          result = inputText
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "_")
            .replace(/_+/g, "_");
          break;
        case "alternatingcase":
          result = inputText
            .split("")
            .map((char, index) =>
              index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
            )
            .join("");
          break;
        case "inversecase":
          result = inputText
            .split("")
            .map((char) =>
              char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
            )
            .join("");
          break;
        default:
          result = inputText;
      }
      setOutputText(result);
      toast.success("Text converted successfully");
    } catch (error) {
      toast.error("Failed to convert text");
      console.error("Conversion error:", error);
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

  const caseTypes = [
    { id: "uppercase", label: "UPPERCASE", description: "ALL CAPS" },
    { id: "lowercase", label: "lowercase", description: "all small" },
    { id: "titlecase", label: "Title Case", description: "Every Word Capitalized" },
    { id: "sentencecase", label: "Sentence case", description: "First letter capitalized" },
    { id: "camelcase", label: "camelCase", description: "firstWordLowercase" },
    { id: "pascalcase", label: "PascalCase", description: "FirstWordCapitalized" },
    { id: "snakecase", label: "snake_case", description: "words_with_underscores" },
    { id: "kebabcase", label: "kebab-case", description: "words-with-hyphens" },
    { id: "constantcase", label: "CONSTANT_CASE", description: "UPPERCASE_WITH_UNDERSCORES" },
    { id: "alternatingcase", label: "aLtErNaTiNg", description: "Alternating case" },
    { id: "inversecase", label: "InVeRsE CaSe", description: "Inverse case" },
  ];

  return (
    <AnimatedElement>
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Case Converter</CardTitle>
          <CardDescription>
            Transform text to uppercase, lowercase, title case, camelCase, snake_case, and more
          </CardDescription>
        </CardHeader>

        <CardContent>
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
                  placeholder="Enter your text here..."
                  className="min-h-[300px]"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <div className="text-sm text-muted-foreground">
                  Characters: {inputText.length} | Words: {inputText.trim() ? inputText.trim().split(/\s+/).length : 0}
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
                  placeholder="Converted text will appear here..."
                  className="min-h-[300px]"
                  value={outputText}
                  readOnly
                />
                <div className="text-sm text-muted-foreground">
                  Characters: {outputText.length} | Words: {outputText.trim() ? outputText.trim().split(/\s+/).length : 0}
                </div>
              </div>
            </div>
          </div>

          {/* Conversion Buttons */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Convert To:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {caseTypes.map((caseType) => (
                <Button
                  key={caseType.id}
                  variant="outline"
                  className="h-auto py-3 px-4 flex flex-col items-start gap-1"
                  onClick={() => convertCase(caseType.id)}
                  disabled={!inputText.trim()}
                >
                  <span className="font-medium">{caseType.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {caseType.description}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </AnimatedElement>
  );
};

export default CaseConverter;
