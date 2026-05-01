import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import AnimatedElement from "@/components/animated-element";

const UrlEncoderDecoder = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [activeTab, setActiveTab] = useState<"encode" | "decode">("encode");

  const encodeUrl = () => {
    if (!input.trim()) {
      toast.error("Please enter a URL to encode");
      return;
    }

    try {
      const encoded = encodeURIComponent(input);
      setOutput(encoded);
      toast.success("URL encoded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to encode URL");
    }
  };

  const decodeUrl = () => {
    if (!input.trim()) {
      toast.error("Please enter a URL to decode");
      return;
    }

    try {
      const decoded = decodeURIComponent(input);
      setOutput(decoded);
      toast.success("URL decoded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to decode URL. Invalid encoded string.");
    }
  };

  const handleTabChange = (value: "encode" | "decode") => {
    setActiveTab(value);
    setInput("");
    setOutput("");
  };

  const copyToClipboard = () => {
    if (!output) {
      toast.error("No result to copy");
      return;
    }
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-8">
      <AnimatedElement animation="fade-up" duration={0.6}>
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">URL Encoder / Decoder</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Encode or decode URL strings directly in your browser.
          </p>
        </div>
      </AnimatedElement>

      <AnimatedElement animation="fade-up" duration={0.6} delay={0.1}>
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as "encode" | "decode")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="encode">Encode</TabsTrigger>
                <TabsTrigger value="decode">Decode</TabsTrigger>
              </TabsList>

              <TabsContent value="encode" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="encode-input">URL to Encode</Label>
                  <Textarea
                    id="encode-input"
                    placeholder="Enter URL or text to encode"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                <Button onClick={encodeUrl} className="w-full">
                  Encode URL
                </Button>
              </TabsContent>

              <TabsContent value="decode" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="decode-input">Encoded URL to Decode</Label>
                  <Textarea
                    id="decode-input"
                    placeholder="Enter encoded URL or text to decode"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                <Button onClick={decodeUrl} className="w-full">
                  Decode URL
                </Button>
              </TabsContent>
            </Tabs>

            <div className="space-y-2 mt-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="output">Result</Label>
                <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!output}>
                  Copy
                </Button>
              </div>
              <Textarea
                id="output"
                value={output}
                readOnly
                placeholder="Result will appear here"
                className="min-h-[120px]"
              />
            </div>
          </CardContent>
        </Card>
      </AnimatedElement>
    </div>
  );
};

export default UrlEncoderDecoder;
