
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, RefreshCw, Hash, Target, Trophy } from "lucide-react";
import { toast } from "sonner";
import AnimatedElement from "@/components/animated-element";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GameEntry {
  guess: number;
  actual: number;
  diff: number;
}

const RandomNumberGenerator = () => {
  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(100);
  const [result, setResult] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  // Game state
  const [guess, setGuess] = useState<string>("");
  const [gameResult, setGameResult] = useState<{ actual: number; diff: number } | null>(null);
  const [gameHistory, setGameHistory] = useState<GameEntry[]>([]);

  const generateNumber = () => {
    if (min > max) {
      toast.error("Minimum value cannot be greater than maximum value");
      return;
    }
    const random = Math.floor(Math.random() * (max - min + 1)) + min;
    setResult(random);
    setHistory((prev) => [random, ...prev].slice(0, 10));
    toast.success("Number generated!");
  };

  const copyToClipboard = () => {
    if (result !== null) {
      navigator.clipboard.writeText(result.toString());
      toast.success("Copied to clipboard");
    }
  };

  const playRound = () => {
    if (min > max) {
      toast.error("Invalid range");
      return;
    }
    const guessNum = parseInt(guess);
    if (isNaN(guessNum)) {
      toast.error("Please enter a valid number");
      return;
    }

    const actual = Math.floor(Math.random() * (max - min + 1)) + min;
    const diff = Math.abs(actual - guessNum);

    setGameResult({ actual, diff });
    setGameHistory(prev => [...prev, { guess: guessNum, actual, diff }].sort((a, b) => a.diff - b.diff).slice(0, 10)); // Keep top 10 best guesses

    if (diff === 0) {
      toast.success("Perfect Guess! You won!");
    } else {
      toast.info(`You were off by ${diff}. Actual: ${actual}`);
    }
  };

  const resetGame = () => {
    setGameResult(null);
    setGameHistory([]);
    setGuess("");
  };

  return (
    <AnimatedElement>
      <div className="space-y-6">
        <Card>
          <CardHeader className="bg-primary text-primary-foreground p-4">
            <CardTitle className="flex items-center">
              <Hash className="mr-2" size={20} />
              Random Number Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="tool" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="tool">Standard Generator</TabsTrigger>
                <TabsTrigger value="game">Guessing Game</TabsTrigger>
              </TabsList>

              <TabsContent value="tool">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="min">Min</Label>
                    <Input
                      id="min"
                      type="number"
                      value={min}
                      onChange={(e) => setMin(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max">Max</Label>
                    <Input
                      id="max"
                      type="number"
                      value={max}
                      onChange={(e) => setMax(Number(e.target.value))}
                    />
                  </div>
                </div>

                <Button onClick={generateNumber} className="w-full mb-6">
                  <RefreshCw className="mr-2 h-4 w-4" /> Generate
                </Button>

                {result !== null && (
                  <div className="text-center p-8 bg-secondary rounded-lg mb-6">
                    <div className="text-6xl font-bold mb-2">{result}</div>
                    <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                      <Copy className="mr-2 h-4 w-4" /> Copy
                    </Button>
                  </div>
                )}

                {history.length > 0 && (
                  <div>
                    <Label className="mb-2 block">Recent Numbers</Label>
                    <div className="flex flex-wrap gap-2">
                      {history.map((num, i) => (
                        <span
                          key={i}
                          className="bg-secondary px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="game">
                <div className="text-center mb-6 text-muted-foreground">
                  Guess the number between {min} and {max}. The closer you are, the higher you rank!
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="game-min">Min Range</Label>
                    <Input
                      id="game-min"
                      type="number"
                      value={min}
                      onChange={(e) => setMin(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="game-max">Max Range</Label>
                    <Input
                      id="game-max"
                      type="number"
                      value={max}
                      onChange={(e) => setMax(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <Label htmlFor="guess" className="text-primary font-bold">Your Guess</Label>
                  <div className="flex gap-2">
                    <Input
                      id="guess"
                      type="number"
                      placeholder={`Enter number between ${min}-${max}`}
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      className="text-lg"
                    />
                    <Button onClick={playRound} size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none min-w-[120px]">
                      <Target className="mr-2 h-4 w-4" /> Check
                    </Button>
                  </div>
                </div>

                {gameResult && (
                  <div className={`text-center p-6 rounded-lg mb-6 transition-all animate-in zoom-in duration-300 ${gameResult.diff === 0 ? 'bg-green-100 dark:bg-green-900/30 border-green-500' : 'bg-secondary'}`}>
                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Result</div>
                    <div className="flex justify-center items-end gap-2 mb-2">
                      <span className="text-4xl font-bold">Actual: {gameResult.actual}</span>
                    </div>
                    <div className="text-lg">
                      Difference: <span className="font-bold text-primary">{gameResult.diff}</span>
                    </div>
                    {gameResult.diff === 0 && (
                      <div className="mt-2 font-bold text-green-600 dark:text-green-400 flex items-center justify-center">
                        <Trophy className="mr-2 h-5 w-5" /> Perfect Match!
                      </div>
                    )}
                  </div>
                )}

                {gameHistory.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted p-3 font-semibold flex items-center">
                      <Trophy className="mr-2 h-4 w-4 text-yellow-500" /> Best Guesses (Closest)
                    </div>
                    <div className="divide-y">
                      {gameHistory.map((entry, idx) => (
                        <div key={idx} className="p-3 flex justify-between items-center hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${idx === 0 ? 'bg-yellow-500 text-white' : idx === 1 ? 'bg-gray-400 text-white' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                              {idx + 1}
                            </span>
                            <span>Guessed: {entry.guess}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Off by: <span className="font-mono font-bold text-foreground">{entry.diff}</span> (Actual: {entry.actual})
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-2 bg-muted/30 text-center">
                      <Button variant="ghost" size="sm" onClick={resetGame} className="text-xs">
                        Clear Ranking
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AnimatedElement>
  );
};

export default RandomNumberGenerator;
