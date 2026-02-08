import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnimatedElement from "@/components/animated-element";
import { Activity, Target, Droplet, Gauge, Weight, Zap } from "lucide-react";
import CalorieCalculator from "./CalorieCalculator";
import MacroCalculator from "./MacroCalculator";
import WaterIntakeCalculator from "./WaterIntakeCalculator";
import BodyFatCalculator from "./BodyFatCalculator";
import IdealWeightCalculator from "./IdealWeightCalculator";
import TDEECalculator from "./TDEECalculator";

interface HealthToolsProps {
    defaultTab?: string;
}

const HealthTools: React.FC<HealthToolsProps> = ({ defaultTab = "calorie" }) => {
    const [activeTab, setActiveTab] = useState(defaultTab);

    useEffect(() => {
        setActiveTab(defaultTab);
    }, [defaultTab]);

    return (
        <AnimatedElement>
            <div className="space-y-8 max-w-6xl mx-auto">
                <Card>
                    <CardHeader className="bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 border-b p-6">
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Activity className="h-6 w-6 text-primary" />
                            Health & Fitness Tools
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto flex-wrap">
                                <TabsTrigger
                                    value="calorie"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-4 font-semibold"
                                >
                                    <Zap className="h-4 w-4 mr-2" />
                                    Calorie
                                </TabsTrigger>
                                <TabsTrigger
                                    value="macro"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-4 font-semibold"
                                >
                                    <Target className="h-4 w-4 mr-2" />
                                    Macros
                                </TabsTrigger>
                                <TabsTrigger
                                    value="water"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-4 font-semibold"
                                >
                                    <Droplet className="h-4 w-4 mr-2" />
                                    Water
                                </TabsTrigger>
                                <TabsTrigger
                                    value="bodyfat"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-4 font-semibold"
                                >
                                    <Gauge className="h-4 w-4 mr-2" />
                                    Body Fat
                                </TabsTrigger>
                                <TabsTrigger
                                    value="idealweight"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-4 font-semibold"
                                >
                                    <Weight className="h-4 w-4 mr-2" />
                                    Ideal Weight
                                </TabsTrigger>
                                <TabsTrigger
                                    value="tdee"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-4 font-semibold"
                                >
                                    <Activity className="h-4 w-4 mr-2" />
                                    TDEE
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="calorie" className="mt-0">
                                <CalorieCalculator />
                            </TabsContent>
                            <TabsContent value="macro" className="mt-0">
                                <MacroCalculator />
                            </TabsContent>
                            <TabsContent value="water" className="mt-0">
                                <WaterIntakeCalculator />
                            </TabsContent>
                            <TabsContent value="bodyfat" className="mt-0">
                                <BodyFatCalculator />
                            </TabsContent>
                            <TabsContent value="idealweight" className="mt-0">
                                <IdealWeightCalculator />
                            </TabsContent>
                            <TabsContent value="tdee" className="mt-0">
                                <TDEECalculator />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AnimatedElement>
    );
};

// Individual tool exports that render the main component with the correct tab
const CalorieCalculatorTool = () => <HealthTools defaultTab="calorie" />;
const MacroCalculatorTool = () => <HealthTools defaultTab="macro" />;
const WaterIntakeTool = () => <HealthTools defaultTab="water" />;
const BodyFatTool = () => <HealthTools defaultTab="bodyfat" />;
const IdealWeightTool = () => <HealthTools defaultTab="idealweight" />;
const TDEECalculatorTool = () => <HealthTools defaultTab="tdee" />;

const healthTools = {
    "calorie-calculator": CalorieCalculatorTool,
    "macro-calculator": MacroCalculatorTool,
    "water-intake": WaterIntakeTool,
    "body-fat": BodyFatTool,
    "ideal-weight": IdealWeightTool,
    "tdee-calculator": TDEECalculatorTool,
};

export default healthTools;
