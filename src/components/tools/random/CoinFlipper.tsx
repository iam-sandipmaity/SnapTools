
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, RotateCw, Trophy, Target } from "lucide-react";
import { toast } from "sonner";
import AnimatedElement from "@/components/animated-element";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CoinFlipper = () => {
    const [isFlipping, setIsFlipping] = useState(false);
    const [result, setResult] = useState<"Heads" | "Tails" | null>(null);

    // Game state
    const [prediction, setPrediction] = useState<"Heads" | "Tails" | null>(null);
    const [score, setScore] = useState({ wins: 0, total: 0 });
    const [gameMessage, setGameMessage] = useState<string | null>(null);

    const flipCoin = (gameMode = false) => {
        if (isFlipping) return;
        if (gameMode && !prediction) {
            toast.error("Please select Heads or Tails first!");
            return;
        }

        setIsFlipping(true);
        setResult(null);
        setGameMessage(null);

        // Random duration between 1.5s and 2.5s
        const duration = Math.random() * 1000 + 1500;

        setTimeout(() => {
            const outcome = Math.random() > 0.5 ? "Heads" : "Tails";
            setResult(outcome);
            setIsFlipping(false);

            if (gameMode && prediction) {
                const win = outcome === prediction;
                setScore(prev => ({
                    wins: prev.wins + (win ? 1 : 0),
                    total: prev.total + 1
                }));
                if (win) {
                    setGameMessage("Correct! You won!");
                    toast.success("Correct Prediction!");
                } else {
                    setGameMessage("Wrong! Better luck next time.");
                    toast.error("Wrong Prediction!");
                }
                setPrediction(null); // Reset prediction for next round
            } else {
                toast.success(`It's ${outcome}!`);
            }

        }, duration);
    };

    const CoinVisual = () => (
        <div className="relative w-32 h-32 mb-8 perspective-1000">
            <motion.div
                className={`w-full h-full relative preserve-3d cursor-pointer ${isFlipping ? "animate-spin-y" : ""
                    }`}
                animate={{
                    rotateY: isFlipping ? 1800 + (Math.random() * 360) : 0,
                }}
                transition={{ duration: 2, ease: "easeOut" }}
                onClick={() => !isFlipping && flipCoin(false)}
            >
                <div className={`absolute inset-0 backface-hidden flex items-center justify-center rounded-full border-4 shadow-xl ${result === "Heads" || (!result) ? "bg-yellow-500 border-yellow-600" : "bg-gray-300 border-gray-400"
                    }`}>
                    <span className={`text-2xl font-bold ${result === "Heads" || (!result) ? "text-yellow-900" : "text-gray-800"
                        }`}>
                        {result === "Tails" ? "TAILS" : "HEADS"}
                    </span>
                </div>
            </motion.div>
        </div>
    );

    return (
        <AnimatedElement>
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader className="bg-primary text-primary-foreground p-4">
                        <CardTitle className="flex items-center">
                            <Coins className="mr-2" size={24} />
                            Coin Flipper
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Tabs defaultValue="tool" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="tool">Standard Flip</TabsTrigger>
                                <TabsTrigger value="game">Prediction Game</TabsTrigger>
                            </TabsList>

                            <TabsContent value="tool" className="flex flex-col items-center justify-center min-h-[300px]">
                                <CoinVisual />

                                <Button
                                    onClick={() => flipCoin(false)}
                                    disabled={isFlipping}
                                    size="lg"
                                    className="min-w-[150px]"
                                >
                                    {isFlipping ? (
                                        <>
                                            <RotateCw className="mr-2 h-4 w-4 animate-spin" /> Flipping...
                                        </>
                                    ) : (
                                        "Flip Coin"
                                    )}
                                </Button>

                                {result && !isFlipping && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6 text-3xl font-bold text-center text-primary"
                                    >
                                        {result}
                                    </motion.div>
                                )}
                            </TabsContent>

                            <TabsContent value="game" className="flex flex-col items-center justify-center min-h-[300px]">
                                <div className="mb-6 w-full flex justify-between items-center bg-secondary p-3 rounded-lg">
                                    <div className="text-sm font-semibold">
                                        Score: {score.wins} / {score.total}
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setScore({ wins: 0, total: 0 })} className="h-6 text-xs">Reset</Button>
                                </div>

                                <CoinVisual />

                                <div className="flex gap-4 mb-6">
                                    <Button
                                        variant={prediction === "Heads" ? "default" : "outline"}
                                        onClick={() => setPrediction("Heads")}
                                        disabled={isFlipping}
                                        className={`w-24 ${prediction === "Heads" ? "ring-2 ring-primary ring-offset-2" : ""}`}
                                    >
                                        Heads
                                    </Button>
                                    <Button
                                        variant={prediction === "Tails" ? "default" : "outline"}
                                        onClick={() => setPrediction("Tails")}
                                        disabled={isFlipping}
                                        className={`w-24 ${prediction === "Tails" ? "ring-2 ring-primary ring-offset-2" : ""}`}
                                    >
                                        Tails
                                    </Button>
                                </div>

                                <Button
                                    onClick={() => flipCoin(true)}
                                    disabled={isFlipping || !prediction}
                                    size="lg"
                                    className="min-w-[150px] bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 border-none"
                                >
                                    {isFlipping ? (
                                        <>
                                            <RotateCw className="mr-2 h-4 w-4 animate-spin" /> Flipping...
                                        </>
                                    ) : (
                                        <>
                                            <Target className="mr-2 h-4 w-4" /> Flip & Predict
                                        </>
                                    )}
                                </Button>

                                {gameMessage && !isFlipping && (
                                    <motion.div
                                        key={score.total} // Re-animate on score change
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`mt-6 text-xl font-bold text-center px-4 py-2 rounded-full ${gameMessage.includes("Correct") ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                            }`}
                                    >
                                        {gameMessage}
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

export default CoinFlipper;
