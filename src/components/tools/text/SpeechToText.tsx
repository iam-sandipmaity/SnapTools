import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Copy, X, Mic, MicOff, Circle } from "lucide-react";
import AnimatedElement from "@/components/animated-element";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

// TypeScript declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const SpeechToText = () => {
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [continuous, setContinuous] = useState(true);
  const [interimResults, setInterimResults] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Check if speech recognition is supported
  const isSpeechSupported =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    if (!isSpeechSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition not initialized");
      return;
    }

    try {
      const recognition = recognitionRef.current;

      // Configure recognition
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = selectedLanguage;

      // Event handlers
      recognition.onstart = () => {
        setIsListening(true);
        toast.success("Listening... Speak now");
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcriptPiece + " ";
          } else {
            interim += transcriptPiece;
          }
        }

        if (final) {
          setTranscript((prev) => prev + final);
        }
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        
        // Don't stop listening for no-speech or aborted errors in continuous mode
        if (event.error === "no-speech" || event.error === "aborted") {
          if (continuous) {
            return; // Let it continue
          }
        }
        
        setIsListening(false);
        setInterimTranscript("");

        switch (event.error) {
          case "no-speech":
            toast.info("No speech detected. Speak clearly into your microphone.");
            break;
          case "audio-capture":
            toast.error("No microphone found. Please check your microphone.");
            break;
          case "not-allowed":
            toast.error("Microphone permission denied. Please allow microphone access.");
            break;
          case "network":
            toast.error("Network error. Speech recognition requires internet connection. Please check your connection and try again.");
            break;
          case "aborted":
            // Don't show error for aborted (user stopped)
            break;
          case "service-not-allowed":
            toast.error("Speech service not available. Try using Chrome or Edge browser.");
            break;
          default:
            toast.error(`Error: ${event.error}. Please try again.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript("");
        if (continuous && isListening) {
          // Restart if continuous mode is on and user didn't manually stop
          try {
            recognition.start();
          } catch (e) {
            console.error("Failed to restart recognition:", e);
          }
        }
      };

      recognition.start();
    } catch (error) {
      console.error("Error starting recognition:", error);
      toast.error("Failed to start speech recognition");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimTranscript("");
      toast.info("Stopped listening");
    }
  };

  const copyToClipboard = () => {
    if (!transcript) {
      toast.error("No text to copy");
      return;
    }
    navigator.clipboard
      .writeText(transcript)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
  };

  const clearAll = () => {
    setTranscript("");
    setInterimTranscript("");
    if (isListening) {
      stopListening();
    }
  };

  const languages = [
    { value: "en-US", label: "English (US)" },
    { value: "en-GB", label: "English (UK)" },
    { value: "es-ES", label: "Spanish (Spain)" },
    { value: "es-MX", label: "Spanish (Mexico)" },
    { value: "fr-FR", label: "French" },
    { value: "de-DE", label: "German" },
    { value: "it-IT", label: "Italian" },
    { value: "pt-BR", label: "Portuguese (Brazil)" },
    { value: "pt-PT", label: "Portuguese (Portugal)" },
    { value: "ru-RU", label: "Russian" },
    { value: "ja-JP", label: "Japanese" },
    { value: "ko-KR", label: "Korean" },
    { value: "zh-CN", label: "Chinese (Simplified)" },
    { value: "zh-TW", label: "Chinese (Traditional)" },
    { value: "hi-IN", label: "Hindi" },
    { value: "ar-SA", label: "Arabic" },
    { value: "tr-TR", label: "Turkish" },
    { value: "nl-NL", label: "Dutch" },
    { value: "pl-PL", label: "Polish" },
    { value: "sv-SE", label: "Swedish" },
  ];

  if (!isSpeechSupported) {
    return (
      <AnimatedElement>
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Speech to Text</CardTitle>
            <CardDescription>
              Convert speech to text online free
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 text-center space-y-3">
              <p className="text-muted-foreground">
                Speech recognition is not supported in your browser.
              </p>
              <p className="text-sm text-muted-foreground">
                Please try using Chrome, Edge, or Safari for the best experience.
              </p>
            </div>
          </CardContent>
        </Card>
      </AnimatedElement>
    );
  }

  return (
    <AnimatedElement>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Speech to Text</CardTitle>
          <CardDescription>
            Convert speech to text using your microphone. Transcribe audio in real-time
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Language Selection */}
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select 
              value={selectedLanguage} 
              onValueChange={setSelectedLanguage}
              disabled={isListening}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="continuous"
                checked={continuous}
                onCheckedChange={(checked) => setContinuous(checked as boolean)}
                disabled={isListening}
              />
              <label
                htmlFor="continuous"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Continuous recording
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="interimResults"
                checked={interimResults}
                onCheckedChange={(checked) => setInterimResults(checked as boolean)}
                disabled={isListening}
              />
              <label
                htmlFor="interimResults"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Show interim results
              </label>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3 justify-center">
            {!isListening ? (
              <Button onClick={startListening} size="lg" className="min-w-[150px]">
                <Mic className="h-5 w-5 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button onClick={stopListening} size="lg" variant="destructive" className="min-w-[150px]">
                <MicOff className="h-5 w-5 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>

          {/* Status Badge */}
          {isListening && (
            <div className="flex justify-center">
              <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20 animate-pulse">
                <Circle className="h-3 w-3 mr-2 fill-red-500" />
                Recording...
              </Badge>
            </div>
          )}

          {/* Transcript Output */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="transcript">Transcript</Label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  disabled={!transcript}
                >
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  <X className="h-4 w-4 mr-1" /> Clear
                </Button>
              </div>
            </div>
            <Textarea
              id="transcript"
              placeholder="Your transcribed text will appear here..."
              className="min-h-[300px]"
              value={transcript + (interimTranscript ? ` ${interimTranscript}` : "")}
              readOnly
            />
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Characters: {transcript.length}</span>
              <span>Words: {transcript.trim() ? transcript.trim().split(/\s+/).length : 0}</span>
              {interimTranscript && (
                <Badge variant="secondary" className="text-xs">
                  Transcribing...
                </Badge>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Tips for Better Results:
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Speak clearly and at a moderate pace</li>
              <li>Use a good quality microphone for better accuracy</li>
              <li>Minimize background noise</li>
              <li>Enable continuous recording for longer transcriptions</li>
              <li><strong>Internet connection required</strong> - Speech recognition uses cloud processing</li>
              <li>Click "Stop Recording" when finished</li>
              <li>If you get network errors, check your internet connection and try again</li>
            </ul>
          </div>

          {/* Browser Note */}
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">
              🔒 Your audio is processed securely. Microphone permission and internet connection required.
            </p>
          </div>
        </CardContent>
      </Card>
    </AnimatedElement>
  );
};

export default SpeechToText;
