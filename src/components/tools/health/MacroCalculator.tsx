import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Info } from "lucide-react";
import { toast } from "sonner";

const MacroCalculator = () => {
    const [calories, setCalories] = useState("");
    const [goal, setGoal] = useState("balanced");
    const [result, setResult] = useState<{
        protein: { grams: number; calories: number; percentage: number };
        carbs: { grams: number; calories: number; percentage: number };
        fats: { grams: number; calories: number; percentage: number };
    } | null>(null);

    const macroSplits = {
        balanced: { name: "Balanced", protein: 30, carbs: 40, fats: 30 },
        lowCarb: { name: "Low Carb", protein: 40, carbs: 20, fats: 40 },
        highProtein: { name: "High Protein", protein: 40, carbs: 30, fats: 30 },
        keto: { name: "Ketogenic", protein: 25, carbs: 5, fats: 70 },
        lowFat: { name: "Low Fat", protein: 30, carbs: 50, fats: 20 },
        muscleGain: { name: "Muscle Gain", protein: 35, carbs: 45, fats: 20 },
        endurance: { name: "Endurance", protein: 20, carbs: 55, fats: 25 }
    };

    const calculate = () => {
        if (!calories) {
            toast.error("Please enter your daily calorie target");
            return;
        }

        const totalCals = parseFloat(calories);
        const split = macroSplits[goal as keyof typeof macroSplits];

        const proteinCals = (totalCals * split.protein) / 100;
        const carbsCals = (totalCals * split.carbs) / 100;
        const fatsCals = (totalCals * split.fats) / 100;

        setResult({
            protein: {
                grams: Math.round(proteinCals / 4),
                calories: Math.round(proteinCals),
                percentage: split.protein
            },
            carbs: {
                grams: Math.round(carbsCals / 4),
                calories: Math.round(carbsCals),
                percentage: split.carbs
            },
            fats: {
                grams: Math.round(fatsCals / 9),
                calories: Math.round(fatsCals),
                percentage: split.fats
            }
        });

        toast.success("Macros calculated successfully!");
    };

    return (
        <div className="p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="calories">Daily Calorie Target</Label>
                    <Input
                        id="calories"
                        type="number"
                        placeholder="2000"
                        value={calories}
                        onChange={(e) => setCalories(e.target.value)}
                        className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">Use the Calorie Calculator tab to find your target</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="goal">Macro Split Goal</Label>
                    <Select value={goal} onValueChange={setGoal}>
                        <SelectTrigger className="h-11">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(macroSplits).map(([key, { name, protein, carbs, fats }]) => (
                                <SelectItem key={key} value={key}>
                                    {name} (P:{protein}% C:{carbs}% F:{fats}%)
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Button onClick={calculate} className="w-full h-12 text-base font-semibold">
                <Calculator className="mr-2 h-5 w-5" />
                Calculate Macros
            </Button>

            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6">
                        <h3 className="text-xl font-bold mb-6 text-purple-900 dark:text-purple-100">Your Macro Breakdown</h3>

                        <div className="grid gap-4">
                            {/* Protein */}
                            <div className="bg-white dark:bg-background p-5 rounded-lg border-2 border-blue-200 dark:border-blue-800 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                            <span className="text-2xl">🥩</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">Protein</h4>
                                            <p className="text-sm text-muted-foreground">{result.protein.percentage}% of calories</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{result.protein.grams}g</p>
                                        <p className="text-sm text-muted-foreground">{result.protein.calories} cal</p>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                    <div
                                        className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${result.protein.percentage}%` }}
                                    />
                                </div>
                            </div>

                            {/* Carbs */}
                            <div className="bg-white dark:bg-background p-5 rounded-lg border-2 border-orange-200 dark:border-orange-800 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                                            <span className="text-2xl">🍞</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">Carbohydrates</h4>
                                            <p className="text-sm text-muted-foreground">{result.carbs.percentage}% of calories</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{result.carbs.grams}g</p>
                                        <p className="text-sm text-muted-foreground">{result.carbs.calories} cal</p>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                    <div
                                        className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${result.carbs.percentage}%` }}
                                    />
                                </div>
                            </div>

                            {/* Fats */}
                            <div className="bg-white dark:bg-background p-5 rounded-lg border-2 border-yellow-200 dark:border-yellow-800 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                                            <span className="text-2xl">🥑</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">Fats</h4>
                                            <p className="text-sm text-muted-foreground">{result.fats.percentage}% of calories</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{result.fats.grams}g</p>
                                        <p className="text-sm text-muted-foreground">{result.fats.calories} cal</p>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                    <div
                                        className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${result.fats.percentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-white dark:bg-background rounded-lg border">
                            <h4 className="font-semibold mb-2">Macro Distribution</h4>
                            <div className="flex h-6 rounded-full overflow-hidden">
                                <div
                                    className="bg-blue-500 flex items-center justify-center text-xs font-bold text-white"
                                    style={{ width: `${result.protein.percentage}%` }}
                                >
                                    {result.protein.percentage > 15 && `${result.protein.percentage}%`}
                                </div>
                                <div
                                    className="bg-orange-500 flex items-center justify-center text-xs font-bold text-white"
                                    style={{ width: `${result.carbs.percentage}%` }}
                                >
                                    {result.carbs.percentage > 15 && `${result.carbs.percentage}%`}
                                </div>
                                <div
                                    className="bg-yellow-500 flex items-center justify-center text-xs font-bold text-white"
                                    style={{ width: `${result.fats.percentage}%` }}
                                >
                                    {result.fats.percentage > 15 && `${result.fats.percentage}%`}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600" />
                        <div className="text-amber-900 dark:text-amber-200 space-y-1">
                            <p><strong>Macro Basics:</strong></p>
                            <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                                <li>Protein: 4 calories per gram - builds and repairs muscle</li>
                                <li>Carbohydrates: 4 calories per gram - primary energy source</li>
                                <li>Fats: 9 calories per gram - hormone production and nutrient absorption</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MacroCalculator;
