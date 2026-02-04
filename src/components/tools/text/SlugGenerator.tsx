import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Copy, X, Link as LinkIcon } from "lucide-react";
import AnimatedElement from "@/components/animated-element";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const SlugGenerator = () => {
  const [inputText, setInputText] = useState("");
  const [slug, setSlug] = useState("");
  const [lowercase, setLowercase] = useState(true);
  const [removeSpecialChars, setRemoveSpecialChars] = useState(true);
  const [maxLength, setMaxLength] = useState("");

  const generateSlug = () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text");
      return;
    }

    try {
      let result = inputText.trim();

      // Convert to lowercase if option is enabled
      if (lowercase) {
        result = result.toLowerCase();
      }

      // Remove accents and diacritics
      result = result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      // Remove special characters if option is enabled
      if (removeSpecialChars) {
        result = result.replace(/[^a-zA-Z0-9\s-]/g, "");
      }

      // Replace spaces and multiple hyphens with single hyphen
      result = result.replace(/\s+/g, "-").replace(/-+/g, "-");

      // Remove leading and trailing hyphens
      result = result.replace(/^-+|-+$/g, "");

      // Apply max length if specified
      if (maxLength && parseInt(maxLength) > 0) {
        const maxLen = parseInt(maxLength);
        if (result.length > maxLen) {
          result = result.substring(0, maxLen);
          // Remove trailing hyphen if any
          result = result.replace(/-+$/, "");
        }
      }

      setSlug(result);
      toast.success("Slug generated successfully");
    } catch (error) {
      toast.error("Failed to generate slug");
      console.error("Slug generation error:", error);
    }
  };

  const copyToClipboard = () => {
    if (!slug) {
      toast.error("No slug to copy");
      return;
    }
    navigator.clipboard
      .writeText(slug)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
  };

  const clearAll = () => {
    setInputText("");
    setSlug("");
  };

  const examples = [
    { input: "Hello World!", output: "hello-world" },
    { input: "SEO Friendly URLs", output: "seo-friendly-urls" },
    { input: "React & TypeScript Tutorial", output: "react-typescript-tutorial" },
    { input: "10 Best Tips for 2024", output: "10-best-tips-for-2024" },
  ];

  return (
    <AnimatedElement>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Slug Generator</CardTitle>
          <CardDescription>
            Create SEO-friendly URL slugs from text. Perfect for blog posts, articles, and web pages
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="input">Input Text</Label>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            </div>
            <Input
              id="input"
              placeholder="Enter your title or text..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="text-lg"
            />
            <div className="text-sm text-muted-foreground">
              Characters: {inputText.length}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lowercase"
                  checked={lowercase}
                  onCheckedChange={(checked) => setLowercase(checked as boolean)}
                />
                <label
                  htmlFor="lowercase"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Convert to lowercase
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="removeSpecialChars"
                  checked={removeSpecialChars}
                  onCheckedChange={(checked) => setRemoveSpecialChars(checked as boolean)}
                />
                <label
                  htmlFor="removeSpecialChars"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remove special characters
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="maxLength" className="whitespace-nowrap">Max Length:</Label>
              <Input
                id="maxLength"
                type="number"
                placeholder="No limit"
                value={maxLength}
                onChange={(e) => setMaxLength(e.target.value)}
                className="w-32"
                min="1"
              />
              <span className="text-sm text-muted-foreground">characters (optional)</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button onClick={generateSlug} size="lg" disabled={!inputText.trim()}>
              <LinkIcon className="h-5 w-5 mr-2" />
              Generate Slug
            </Button>
          </div>

          {/* Output Section */}
          {slug && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Generated Slug</Label>
                <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
              </div>
              <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                <code className="flex-1 font-mono text-lg break-all">{slug}</code>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="outline">Length: {slug.length}</Badge>
                {slug.length > 50 && (
                  <span className="text-sm text-yellow-600">⚠ Slug is longer than recommended (50 chars)</span>
                )}
              </div>
            </div>
          )}

          {/* Examples */}
          <div className="bg-muted/40 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium">Examples:</h4>
            <div className="space-y-2">
              {examples.map((example, index) => (
                <div key={index} className="text-sm">
                  <div className="text-muted-foreground">
                    <strong>Input:</strong> {example.input}
                  </div>
                  <div className="font-mono text-primary">
                    <strong>Output:</strong> {example.output}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              SEO Tips:
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Keep slugs short and descriptive (ideally under 50 characters)</li>
              <li>Use hyphens to separate words, not underscores</li>
              <li>Include target keywords for better SEO</li>
              <li>Avoid special characters and numbers when possible</li>
              <li>Make slugs readable and meaningful to users</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </AnimatedElement>
  );
};

export default SlugGenerator;
