import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { X, Play, Pause, Square, Volume2 } from "lucide-react";
import AnimatedElement from "@/components/animated-element";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const TextToSpeech = () => {
  const [text, setText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [rate, setRate] = useState([1]);
  const [pitch, setPitch] = useState([1]);
  const [volume, setVolume] = useState([1]);

  // Check if speech synthesis is supported
  const isSpeechSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!isSpeechSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = () => {
    if (!text.trim()) {
      toast.error("Please enter some text to speak");
      return;
    }

    if (!isSpeechSupported) {
      toast.error("Text-to-speech is not supported in your browser");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set selected voice
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) {
      utterance.voice = voice;
    }

    // Set speech parameters
    utterance.rate = rate[0];
    utterance.pitch = pitch[0];
    utterance.volume = volume[0];

    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      toast.error("Failed to generate speech");
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    toast.success("Playing speech");
  };

  const pause = () => {
    if (!isSpeechSupported) return;
    
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      toast.info("Speech resumed");
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
      toast.info("Speech paused");
    }
  };

  const stop = () => {
    if (!isSpeechSupported) return;
    
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    toast.info("Speech stopped");
  };

  const clearAll = () => {
    setText("");
    stop();
  };

  // Group voices by language
  const groupedVoices = voices.reduce((acc, voice) => {
    const lang = voice.lang.split("-")[0];
    if (!acc[lang]) {
      acc[lang] = [];
    }
    acc[lang].push(voice);
    return acc;
  }, {} as Record<string, SpeechSynthesisVoice[]>);

  if (!isSpeechSupported) {
    return (
      <AnimatedElement>
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Text to Speech</CardTitle>
            <CardDescription>
              Convert text to speech online free
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 text-center">
              <p className="text-muted-foreground">
                Text-to-speech is not supported in your browser. Please try using a modern browser like Chrome, Edge, or Safari.
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
          <CardTitle>Text to Speech</CardTitle>
          <CardDescription>
            Convert text to natural-sounding speech with adjustable voice, speed, and pitch
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Text Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="text">Text to Speak</Label>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            </div>
            <Textarea
              id="text"
              placeholder="Enter the text you want to convert to speech..."
              className="min-h-[200px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="text-sm text-muted-foreground">
              Characters: {text.length} | Words: {text.trim() ? text.trim().split(/\s+/).length : 0}
            </div>
          </div>

          {/* Voice Selection */}
          <div className="space-y-2">
            <Label htmlFor="voice">Voice</Label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger>
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {Object.entries(groupedVoices).map(([lang, voiceList]) => (
                  <div key={lang}>
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                      {lang.toUpperCase()}
                    </div>
                    {voiceList.map((voice) => (
                      <SelectItem key={voice.name} value={voice.name}>
                        {voice.name} {voice.localService ? "⭐" : ""}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              ⭐ Indicates local/offline voice
            </p>
          </div>

          {/* Speed Control */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="rate">Speed</Label>
              <span className="text-sm text-muted-foreground">{rate[0]}x</span>
            </div>
            <Slider
              id="rate"
              min={0.5}
              max={2}
              step={0.1}
              value={rate}
              onValueChange={setRate}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Slow (0.5x)</span>
              <span>Normal (1x)</span>
              <span>Fast (2x)</span>
            </div>
          </div>

          {/* Pitch Control */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="pitch">Pitch</Label>
              <span className="text-sm text-muted-foreground">{pitch[0]}</span>
            </div>
            <Slider
              id="pitch"
              min={0}
              max={2}
              step={0.1}
              value={pitch}
              onValueChange={setPitch}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low (0)</span>
              <span>Normal (1)</span>
              <span>High (2)</span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="volume">Volume</Label>
              <span className="text-sm text-muted-foreground">{Math.round(volume[0] * 100)}%</span>
            </div>
            <Slider
              id="volume"
              min={0}
              max={1}
              step={0.1}
              value={volume}
              onValueChange={setVolume}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Silent (0%)</span>
              <span>Normal (100%)</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3 justify-center">
            {!isPlaying ? (
              <Button onClick={speak} size="lg" disabled={!text.trim()}>
                <Play className="h-5 w-5 mr-2" />
                Play
              </Button>
            ) : (
              <>
                <Button onClick={pause} size="lg" variant="outline">
                  {isPaused ? (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </>
                  )}
                </Button>
                <Button onClick={stop} size="lg" variant="destructive">
                  <Square className="h-5 w-5 mr-2" />
                  Stop
                </Button>
              </>
            )}
          </div>

          {/* Tips */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Tips:
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Try different voices to find the one that sounds best</li>
              <li>Adjust speed for better comprehension or faster reading</li>
              <li>Use pitch control to make the voice sound more natural</li>
              <li>Local voices (⭐) work offline and are faster</li>
              <li>Some voices support multiple languages</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </AnimatedElement>
  );
};

export default TextToSpeech;
