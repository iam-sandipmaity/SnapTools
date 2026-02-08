import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calculator, Info } from "lucide-react";
import { toast } from "sonner";

const CalorieCalculator = () => {
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("male");
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [activityLevel, setActivityLevel] = useState("sedentary");
    const [unit, setUnit] = useState("metric");
    const [result, setResult] = useState<{
        bmr: number;
        maintenance: number;
        mildLoss: number;
        weightLoss: number;
        extremeLoss: number;
        mildGain: number;
        weightGain: number;
        extremeGain: number;
    } | null>(null);

    const activityMultipliers = {
        sedentary: { value: 1.2, label: "Sedentary (little or no exercise)" },
        light: { value: 1.375, label: "Light (exercise 1-3 days/week)" },
        moderate: { value: 1.55, label: "Moderate (exercise 3-5 days/week)" },
        active: { value: 1.725, label: "Active (exercise 6-7 days/week)" },
        veryActive: { value: 1.9, label: "Very Active (intense exercise daily)" }
    };

    const calculate = () => {
        if (!age || !weight || !height) {
            toast.error("Please fill in all fields");
            return;
        }

        let weightKg = parseFloat(weight);
        let heightCm = parseFloat(height);

        if (unit === "imperial") {
            weightKg = weightKg * 0.453592;
            heightCm = heightCm * 2.54;
        }

        // Mifflin-St Jeor Equation
        let bmr;
        if (gender === "male") {
            bmr = 10 * weightKg + 6.25 * heightCm - 5 * parseInt(age) + 5;
        } else {
            bmr = 10 * weightKg + 6.25 * heightCm - 5 * parseInt(age) - 161;
        }

        const maintenance = bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers].value;

        setResult({
            bmr: Math.round(bmr),
            maintenance: Math.round(maintenance),
            mildLoss: Math.round(maintenance - 250),
            weightLoss: Math.round(maintenance - 500),
            extremeLoss: Math.round(maintenance - 1000),
            mildGain: Math.round(maintenance + 250),
            weightGain: Math.round(maintenance + 500),
            extremeGain: Math.round(maintenance + 1000)
        });

        toast.success("Calories calculated successfully!");
    };

    return (
        <div className="p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Unit System</Label>
                    <RadioGroup value={unit} onValueChange={setUnit} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="metric" id="metric" />
                            <Label htmlFor="metric" className="font-normal cursor-pointer">Metric (kg, cm)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="imperial" id="imperial" />
                            <Label htmlFor="imperial" className="font-normal cursor-pointer">Imperial (lbs, in)</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-2">
                    <Label>Gender</Label>
                    <RadioGroup value={gender} onValueChange={setGender} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="male" id="male" />
                            <Label htmlFor="male" className="font-normal cursor-pointer">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="female" id="female" />
                            <Label htmlFor="female" className="font-normal cursor-pointer">Female</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="age">Age (years)</Label>
                    <Input
                        id="age"
                        type="number"
                        placeholder="25"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="h-11"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="weight">Weight ({unit === "metric" ? "kg" : "lbs"})</Label>
                    <Input
                        id="weight"
                        type="number"
                        placeholder={unit === "metric" ? "70" : "154"}
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="h-11"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="height">Height ({unit === "metric" ? "cm" : "inches"})</Label>
                    <Input
                        id="height"
                        type="number"
                        placeholder={unit === "metric" ? "175" : "69"}
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="h-11"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="activity">Activity Level</Label>
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
            </div>

            <Button onClick={calculate} className="w-full h-12 text-base font-semibold">
                <Calculator className="mr-2 h-5 w-5" />
                Calculate Calories
            </Button>

            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
                        <h3 className="text-xl font-bold mb-4 text-blue-900 dark:text-blue-100">Your Results</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-background p-4 rounded-lg border shadow-sm">
                                <p className="text-sm text-muted-foreground mb-1">Basal Metabolic Rate (BMR)</p>
                                <p className="text-3xl font-bold text-primary">{result.bmr}</p>
                                <p className="text-xs text-muted-foreground mt-1">calories/day at rest</p>
                            </div>
                            <div className="bg-white dark:bg-background p-4 rounded-lg border shadow-sm">
                                <p className="text-sm text-muted-foreground mb-1">Maintenance Calories</p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{result.maintenance}</p>
                                <p className="text-xs text-muted-foreground mt-1">calories/day to maintain weight</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h4 className="font-semibold text-lg flex items-center gap-2">
                                <span className="text-red-500">📉</span> Weight Loss Goals
                            </h4>
                            <div className="space-y-2">
                                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Mild Loss (0.25 kg/week)</span>
                                        <span className="text-xl font-bold">{result.mildLoss}</span>
                                    </div>
                                </div>
                                <div className="bg-red-100 dark:bg-red-950/30 p-4 rounded-lg border border-red-300 dark:border-red-700">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Weight Loss (0.5 kg/week)</span>
                                        <span className="text-xl font-bold">{result.weightLoss}</span>
                                    </div>
                                </div>
                                <div className="bg-red-200 dark:bg-red-950/40 p-4 rounded-lg border border-red-400 dark:border-red-600">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Extreme Loss (1 kg/week)</span>
                                        <span className="text-xl font-bold">{result.extremeLoss}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-semibold text-lg flex items-center gap-2">
                                <span className="text-green-500">📈</span> Weight Gain Goals
                            </h4>
                            <div className="space-y-2">
                                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Mild Gain (0.25 kg/week)</span>
                                        <span className="text-xl font-bold">{result.mildGain}</span>
                                    </div>
                                </div>
                                <div className="bg-green-100 dark:bg-green-950/30 p-4 rounded-lg border border-green-300 dark:border-green-700">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Weight Gain (0.5 kg/week)</span>
                                        <span className="text-xl font-bold">{result.weightGain}</span>
                                    </div>
                                </div>
                                <div className="bg-green-200 dark:bg-green-950/40 p-4 rounded-lg border border-green-400 dark:border-green-600">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Extreme Gain (1 kg/week)</span>
                                        <span className="text-xl font-bold">{result.extremeGain}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600" />
                        <p className="text-amber-900 dark:text-amber-200">
                            <strong>Note:</strong> These calculations use the Mifflin-St Jeor equation, one of the most accurate formulas.
                            Results are estimates and individual needs may vary. Consult a healthcare professional before making significant dietary changes.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalorieCalculator;
