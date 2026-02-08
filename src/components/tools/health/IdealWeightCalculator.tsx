import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calculator, Info } from "lucide-react";
import { toast } from "sonner";

const IdealWeightCalculator = () => {
    const [height, setHeight] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("male");
    const [unit, setUnit] = useState("metric");
    const [result, setResult] = useState<{
        robinson: number;
        miller: number;
        devine: number;
        hamwi: number;
        bmi: { min: number; max: number };
        average: number;
    } | null>(null);

    const calculate = () => {
        if (!height) {
            toast.error("Please enter your height");
            return;
        }

        let heightCm = parseFloat(height);
        if (unit === "imperial") {
            heightCm = heightCm * 2.54;
        }

        const heightInches = heightCm / 2.54;
        const isMale = gender === "male";

        // Robinson Formula (1983)
        let robinson;
        if (isMale) {
            robinson = 52 + 1.9 * (heightInches - 60);
        } else {
            robinson = 49 + 1.7 * (heightInches - 60);
        }

        // Miller Formula (1983)
        let miller;
        if (isMale) {
            miller = 56.2 + 1.41 * (heightInches - 60);
        } else {
            miller = 53.1 + 1.36 * (heightInches - 60);
        }

        // Devine Formula (1974)
        let devine;
        if (isMale) {
            devine = 50 + 2.3 * (heightInches - 60);
        } else {
            devine = 45.5 + 2.3 * (heightInches - 60);
        }

        // Hamwi Formula (1964)
        let hamwi;
        if (isMale) {
            hamwi = 48 + 2.7 * (heightInches - 60);
        } else {
            hamwi = 45.5 + 2.2 * (heightInches - 60);
        }

        // Healthy BMI Range (18.5 - 24.9)
        const heightM = heightCm / 100;
        const bmiMin = 18.5 * (heightM ** 2);
        const bmiMax = 24.9 * (heightM ** 2);

        const average = (robinson + miller + devine + hamwi) / 4;

        // Convert to imperial if needed
        const convertWeight = (kg: number) => unit === "imperial" ? kg * 2.20462 : kg;

        setResult({
            robinson: Math.round(convertWeight(robinson) * 10) / 10,
            miller: Math.round(convertWeight(miller) * 10) / 10,
            devine: Math.round(convertWeight(devine) * 10) / 10,
            hamwi: Math.round(convertWeight(hamwi) * 10) / 10,
            bmi: {
                min: Math.round(convertWeight(bmiMin) * 10) / 10,
                max: Math.round(convertWeight(bmiMax) * 10) / 10
            },
            average: Math.round(convertWeight(average) * 10) / 10
        });

        toast.success("Ideal weight calculated successfully!");
    };

    return (
        <div className="p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Unit System</Label>
                    <RadioGroup value={unit} onValueChange={setUnit} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="metric" id="iw-metric" />
                            <Label htmlFor="iw-metric" className="font-normal cursor-pointer">Metric (kg, cm)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="imperial" id="iw-imperial" />
                            <Label htmlFor="iw-imperial" className="font-normal cursor-pointer">Imperial (lbs, in)</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-2">
                    <Label>Gender</Label>
                    <RadioGroup value={gender} onValueChange={setGender} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="male" id="iw-male" />
                            <Label htmlFor="iw-male" className="font-normal cursor-pointer">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="female" id="iw-female" />
                            <Label htmlFor="iw-female" className="font-normal cursor-pointer">Female</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="iw-height">Height ({unit === "metric" ? "cm" : "inches"})</Label>
                    <Input
                        id="iw-height"
                        type="number"
                        placeholder={unit === "metric" ? "175" : "69"}
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="h-11"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="iw-age">Age (years) - Optional</Label>
                    <Input
                        id="iw-age"
                        type="number"
                        placeholder="25"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">For additional context</p>
                </div>
            </div>

            <Button onClick={calculate} className="w-full h-12 text-base font-semibold">
                <Calculator className="mr-2 h-5 w-5" />
                Calculate Ideal Weight
            </Button>

            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-6">
                        <h3 className="text-xl font-bold mb-6 text-emerald-900 dark:text-emerald-100">Your Ideal Weight Range</h3>

                        <div className="grid gap-4">
                            <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 p-6 rounded-lg border-2 border-emerald-300 dark:border-emerald-700 shadow-sm">
                                <p className="text-sm text-emerald-900 dark:text-emerald-100 mb-2 font-medium">Recommended Average</p>
                                <p className="text-5xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                                    {result.average}
                                </p>
                                <p className="text-lg text-emerald-700 dark:text-emerald-300">{unit === "metric" ? "kg" : "lbs"}</p>
                            </div>

                            <div className="bg-white dark:bg-background p-5 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <span>📊</span> Healthy BMI Range
                                </h4>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Minimum</p>
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.bmi.min}</p>
                                    </div>
                                    <div className="text-2xl text-muted-foreground">—</div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Maximum</p>
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.bmi.max}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                    Based on BMI 18.5 - 24.9 ({unit === "metric" ? "kg" : "lbs"})
                                </p>
                            </div>

                            <div className="bg-white dark:bg-background p-5 rounded-lg border">
                                <h4 className="font-semibold mb-4">Formula Comparisons</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                        <div>
                                            <p className="font-medium">Robinson Formula (1983)</p>
                                            <p className="text-xs text-muted-foreground">Most commonly used</p>
                                        </div>
                                        <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                                            {result.robinson} {unit === "metric" ? "kg" : "lbs"}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                        <div>
                                            <p className="font-medium">Miller Formula (1983)</p>
                                            <p className="text-xs text-muted-foreground">Similar to Robinson</p>
                                        </div>
                                        <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                                            {result.miller} {unit === "metric" ? "kg" : "lbs"}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                        <div>
                                            <p className="font-medium">Devine Formula (1974)</p>
                                            <p className="text-xs text-muted-foreground">Used in medicine</p>
                                        </div>
                                        <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                                            {result.devine} {unit === "metric" ? "kg" : "lbs"}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                                        <div>
                                            <p className="font-medium">Hamwi Formula (1964)</p>
                                            <p className="text-xs text-muted-foreground">Original formula</p>
                                        </div>
                                        <p className="text-xl font-bold text-pink-700 dark:text-pink-300">
                                            {result.hamwi} {unit === "metric" ? "kg" : "lbs"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-5 rounded-lg border">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <span>💡</span> Understanding Your Results
                                </h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-emerald-500 mt-0.5">•</span>
                                        <span>These formulas provide estimates based on height and gender</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-emerald-500 mt-0.5">•</span>
                                        <span>Individual ideal weight varies based on body composition, frame size, and muscle mass</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-emerald-500 mt-0.5">•</span>
                                        <span>Athletes and muscular individuals may weigh more than these estimates</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-emerald-500 mt-0.5">•</span>
                                        <span>The BMI range accounts for different body types and compositions</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600" />
                        <p className="text-amber-900 dark:text-amber-200">
                            <strong>Note:</strong> These calculations are general guidelines. Your ideal weight depends on many factors including
                            muscle mass, bone density, body composition, and overall health. Consult a healthcare professional for personalized advice.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IdealWeightCalculator;
