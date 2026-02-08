
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, CircleDashed, XCircle, BrainCircuit } from "lucide-react";
import { toast } from "sonner";
import AnimatedElement from "@/components/animated-element";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const YesNoDecisionMaker = () => {
    const [result, setResult] = useState<"Yes" | "No" | null>(null);
    const [isDeciding, setIsDeciding] = useState(false);

    // Game state
    const [prediction, setPrediction] = useState<"Yes" | "No" | null>(null);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [gameResult, setGameResult] = useState<string | null>(null);

    const decide = (gameMode = false) => {
        if (gameMode && !prediction) {
            toast.error("Please select Yes or No first!");
            return;
        }

        setIsDeciding(true);
        setResult(null);
        setGameResult(null);

        setTimeout(() => {
            const outcome = Math.random() > 0.5 ? "Yes" : "No";
            setResult(outcome);
            setIsDeciding(false);

            if (gameMode && prediction) {
                const isCorrect = outcome === prediction;
                setScore(prev => ({
                    correct: prev.correct + (isCorrect ? 1 : 0),
                    total: prev.total + 1
                }));
                if (isCorrect) {
                    setGameResult("Correct! You have the gift of foresight!");
                    toast.success("Correct Prediction!");
                } else {
                    setGameResult("Wrong! The universe has spoken otherwise.");
                    toast.error("Wrong Prediction!");
                }
                setPrediction(null);
            } else {
                toast.success("Decision made!");
            }
        }, 1500);
    };

    const DecisionVisual = () => (
        <>
            {isDeciding ? (
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="mb-8"
                >
                    <div className="w-24 h-24 border-4 border-dashed rounded-full border-primary" />
                </motion.div>
            ) : result ? (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`mb-8 flex flex-col items-center justify-center ${result === "Yes" ? "text-green-500" : "text-red-500"
                        }`}
                >
                    {result === "Yes" ? (
                        <CheckCircle2 size={96} />
                    ) : (
                        <XCircle size={96} />
                    )}
                    <span className="text-4xl font-bold mt-4">{result.toUpperCase()}</span>
                </motion.div>
            ) : (
                <div className="mb-8 text-muted-foreground text-center">
                    <CircleDashed size={96} className="mx-auto mb-2 opacity-50" />
                    <p>Click below to decide</p>
                </div>
            )}
        </>
    );

    return (
        <AnimatedElement>
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader className="bg-primary text-primary-foreground p-4">
                        <CardTitle className="flex items-center">
                            <CircleDashed className="mr-2" size={24} />
                            Yes / No Decision Maker
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Tabs defaultValue="tool" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="tool">Standard Decision</TabsTrigger>
                                <TabsTrigger value="game">Prediction Game</TabsTrigger>
                            </TabsList>

                            <TabsContent value="tool" className="flex flex-col items-center justify-center min-h-[300px]">
                                <DecisionVisual />
                                <Button onClick={() => decide(false)} disabled={isDeciding} size="lg" className="w-full">
                                    {isDeciding ? "Thinking..." : "Make a Decision"}
                                </Button>
                            </TabsContent>

                            <TabsContent value="game" className="flex flex-col items-center justify-center min-h-[300px]">
                                <div className="mb-6 w-full flex justify-between items-center bg-secondary p-3 rounded-lg">
                                    <div className="text-sm font-semibold">
                                        Score: {score.correct} / {score.total}
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setScore({ correct: 0, total: 0 })} className="h-6 text-xs">Reset</Button>
                                </div>

                                <DecisionVisual />

                                <div className="flex gap-4 mb-6 w-full">
                                    <Button
                                        variant={prediction === "Yes" ? "default" : "outline"}
                                        onClick={() => setPrediction("Yes")}
                                        disabled={isDeciding}
                                        className={`flex-1 ${prediction === "Yes" ? "bg-green-600 hover:bg-green-700 text-white ring-2 ring-green-600 ring-offset-2" : "text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20"}`}
                                    >
                                        Predict YES
                                    </Button>
                                    <Button
                                        variant={prediction === "No" ? "default" : "outline"}
                                        onClick={() => setPrediction("No")}
                                        disabled={isDeciding}
                                        className={`flex-1 ${prediction === "No" ? "bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-600 ring-offset-2" : "text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"}`}
                                    >
                                        Predict NO
                                    </Button>
                                </div>

                                <Button
                                    onClick={() => decide(true)}
                                    disabled={isDeciding || !prediction}
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-none"
                                >
                                    {isDeciding ? (
                                        "Fate is deciding..."
                                    ) : (
                                        <>
                                            <BrainCircuit className="mr-2 h-4 w-4" /> Test Your Intuition
                                        </>
                                    )}
                                </Button>

                                {gameResult && !isDeciding && (
                                    <motion.div
                                        key={score.total}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`mt-6 text-xl font-bold text-center px-4 py-2 rounded-full w-full ${gameResult.includes("Correct") ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                            }`}
                                    >
                                        {gameResult}
                                    </motion.div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AnimatedElement>
    );
};

export default YesNoDecisionMaker;
