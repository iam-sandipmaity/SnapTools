import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Droplet, Calculator, Info } from "lucide-react";
import { toast } from "sonner";

const WaterIntakeCalculator = () => {
    const [weight, setWeight] = useState("");
    const [unit, setUnit] = useState("metric");
    const [activityLevel, setActivityLevel] = useState("moderate");
    const [climate, setClimate] = useState("moderate");
    const [result, setResult] = useState<{
        liters: number;
        ml: number;
        cups: number;
        oz: number;
        glasses: number;
    } | null>(null);

    const activityMultipliers = {
        sedentary: { value: 30, label: "Sedentary (little exercise)" },
        moderate: { value: 35, label: "Moderate (exercise 3-4 days/week)" },
        active: { value: 40, label: "Active (exercise 5-7 days/week)" },
        veryActive: { value: 45, label: "Very Active (intense daily exercise)" }
    };

    const climateAdjustments = {
        cold: { value: 0, label: "Cold Climate" },
        moderate: { value: 250, label: "Moderate Climate" },
        hot: { value: 500, label: "Hot/Humid Climate" }
    };

    const calculate = () => {
        if (!weight) {
            toast.error("Please enter your weight");
            return;
        }

        let weightKg = parseFloat(weight);
        if (unit === "imperial") {
            weightKg = weightKg * 0.453592;
        }

        // Base calculation: weight * activity multiplier
        const baseML = weightKg * activityMultipliers[activityLevel as keyof typeof activityMultipliers].value;

        // Add climate adjustment
        const totalML = baseML + climateAdjustments[climate as keyof typeof climateAdjustments].value;

        setResult({
            ml: Math.round(totalML),
            liters: Math.round((totalML / 1000) * 10) / 10,
            cups: Math.round((totalML / 240) * 10) / 10,
            oz: Math.round((totalML / 29.5735) * 10) / 10,
            glasses: Math.round(totalML / 250)
        });

        toast.success("Water intake calculated successfully!");
    };

    return (
        <div className="p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Unit System</Label>
                    <RadioGroup value={unit} onValueChange={setUnit} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="metric" id="water-metric" />
                            <Label htmlFor="water-metric" className="font-normal cursor-pointer">Metric (kg)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="imperial" id="water-imperial" />
                            <Label htmlFor="water-imperial" className="font-normal cursor-pointer">Imperial (lbs)</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="water-weight">Weight ({unit === "metric" ? "kg" : "lbs"})</Label>
                    <Input
                        id="water-weight"
                        type="number"
                        placeholder={unit === "metric" ? "70" : "154"}
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="h-11"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="water-activity">Activity Level</Label>
                    <Select value={activityLevel} onValueChange={setActivityLevel}>
                        <SelectTrigger className="h-11">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(activityMultipliers).map(([key, { label }]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="climate">Climate</Label>
                    <Select value={climate} onValueChange={setClimate}>
                        <SelectTrigger className="h-11">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(climateAdjustments).map(([key, { label }]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Button onClick={calculate} className="w-full h-12 text-base font-semibold">
                <Calculator className="mr-2 h-5 w-5" />
                Calculate Water Intake
            </Button>

            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border-2 border-cyan-200 dark:border-cyan-800 rounded-xl p-6">
                        <h3 className="text-xl font-bold mb-6 text-cyan-900 dark:text-cyan-100 flex items-center gap-2">
                            <Droplet className="h-6 w-6" />
                            Your Daily Water Intake
                        </h3>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-background p-5 rounded-lg border-2 border-cyan-200 dark:border-cyan-800 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Droplet className="h-5 w-5 text-cyan-500" />
                                    <p className="text-sm font-medium text-muted-foreground">Liters</p>
                                </div>
                                <p className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">{result.liters}L</p>
                            </div>

                            <div className="bg-white dark:bg-background p-5 rounded-lg border-2 border-blue-200 dark:border-blue-800 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Droplet className="h-5 w-5 text-blue-500" />
                                    <p className="text-sm font-medium text-muted-foreground">Milliliters</p>
                                </div>
                                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{result.ml}ml</p>
                            </div>

                            <div className="bg-white dark:bg-background p-5 rounded-lg border-2 border-indigo-200 dark:border-indigo-800 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Droplet className="h-5 w-5 text-indigo-500" />
                                    <p className="text-sm font-medium text-muted-foreground">Glasses (250ml)</p>
                                </div>
                                <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{result.glasses}</p>
                            </div>

                            <div className="bg-white dark:bg-background p-5 rounded-lg border-2 border-sky-200 dark:border-sky-800 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Droplet className="h-5 w-5 text-sky-500" />
                                    <p className="text-sm font-medium text-muted-foreground">Cups (240ml)</p>
                                </div>
                                <p className="text-4xl font-bold text-sky-600 dark:text-sky-400">{result.cups}</p>
                            </div>

                            <div className="bg-white dark:bg-background p-5 rounded-lg border-2 border-teal-200 dark:border-teal-800 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Droplet className="h-5 w-5 text-teal-500" />
                                    <p className="text-sm font-medium text-muted-foreground">Fluid Ounces</p>
                                </div>
                                <p className="text-4xl font-bold text-teal-600 dark:text-teal-400">{result.oz}oz</p>
                            </div>

                            <div className="bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/50 dark:to-blue-900/50 p-5 rounded-lg border-2 border-cyan-300 dark:border-cyan-700 shadow-sm">
                                <p className="text-sm font-medium text-cyan-900 dark:text-cyan-100 mb-2">💧 Recommended</p>
                                <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">
                                    {result.glasses} glasses/day
                                </p>
                                <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">of 250ml each</p>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-white dark:bg-background rounded-lg border">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <span>💡</span> Hydration Tips
                            </h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="text-cyan-500 mt-0.5">•</span>
                                    <span>Drink a glass of water when you wake up to kickstart hydration</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-cyan-500 mt-0.5">•</span>
                                    <span>Keep a water bottle with you throughout the day</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-cyan-500 mt-0.5">•</span>
                                    <span>Drink before, during, and after exercise</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-cyan-500 mt-0.5">•</span>
                                    <span>Increase intake in hot weather or when sick</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600" />
                        <p className="text-amber-900 dark:text-amber-200">
                            <strong>Note:</strong> These are general recommendations. Individual needs vary based on health conditions,
                            pregnancy, breastfeeding, and other factors. Listen to your body and consult a healthcare provider for personalized advice.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WaterIntakeCalculator;
