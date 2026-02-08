
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, RefreshCw, Palette, Trophy, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import AnimatedElement from "@/components/animated-element";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

const ColorGenerator = () => {
    // Tool State
    const [color, setColor] = useState("#3B82F6"); // Initial color (blue-500)
    const [rgb, setRgb] = useState("rgb(59, 130, 246)");
    const [hsl, setHsl] = useState("hsl(217, 91%, 60%)");

    // Game State
    const [gameTarget, setGameTarget] = useState<string>("");
    const [gameOptions, setGameOptions] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [gameMessage, setGameMessage] = useState<string | null>(null);
    const [isGameActive, setIsGameActive] = useState(false);

    const generateRandomHex = () => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();
    };

    const generateColor = () => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);

        const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
        const rgbStr = `rgb(${r}, ${g}, ${b})`;

        // Convert to HSL
        let r1 = r / 255;
        let g1 = g / 255;
        let b1 = b / 255;
        let max = Math.max(r1, g1, b1);
        let min = Math.min(r1, g1, b1);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r1: h = (g1 - b1) / d + (g1 < b1 ? 6 : 0); break;
                case g1: h = (b1 - r1) / d + 2; break;
                case b1: h = (r1 - g1) / d + 4; break;
            }
            h /= 6;
        }

        const hStr = Math.round(h * 360);
        const sStr = Math.round(s * 100);
        const lStr = Math.round(l * 100);
        const hslStr = `hsl(${hStr}, ${sStr}%, ${lStr}%)`;

        setColor(hex.toUpperCase());
        setRgb(rgbStr);
        setHsl(hslStr);
    };

    // Initial generation
    useEffect(() => {
        // We handle initial state manually but this ensures we have consistent format if needed
    }, []);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`Copied ${text} to clipboard`);
    };

    // Game Logic
    const startNewRound = () => {
        const target = generateRandomHex();
        const opts = [target, generateRandomHex(), generateRandomHex()];
        // Shuffle
        for (let i = opts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [opts[i], opts[j]] = [opts[j], opts[i]];
        }
        setGameTarget(target);
        setGameOptions(opts);
        setGameMessage(null);
        setIsGameActive(true);
    };

    const checkAnswer = (selectedColor: string) => {
        if (!isGameActive) return;

        if (selectedColor === gameTarget) {
            setScore(score + 1);
            setGameMessage("Correct!");
            toast.success("Correct!");
            setTimeout(startNewRound, 1000); // Auto next round
        } else {
            setGameMessage(`Wrong! That was ${selectedColor}. Target was ${gameTarget}. Score reset!`);
            toast.error("Wrong!");
            setScore(0);
            setIsGameActive(false); // Game Over state
        }
    };

    return (
        <AnimatedElement>
            <Card className="max-w-md mx-auto overflow-hidden">
                <CardHeader className="bg-primary text-primary-foreground p-4">
                    <CardTitle className="flex items-center">
                        <Palette className="mr-2" size={20} />
                        Random Color Generator
                    </CardTitle>
                </CardHeader>

                <Tabs defaultValue="tool" className="w-full" onValueChange={(val) => {
                    if (val === 'game' && !gameTarget) startNewRound();
                }}>
                    <div className="px-6 pt-6">
                        <TabsList className="grid w-full grid-cols-2 mb-2">
                            <TabsTrigger value="tool">Generator</TabsTrigger>
                            <TabsTrigger value="game">Color Game</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="tool" className="mt-0">
                        <div
                            className="h-48 w-full transition-colors duration-500 ease-in-out flex items-center justify-center"
                            style={{ backgroundColor: color }}
                        >
                            <span className="bg-black/20 text-white px-4 py-2 rounded-full backdrop-blur-sm font-mono text-xl shadow-lg">
                                {color}
                            </span>
                        </div>

                        <CardContent className="p-6 space-y-4">
                            <Button onClick={() => { generateColor(); toast.success("New color generated!"); }} className="w-full mb-4" size="lg">
                                <RefreshCw className="mr-2 h-5 w-5" /> Generate Random Color
                            </Button>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="font-mono">{color}</div>
                                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(color)}>
                                        <Copy size={16} />
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="font-mono">{rgb}</div>
                                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(rgb)}>
                                        <Copy size={16} />
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="font-mono">{hsl}</div>
                                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(hsl)}>
                                        <Copy size={16} />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </TabsContent>

                    <TabsContent value="game" className="p-6 mt-0">
                        <div className="flex justify-between items-center mb-6 bg-secondary p-3 rounded-lg">
                            <div className="font-bold flex items-center gap-2">
                                <Trophy className="text-yellow-500" size={18} />
                                Score: {score}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => { setScore(0); startNewRound(); }}>Restart</Button>
                        </div>

                        <div className="text-center mb-8">
                            <div className="text-muted-foreground mb-2">Which color matches this code?</div>
                            <div className="text-4xl font-mono font-bold tracking-wider">{gameTarget}</div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {gameOptions.map((opt, idx) => (
                                <motion.button
                                    key={idx}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="aspect-square rounded-xl shadow-md border-2 border-transparent hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary ring-offset-2"
                                    style={{ backgroundColor: opt }}
                                    onClick={() => checkAnswer(opt)}
                                    disabled={!isGameActive && gameMessage !== "Correct!"}
                                />
                            ))}
                        </div>

                        {gameMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`text-center p-3 rounded-lg font-bold ${gameMessage === "Correct!" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                    }`}
                            >
                                {gameMessage}
                                {!isGameActive && (
                                    <Button size="sm" variant="link" onClick={startNewRound} className="ml-2 text-foreground underline">
                                        Try Again
                                    </Button>
                                )}
                            </motion.div>
                        )}

                        {!isGameActive && !gameMessage && (
                            <div className="text-center">
                                <Button onClick={startNewRound}>Start Game</Button>
                            </div>
                        )}

                    </TabsContent>
                </Tabs>
            </Card>
        </AnimatedElement>
    );
};

export default ColorGenerator;
