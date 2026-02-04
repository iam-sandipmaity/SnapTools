import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Copy, X, RefreshCw } from "lucide-react";
import AnimatedElement from "@/components/animated-element";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ReverseText = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [reverseType, setReverseType] = useState("characters");

  const reverseText = () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text");
      return;
    }

    try {
      let result = "";

      switch (reverseType) {
        case "characters":
          // Reverse entire string character by character
          result = inputText.split("").reverse().join("");
          break;

        case "words":
          // Reverse word order but keep words intact
          result = inputText.split(" ").reverse().join(" ");
          break;

        case "lines":
          // Reverse line order but keep lines intact
          result = inputText.split("\n").reverse().join("\n");
          break;

        case "words-in-line":
          // Reverse words in each line separately
          result = inputText
            .split("\n")
            .map((line) => line.split(" ").reverse().join(" "))
            .join("\n");
          break;

        case "characters-in-words":
          // Reverse characters in each word but keep word order
          result = inputText
            .split(" ")
            .map((word) => word.split("").reverse().join(""))
            .join(" ");
          break;

        default:
          result = inputText.split("").reverse().join("");
      }

      setOutputText(result);
      toast.success("Text reversed successfully");
    } catch (error) {
      toast.error("Failed to reverse text");
      console.error("Reverse error:", error);
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

  const reverseTypes = [
    { value: "characters", label: "Reverse Characters", description: "Reverse entire text character by character" },
    { value: "words", label: "Reverse Words", description: "Reverse word order, keep words intact" },
    { value: "lines", label: "Reverse Lines", description: "Reverse line order, keep lines intact" },
    { value: "words-in-line", label: "Reverse Words in Each Line", description: "Reverse words within each line" },
    { value: "characters-in-words", label: "Reverse Characters in Words", description: "Reverse letters in each word" },
  ];

  return (
    <AnimatedElement>
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Reverse Text</CardTitle>
          <CardDescription>
            Flip text backwards or reverse word order with multiple reverse options
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
                  placeholder="Enter your text here..."
                  className="min-h-[400px]"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <div className="text-sm text-muted-foreground">
                  Characters: {inputText.length} | Words: {inputText.trim() ? inputText.trim().split(/\s+/).length : 0} | Lines: {inputText ? inputText.split("\n").length : 0}
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
                  placeholder="Reversed text will appear here..."
                  className="min-h-[400px]"
                  value={outputText}
                  readOnly
                />
                <div className="text-sm text-muted-foreground">
                  Characters: {outputText.length} | Words: {outputText.trim() ? outputText.trim().split(/\s+/).length : 0} | Lines: {outputText ? outputText.split("\n").length : 0}
                </div>
              </div>
            </div>
          </div>

          {/* Reverse Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="reverseType">Reverse Type</Label>
            <Select value={reverseType} onValueChange={setReverseType}>
              <SelectTrigger>
                <SelectValue placeholder="Select reverse type" />
              </SelectTrigger>
              <SelectContent>
                {reverseTypes.map((type) => (
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

          {/* Examples */}
          <div className="bg-muted/40 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium">Example:</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div><strong>Original:</strong> "Hello World"</div>
              <div><strong>Characters:</strong> "dlroW olleH"</div>
              <div><strong>Words:</strong> "World Hello"</div>
              <div><strong>Characters in Words:</strong> "olleH dlroW"</div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button onClick={reverseText} size="lg" disabled={!inputText.trim()}>
              <RefreshCw className="h-5 w-5 mr-2" />
              Reverse Text
            </Button>
          </div>
        </CardContent>
      </Card>
    </AnimatedElement>
  );
};

export default ReverseText;
