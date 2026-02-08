
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List, Check, RotateCw, Trophy, Target } from "lucide-react";
import { toast } from "sonner";
import AnimatedElement from "@/components/animated-element";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const RandomPicker = () => {
    const [items, setItems] = useState("");
    const [result, setResult] = useState<string | null>(null);
    const [isPicking, setIsPicking] = useState(false);

    // Game state
    const [prediction, setPrediction] = useState<string>("");
    const [gameResult, setGameResult] = useState<string | null>(null);

    const itemList = items.split("\n").filter((item) => item.trim() !== "");

    const pickItem = (gameMode = false) => {
        if (items.trim() === "") {
            toast.error("Please enter at least one item.");
            return;
        }

        if (itemList.length === 0) {
            toast.error("Please enter at least one valid item.");
            return;
        }

        if (gameMode && !prediction) {
            toast.error("Please select your prediction first!");
            return;
        }

        // Ensure prediction is in the current list
        if (gameMode && !itemList.includes(prediction)) {
            toast.error("Your prediction must be one of the items in the list!");
            return;
        }


        setIsPicking(true);
        setResult(null);
        setGameResult(null);

        // Simulate picking effect
        const duration = 2000;
        const interval = 100;
        let elapsed = 0;

        const pickInterval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * itemList.length);
            setResult(itemList[randomIndex]);
            elapsed += interval;
            if (elapsed >= duration) {
                clearInterval(pickInterval);
                setIsPicking(false);
                const finalPick = itemList[Math.floor(Math.random() * itemList.length)];
                setResult(finalPick);

                if (gameMode) {
                    if (finalPick === prediction) {
                        setGameResult("Correct! You have chosen wisely!");
                        toast.success("Correct Prediction!");
                    } else {
                        setGameResult(`Wrong! The winner was ${finalPick}.`);
                        toast.error("Wrong Prediction!");
                    }
                    setPrediction(""); // Reset
                } else {
                    toast.success(`Picked: ${finalPick}`);
                }
            }
        }, interval);
    };

    const clearItems = () => {
        setItems("");
        setResult(null);
        setIsPicking(false);
        setPrediction("");
        setGameResult(null);
    };

    const ResultDisplay = () => (
        <div className="flex flex-col items-center justify-center p-8 bg-secondary/30 rounded-lg min-h-[300px] w-full">
            {result ? (
                <motion.div
                    key={result}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                >
                    <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                        Winner
                    </div>
                    <div className="text-3xl font-bold text-primary break-words max-w-[200px]">
                        {result}
                    </div>
                </motion.div>
            ) : (
                <div className="text-center text-muted-foreground opacity-50">
                    <List size={64} className="mx-auto mb-4" />
                    <p>Add items and click Pick Random</p>
                </div>
            )}
        </div>
    );

    return (
        <AnimatedElement>
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader className="bg-primary text-primary-foreground p-4">
                        <CardTitle className="flex items-center">
                            <List className="mr-2" size={24} />
                            Random Picker
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Tabs defaultValue="tool" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="tool">Standard Picker</TabsTrigger>
                                <TabsTrigger value="game">Prediction Game</TabsTrigger>
                            </TabsList>

                            <TabsContent value="tool" className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label htmlFor="items">
                                        Enter items (one per line)
                                    </Label>
                                    <Textarea
                                        id="items"
                                        placeholder="Item 1&#10;Item 2&#10;Item 3"
                                        value={items}
                                        onChange={(e) => setItems(e.target.value)}
                                        rows={10}
                                        className="resize-none font-mono text-sm"
                                    />
                                    <div className="flex gap-2">
                                        <Button onClick={() => pickItem(false)} disabled={isPicking} className="w-full">
                                            {isPicking ? (
                                                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Check className="mr-2 h-4 w-4" />
                                            )}
                                            Pick Random
                                        </Button>
                                        <Button variant="outline" onClick={clearItems} disabled={isPicking}>
                                            Clear
                                        </Button>
                                    </div>
                                </div>
                                <ResultDisplay />
                            </TabsContent>

                            <TabsContent value="game" className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label htmlFor="game-items">
                                        Enter items (one per line) to create the pool
                                    </Label>
                                    <Textarea
                                        id="game-items"
                                        placeholder="Item 1&#10;Item 2&#10;Item 3"
                                        value={items}
                                        onChange={(e) => setItems(e.target.value)}
                                        rows={8}
                                        className="resize-none font-mono text-sm"
                                    />

                                    <div className="space-y-2">
                                        <Label className="text-primary font-bold">Predict the Winner</Label>
                                        <Select value={prediction} onValueChange={setPrediction}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an item..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {itemList.length > 0 ? (
                                                    itemList.map((item, idx) => (
                                                        <SelectItem key={`${item}-${idx}`} value={item}>{item}</SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="placeholder" disabled>Add items first</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button onClick={() => pickItem(true)} disabled={isPicking || !prediction} className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 border-none">
                                            {isPicking ? (
                                                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Target className="mr-2 h-4 w-4" /> Lock In Prediction
                                                </>
                                            )}
                                        </Button>
                                        <Button variant="outline" onClick={clearItems} disabled={isPicking}>
                                            Clear
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <ResultDisplay />
                                    {gameResult && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`mt-4 p-4 rounded-lg text-center font-bold ${gameResult.includes("Correct") ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                                }`}
                                        >
                                            {gameResult}
                                        </motion.div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AnimatedElement>
    );
};

export default RandomPicker;
