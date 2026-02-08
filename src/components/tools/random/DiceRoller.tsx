
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dices, RotateCcw, Trophy } from "lucide-react";
import { toast } from "sonner";
import AnimatedElement from "@/components/animated-element";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dice1, Dice2, Dice3, Dice4, Dice5, Dice6,
} from "lucide-react";

// Map dice values to icons
const DiceIcons: Record<number, any> = {
    1: Dice1,
    2: Dice2,
    3: Dice3,
    4: Dice4,
    5: Dice5,
    6: Dice6,
};

const DiceRoller = () => {
    const [numDice, setNumDice] = useState<number | "">(1);
    const [sides, setSides] = useState<number | "">(6);
    const [results, setResults] = useState<number[]>([]);
    const [total, setTotal] = useState<number | null>(null);

    // Game Mode State
    const [prediction, setPrediction] = useState<number | "">("");
    const [gameResult, setGameResult] = useState<{ bg: string; text: string } | null>(null);

    const rollDice = (isGame = false) => {
        const n = Number(numDice);
        const s = Number(sides);

        if (!n || n < 1 || n > 10) {
            toast.error("Please choose between 1 and 10 dice.");
            return;
        }
        if (!s || s < 2) {
            toast.error("Dice must have at least 2 sides.");
            return;
        }

        if (isGame) {
            if (prediction === "" || isNaN(Number(prediction))) {
                toast.error("Please enter your prediction!");
                return;
            }
        }

        // Simulate rolling animation or delay could be added here
        const newResults = Array.from({ length: n }, () => Math.floor(Math.random() * s) + 1);
        const newTotal = newResults.reduce((acc, curr) => acc + curr, 0);

        setResults(newResults);
        setTotal(newTotal);

        if (isGame) {
            if (Number(prediction) === newTotal) {
                setGameResult({ bg: "bg-green-100 dark:bg-green-900/30", text: "You Won! Perfect Guess!" });
                toast.success("You Won!");
            } else {
                setGameResult({ bg: "bg-red-100 dark:bg-red-900/30", text: `You Lost! Prediction: ${prediction}, Actual: ${newTotal}` });
                toast.error("Try again!");
            }
        } else {
            toast.success("Dice rolled!");
            setGameResult(null);
        }
    };

    const reset = () => {
        setResults([]);
        setTotal(null);
        setNumDice(1);
        setPrediction("");
        setGameResult(null);
    };

    const DiceDisplay = () => (
        <>
            {results.length > 0 && (
                <div className={`text-center p-6 rounded-lg transition-colors duration-300 ${gameResult ? gameResult.bg : 'bg-secondary'}`}>
                    <div className="flex flex-wrap justify-center gap-4 mb-4">
                        {results.map((val, idx) => {
                            const DiceIcon = DiceIcons[val];
                            return (
                                <div key={idx} className="flex flex-col items-center">
                                    {Number(sides) === 6 && DiceIcon ? (
                                        <DiceIcon size={48} className="text-primary" />
                                    ) : (
                                        <div className="w-12 h-12 flex items-center justify-center border-2 border-primary rounded-lg text-xl font-bold bg-background text-foreground">
                                            {val}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-2xl font-bold">Total: {total}</div>
                    {gameResult && (
                        <div className="mt-2 text-lg font-semibold animate-pulse">
                            {gameResult.text}
                        </div>
                    )}
                </div>
            )}
        </>
    )

    return (
        <AnimatedElement>
            <Card className="max-w-2xl mx-auto">
                <CardHeader className="bg-primary text-primary-foreground p-4">
                    <CardTitle className="flex items-center">
                        <Dices className="mr-2" size={24} />
                        Dice Roller
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <Tabs defaultValue="tool" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="tool">Standard Roller</TabsTrigger>
                            <TabsTrigger value="game">Prediction Game</TabsTrigger>
                        </TabsList>

                        <TabsContent value="tool" className="space-y-6">
                            <div className="flex gap-4 items-center justify-center">
                                <div className="w-1/3">
                                    <Label htmlFor="numDice">Number of Dice</Label>
                                    <Input
                                        id="numDice"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={numDice}
                                        onChange={(e) => setNumDice(e.target.value === "" ? "" : parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="w-1/3">
                                    <Label htmlFor="sides">Sides (Default: 6)</Label>
                                    <Input
                                        id="sides"
                                        type="number"
                                        min="2"
                                        value={sides}
                                        onChange={(e) => setSides(e.target.value === "" ? "" : parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-center gap-4">
                                <Button onClick={() => rollDice(false)} size="lg" className="w-full md:w-auto">
                                    Roll Dice
                                </Button>
                                <Button variant="outline" onClick={reset} size="lg">
                                    <RotateCcw className="mr-2 h-4 w-4" /> Reset
                                </Button>
                            </div>
                            <DiceDisplay />
                        </TabsContent>

                        <TabsContent value="game" className="space-y-6">
                            <div className="text-center mb-4 text-muted-foreground">
                                Predict the total sum of the dice to win!
                            </div>
                            <div className="grid grid-cols-3 gap-4 items-end">
                                <div className="w-full">
                                    <Label htmlFor="gameNumDice">Number of Dice</Label>
                                    <Input
                                        id="gameNumDice"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={numDice}
                                        onChange={(e) => setNumDice(e.target.value === "" ? "" : parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="w-full">
                                    <Label htmlFor="gameSides">Sides</Label>
                                    <Input
                                        id="gameSides"
                                        type="number"
                                        min="2"
                                        value={sides}
                                        onChange={(e) => setSides(e.target.value === "" ? "" : parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="w-full">
                                    <Label htmlFor="prediction" className="text-primary font-bold">Your Prediction</Label>
                                    <Input
                                        id="prediction"
                                        type="number"
                                        placeholder="Total Sum?"
                                        value={prediction}
                                        onChange={(e) => setPrediction(e.target.value === "" ? "" : parseInt(e.target.value))}
                                        className="border-primary"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-center gap-4 mt-6">
                                <Button onClick={() => rollDice(true)} size="lg" className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-none">
                                    <Trophy className="mr-2 h-4 w-4" /> Roll & Predict
                                </Button>
                                <Button variant="outline" onClick={reset} size="lg">
                                    <RotateCcw className="mr-2 h-4 w-4" /> Reset
                                </Button>
                            </div>

                            <DiceDisplay />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </AnimatedElement>
    );
};

export default DiceRoller;
