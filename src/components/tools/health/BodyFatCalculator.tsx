import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Info } from "lucide-react";
import { toast } from "sonner";

const BodyFatCalculator = () => {
    const [method, setMethod] = useState("navy");
    const [gender, setGender] = useState("male");
    const [unit, setUnit] = useState("metric");

    // Navy Method
    const [height, setHeight] = useState("");
    const [waist, setWaist] = useState("");
    const [neck, setNeck] = useState("");
    const [hip, setHip] = useState("");

    // BMI Method
    const [weight, setWeight] = useState("");
    const [age, setAge] = useState("");

    const [result, setResult] = useState<{
        bodyFat: number;
        category: string;
        leanMass?: number;
        fatMass?: number;
    } | null>(null);

    const getCategory = (bf: number, isMale: boolean) => {
        if (isMale) {
            if (bf < 6) return { name: "Essential Fat", color: "text-red-600" };
            if (bf < 14) return { name: "Athletes", color: "text-blue-600" };
            if (bf < 18) return { name: "Fitness", color: "text-green-600" };
            if (bf < 25) return { name: "Average", color: "text-yellow-600" };
            return { name: "Obese", color: "text-orange-600" };
        } else {
            if (bf < 14) return { name: "Essential Fat", color: "text-red-600" };
            if (bf < 21) return { name: "Athletes", color: "text-blue-600" };
            if (bf < 25) return { name: "Fitness", color: "text-green-600" };
            if (bf < 32) return { name: "Average", color: "text-yellow-600" };
            return { name: "Obese", color: "text-orange-600" };
        }
    };

    const calculateNavy = () => {
        if (!height || !waist || !neck || (gender === "female" && !hip)) {
            toast.error("Please fill in all required measurements");
            return;
        }

        let h = parseFloat(height);
        let w = parseFloat(waist);
        let n = parseFloat(neck);
        let hp = hip ? parseFloat(hip) : 0;

        if (unit === "imperial") {
            h = h * 2.54;
            w = w * 2.54;
            n = n * 2.54;
            hp = hp * 2.54;
        }

        let bodyFat;
        if (gender === "male") {
            bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
        } else {
            bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(w + hp - n) + 0.22100 * Math.log10(h)) - 450;
        }

        const category = getCategory(bodyFat, gender === "male");

        setResult({
            bodyFat: Math.round(bodyFat * 10) / 10,
            category: category.name
        });

        toast.success("Body fat calculated successfully!");
    };

    const calculateBMI = () => {
        if (!height || !weight || !age) {
            toast.error("Please fill in all fields");
            return;
        }

        let h = parseFloat(height);
        let w = parseFloat(weight);
        const a = parseInt(age);

        if (unit === "imperial") {
            h = h * 2.54;
            w = w * 0.453592;
        }

        const bmi = w / ((h / 100) ** 2);
        let bodyFat;

        if (gender === "male") {
            bodyFat = 1.20 * bmi + 0.23 * a - 16.2;
        } else {
            bodyFat = 1.20 * bmi + 0.23 * a - 5.4;
        }

        const category = getCategory(bodyFat, gender === "male");
        const fatMass = (w * bodyFat) / 100;
        const leanMass = w - fatMass;

        setResult({
            bodyFat: Math.round(bodyFat * 10) / 10,
            category: category.name,
            leanMass: Math.round(leanMass * 10) / 10,
            fatMass: Math.round(fatMass * 10) / 10
        });

        toast.success("Body fat calculated successfully!");
    };

    return (
        <div className="p-8 space-y-8">
            <Tabs value={method} onValueChange={setMethod} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="navy">Navy Method (More Accurate)</TabsTrigger>
                    <TabsTrigger value="bmi">BMI Method</TabsTrigger>
                </TabsList>

                <TabsContent value="navy" className="space-y-6 mt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Unit System</Label>
                            <RadioGroup value={unit} onValueChange={setUnit} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="metric" id="bf-metric" />
                                    <Label htmlFor="bf-metric" className="font-normal cursor-pointer">Metric (cm)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="imperial" id="bf-imperial" />
                                    <Label htmlFor="bf-imperial" className="font-normal cursor-pointer">Imperial (in)</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-2">
                            <Label>Gender</Label>
                            <RadioGroup value={gender} onValueChange={setGender} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="male" id="bf-male" />
                                    <Label htmlFor="bf-male" className="font-normal cursor-pointer">Male</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="female" id="bf-female" />
                                    <Label htmlFor="bf-female" className="font-normal cursor-pointer">Female</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bf-height">Height ({unit === "metric" ? "cm" : "inches"})</Label>
                            <Input
                                id="bf-height"
                                type="number"
                                placeholder={unit === "metric" ? "175" : "69"}
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="neck">Neck Circumference ({unit === "metric" ? "cm" : "inches"})</Label>
                            <Input
                                id="neck"
                                type="number"
                                placeholder={unit === "metric" ? "37" : "14.5"}
                                value={neck}
                                onChange={(e) => setNeck(e.target.value)}
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="waist">Waist Circumference ({unit === "metric" ? "cm" : "inches"})</Label>
                            <Input
                                id="waist"
                                type="number"
                                placeholder={unit === "metric" ? "85" : "33"}
                                value={waist}
                                onChange={(e) => setWaist(e.target.value)}
                                className="h-11"
                            />
                            <p className="text-xs text-muted-foreground">Measure at belly button level</p>
                        </div>

                        {gender === "female" && (
                            <div className="space-y-2">
                                <Label htmlFor="hip">Hip Circumference ({unit === "metric" ? "cm" : "inches"})</Label>
                                <Input
                                    id="hip"
                                    type="number"
                                    placeholder={unit === "metric" ? "95" : "37"}
                                    value={hip}
                                    onChange={(e) => setHip(e.target.value)}
                                    className="h-11"
                                />
                                <p className="text-xs text-muted-foreground">Measure at widest point</p>
                            </div>
                        )}
                    </div>

                    <Button onClick={calculateNavy} className="w-full h-12 text-base font-semibold">
                        <Calculator className="mr-2 h-5 w-5" />
                        Calculate Body Fat
                    </Button>
                </TabsContent>

                <TabsContent value="bmi" className="space-y-6 mt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Unit System</Label>
                            <RadioGroup value={unit} onValueChange={setUnit} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="metric" id="bmi-metric" />
                                    <Label htmlFor="bmi-metric" className="font-normal cursor-pointer">Metric (kg, cm)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="imperial" id="bmi-imperial" />
                                    <Label htmlFor="bmi-imperial" className="font-normal cursor-pointer">Imperial (lbs, in)</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-2">
                            <Label>Gender</Label>
                            <RadioGroup value={gender} onValueChange={setGender} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="male" id="bmi-male" />
                                    <Label htmlFor="bmi-male" className="font-normal cursor-pointer">Male</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="female" id="bmi-female" />
                                    <Label htmlFor="bmi-female" className="font-normal cursor-pointer">Female</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bmi-age">Age (years)</Label>
                            <Input
                                id="bmi-age"
                                type="number"
                                placeholder="25"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bmi-weight">Weight ({unit === "metric" ? "kg" : "lbs"})</Label>
                            <Input
                                id="bmi-weight"
                                type="number"
                                placeholder={unit === "metric" ? "70" : "154"}
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bmi-height">Height ({unit === "metric" ? "cm" : "inches"})</Label>
                            <Input
                                id="bmi-height"
                                type="number"
                                placeholder={unit === "metric" ? "175" : "69"}
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                className="h-11"
                            />
                        </div>
                    </div>

                    <Button onClick={calculateBMI} className="w-full h-12 text-base font-semibold">
                        <Calculator className="mr-2 h-5 w-5" />
                        Calculate Body Fat
                    </Button>
                </TabsContent>
            </Tabs>

            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-2 border-violet-200 dark:border-violet-800 rounded-xl p-6">
                        <h3 className="text-xl font-bold mb-6 text-violet-900 dark:text-violet-100">Your Body Composition</h3>

                        <div className="grid gap-4">
                            <div className="bg-white dark:bg-background p-6 rounded-lg border-2 border-violet-200 dark:border-violet-800 shadow-sm">
                                <p className="text-sm text-muted-foreground mb-2">Body Fat Percentage</p>
                                <p className="text-5xl font-bold text-violet-600 dark:text-violet-400 mb-2">{result.bodyFat}%</p>
                                <p className={`text-lg font-semibold ${getCategory(result.bodyFat, gender === "male").color}`}>
                                    {result.category}
                                </p>
                            </div>

                            {result.leanMass && result.fatMass && (
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="bg-green-50 dark:bg-green-950/20 p-5 rounded-lg border border-green-200 dark:border-green-800">
                                        <p className="text-sm text-muted-foreground mb-1">Lean Body Mass</p>
                                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{result.leanMass} {unit === "metric" ? "kg" : "lbs"}</p>
                                    </div>
                                    <div className="bg-orange-50 dark:bg-orange-950/20 p-5 rounded-lg border border-orange-200 dark:border-orange-800">
                                        <p className="text-sm text-muted-foreground mb-1">Fat Mass</p>
                                        <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{result.fatMass} {unit === "metric" ? "kg" : "lbs"}</p>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white dark:bg-background p-5 rounded-lg border">
                                <h4 className="font-semibold mb-3">Body Fat Categories ({gender === "male" ? "Male" : "Female"})</h4>
                                <div className="space-y-2 text-sm">
                                    {gender === "male" ? (
                                        <>
                                            <div className="flex justify-between"><span>Essential Fat:</span><span className="font-medium">2-5%</span></div>
                                            <div className="flex justify-between"><span>Athletes:</span><span className="font-medium">6-13%</span></div>
                                            <div className="flex justify-between"><span>Fitness:</span><span className="font-medium">14-17%</span></div>
                                            <div className="flex justify-between"><span>Average:</span><span className="font-medium">18-24%</span></div>
                                            <div className="flex justify-between"><span>Obese:</span><span className="font-medium">25%+</span></div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex justify-between"><span>Essential Fat:</span><span className="font-medium">10-13%</span></div>
                                            <div className="flex justify-between"><span>Athletes:</span><span className="font-medium">14-20%</span></div>
                                            <div className="flex justify-between"><span>Fitness:</span><span className="font-medium">21-24%</span></div>
                                            <div className="flex justify-between"><span>Average:</span><span className="font-medium">25-31%</span></div>
                                            <div className="flex justify-between"><span>Obese:</span><span className="font-medium">32%+</span></div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600" />
                        <p className="text-amber-900 dark:text-amber-200">
                            <strong>Note:</strong> The Navy method is generally more accurate than BMI-based calculations.
                            For most accurate results, consider professional methods like DEXA scans or hydrostatic weighing.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BodyFatCalculator;
