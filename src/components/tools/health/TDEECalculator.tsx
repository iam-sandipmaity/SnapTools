import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calculator, Info, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { toast } from "sonner";

const TDEECalculator = () => {
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("male");
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [activityLevel, setActivityLevel] = useState("moderate");
    const [unit, setUnit] = useState("metric");
    const [goal, setGoal] = useState("maintain");
    const [result, setResult] = useState<{
        bmr: number;
        tdee: number;
        maintain: number;
        mildLoss: number;
        weightLoss: number;
        extremeLoss: number;
        mildGain: number;
        weightGain: number;
        extremeGain: number;
    } | null>(null);

    const activityMultipliers = {
        sedentary: { value: 1.2, label: "Sedentary (little or no exercise)", desc: "Desk job, minimal activity" },
        light: { value: 1.375, label: "Light (exercise 1-3 days/week)", desc: "Light exercise/sports" },
        moderate: { value: 1.55, label: "Moderate (exercise 3-5 days/week)", desc: "Moderate exercise/sports" },
        active: { value: 1.725, label: "Active (exercise 6-7 days/week)", desc: "Hard exercise/sports" },
        veryActive: { value: 1.9, label: "Very Active (intense exercise daily)", desc: "Physical job or training twice/day" }
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

        // Mifflin-St Jeor Equation for BMR
        let bmr;
        if (gender === "male") {
            bmr = 10 * weightKg + 6.25 * heightCm - 5 * parseInt(age) + 5;
        } else {
            bmr = 10 * weightKg + 6.25 * heightCm - 5 * parseInt(age) - 161;
        }

        // TDEE = BMR * Activity Level
        const tdee = bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers].value;

        setResult({
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            maintain: Math.round(tdee),
            mildLoss: Math.round(tdee - 250),
            weightLoss: Math.round(tdee - 500),
            extremeLoss: Math.round(tdee - 1000),
            mildGain: Math.round(tdee + 250),
            weightGain: Math.round(tdee + 500),
            extremeGain: Math.round(tdee + 1000)
        });

        toast.success("TDEE calculated successfully!");
    };

    return (
        <div className="p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Unit System</Label>
                    <RadioGroup value={unit} onValueChange={setUnit} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="metric" id="tdee-metric" />
                            <Label htmlFor="tdee-metric" className="font-normal cursor-pointer">Metric (kg, cm)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="imperial" id="tdee-imperial" />
                            <Label htmlFor="tdee-imperial" className="font-normal cursor-pointer">Imperial (lbs, in)</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-2">
                    <Label>Gender</Label>
                    <RadioGroup value={gender} onValueChange={setGender} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="male" id="tdee-male" />
                            <Label htmlFor="tdee-male" className="font-normal cursor-pointer">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="female" id="tdee-female" />
                            <Label htmlFor="tdee-female" className="font-normal cursor-pointer">Female</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tdee-age">Age (years)</Label>
                    <Input
                        id="tdee-age"
                        type="number"
                        placeholder="25"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="h-11"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tdee-weight">Weight ({unit === "metric" ? "kg" : "lbs"})</Label>
                    <Input
                        id="tdee-weight"
                        type="number"
                        placeholder={unit === "metric" ? "70" : "154"}
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="h-11"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tdee-height">Height ({unit === "metric" ? "cm" : "inches"})</Label>
                    <Input
                        id="tdee-height"
                        type="number"
                        placeholder={unit === "metric" ? "175" : "69"}
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="h-11"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tdee-activity">Activity Level</Label>
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
                Calculate TDEE
            </Button>

            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-6">
                        <h3 className="text-xl font-bold mb-6 text-orange-900 dark:text-orange-100">Your Energy Expenditure</h3>

                        <div className="grid sm:grid-cols-2 gap-4 mb-6">
                            <div className="bg-white dark:bg-background p-5 rounded-lg border-2 border-orange-200 dark:border-orange-800 shadow-sm">
                                <p className="text-sm text-muted-foreground mb-1">Basal Metabolic Rate (BMR)</p>
                                <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">{result.bmr}</p>
                                <p className="text-xs text-muted-foreground mt-1">calories/day at complete rest</p>
                            </div>
                            <div className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/50 dark:to-red-900/50 p-5 rounded-lg border-2 border-orange-300 dark:border-orange-700 shadow-sm">
                                <p className="text-sm text-orange-900 dark:text-orange-100 mb-1 font-medium">Total Daily Energy Expenditure</p>
                                <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">{result.tdee}</p>
                                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">calories/day with activity</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-background p-5 rounded-lg border mb-6">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <span>📊</span> Activity Level Breakdown
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Your Activity Level:</span>
                                    <span className="font-semibold">
                                        {activityMultipliers[activityLevel as keyof typeof activityMultipliers].label.split('(')[0]}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Multiplier:</span>
                                    <span className="font-semibold">
                                        {activityMultipliers[activityLevel as keyof typeof activityMultipliers].value}x
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Calories from Activity:</span>
                                    <span className="font-semibold text-orange-600 dark:text-orange-400">
                                        +{result.tdee - result.bmr} cal/day
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-lg">Calorie Goals by Objective</h4>

                            <div className="bg-green-50 dark:bg-green-950/20 p-5 rounded-lg border-2 border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-2 mb-3">
                                    <Minus className="h-5 w-5 text-green-600" />
                                    <h5 className="font-semibold text-green-900 dark:text-green-100">Maintain Weight</h5>
                                </div>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{result.maintain} cal/day</p>
                                <p className="text-sm text-muted-foreground">Stay at your current weight</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingDown className="h-5 w-5 text-red-600" />
                                        <h5 className="font-semibold">Weight Loss</h5>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium">Mild (0.25 kg/week)</span>
                                            <span className="text-xl font-bold text-red-600 dark:text-red-400">{result.mildLoss}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">-250 cal/day</p>
                                    </div>
                                    <div className="bg-red-100 dark:bg-red-950/30 p-4 rounded-lg border border-red-300 dark:border-red-700">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium">Moderate (0.5 kg/week)</span>
                                            <span className="text-xl font-bold text-red-600 dark:text-red-400">{result.weightLoss}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">-500 cal/day</p>
                                    </div>
                                    <div className="bg-red-200 dark:bg-red-950/40 p-4 rounded-lg border border-red-400 dark:border-red-600">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium">Aggressive (1 kg/week)</span>
                                            <span className="text-xl font-bold text-red-700 dark:text-red-300">{result.extremeLoss}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">-1000 cal/day</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="h-5 w-5 text-blue-600" />
                                        <h5 className="font-semibold">Weight Gain</h5>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium">Mild (0.25 kg/week)</span>
                                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{result.mildGain}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">+250 cal/day</p>
                                    </div>
                                    <div className="bg-blue-100 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-300 dark:border-blue-700">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium">Moderate (0.5 kg/week)</span>
                                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{result.weightGain}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">+500 cal/day</p>
                                    </div>
                                    <div className="bg-blue-200 dark:bg-blue-950/40 p-4 rounded-lg border border-blue-400 dark:border-blue-600">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium">Aggressive (1 kg/week)</span>
                                            <span className="text-xl font-bold text-blue-700 dark:text-blue-300">{result.extremeGain}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">+1000 cal/day</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-5 rounded-lg border">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <span>💡</span> Understanding TDEE
                            </h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-0.5">•</span>
                                    <span><strong>BMR</strong> is the calories your body burns at complete rest for basic functions</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-0.5">•</span>
                                    <span><strong>TDEE</strong> includes BMR plus calories burned through daily activities and exercise</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-0.5">•</span>
                                    <span>To lose 1 kg of fat, you need a deficit of ~7700 calories (1100 cal/day for 1 week)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-0.5">•</span>
                                    <span>Extreme deficits may lead to muscle loss - moderate approaches are more sustainable</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600" />
                        <p className="text-amber-900 dark:text-amber-200">
                            <strong>Note:</strong> TDEE calculations are estimates based on the Mifflin-St Jeor equation.
                            Individual metabolism varies. Monitor your progress and adjust calorie intake accordingly.
                            Consult a healthcare professional before making significant dietary changes.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TDEECalculator;
