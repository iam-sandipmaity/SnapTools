import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import AnimatedElement from "@/components/animated-element";
import { Percent, TrendingUp, TrendingDown, Calculator } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const PercentageCalculator = () => {
  // Tab 1: What is X% of Y
  const [percentOf, setPercentOf] = useState({ percent: "", number: "", result: null });
  
  // Tab 2: X is what % of Y
  const [isWhatPercent, setIsWhatPercent] = useState({ number1: "", number2: "", result: null });
  
  // Tab 3: Percentage Increase/Decrease
  const [percentChange, setPercentChange] = useState({ original: "", newValue: "", result: null, type: "" });

  const calculatePercentOf = () => {
    const percent = parseFloat(percentOf.percent);
    const number = parseFloat(percentOf.number);
    
    if (isNaN(percent) || isNaN(number)) {
      toast.error("Please enter valid numbers");
      return;
    }
    
    const result = (percent / 100) * number;
    setPercentOf({ ...percentOf, result: result.toFixed(2) });
    toast.success(`${percent}% of ${number} = ${result.toFixed(2)}`);
  };

  const calculateIsWhatPercent = () => {
    const num1 = parseFloat(isWhatPercent.number1);
    const num2 = parseFloat(isWhatPercent.number2);
    
    if (isNaN(num1) || isNaN(num2) || num2 === 0) {
      toast.error("Please enter valid numbers (denominator cannot be 0)");
      return;
    }
    
    const result = (num1 / num2) * 100;
    setIsWhatPercent({ ...isWhatPercent, result: result.toFixed(2) });
    toast.success(`${num1} is ${result.toFixed(2)}% of ${num2}`);
  };

  const calculatePercentChange = () => {
    const original = parseFloat(percentChange.original);
    const newValue = parseFloat(percentChange.newValue);
    
    if (isNaN(original) || isNaN(newValue) || original === 0) {
      toast.error("Please enter valid numbers (original value cannot be 0)");
      return;
    }
    
    const change = ((newValue - original) / original) * 100;
    const type = change >= 0 ? "increase" : "decrease";
    setPercentChange({ ...percentChange, result: Math.abs(change).toFixed(2), type });
    toast.success(`Percentage ${type}: ${Math.abs(change).toFixed(2)}%`);
  };

  const resetPercentOf = () => {
    setPercentOf({ percent: "", number: "", result: null });
  };

  const resetIsWhatPercent = () => {
    setIsWhatPercent({ number1: "", number2: "", result: null });
  };

  const resetPercentChange = () => {
    setPercentChange({ original: "", newValue: "", result: null, type: "" });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <AnimatedElement animation="fadeIn">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Percent className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Percentage Calculator</h1>
          </div>
          <p className="text-muted-foreground">
            Calculate percentages, percentage increase, decrease, and more
          </p>
        </div>
      </AnimatedElement>

      <Tabs defaultValue="percent-of" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="percent-of">X% of Y</TabsTrigger>
          <TabsTrigger value="is-what-percent">X is what % of Y</TabsTrigger>
          <TabsTrigger value="percent-change">% Change</TabsTrigger>
        </TabsList>

        {/* Tab 1: What is X% of Y */}
        <TabsContent value="percent-of">
          <AnimatedElement animation="slideUp">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  What is X% of Y?
                </CardTitle>
                <CardDescription>
                  Calculate what percentage of a number equals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="percent">Percentage (%)</Label>
                    <Input
                      id="percent"
                      type="number"
                      placeholder="e.g., 25"
                      value={percentOf.percent}
                      onChange={(e) => setPercentOf({ ...percentOf, percent: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number">Of Number</Label>
                    <Input
                      id="number"
                      type="number"
                      placeholder="e.g., 200"
                      value={percentOf.number}
                      onChange={(e) => setPercentOf({ ...percentOf, number: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={calculatePercentOf} className="flex-1">
                    Calculate
                  </Button>
                  <Button onClick={resetPercentOf} variant="outline">
                    Reset
                  </Button>
                </div>

                {percentOf.result !== null && (
                  <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <Percent className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800 dark:text-green-200">Result</AlertTitle>
                    <AlertDescription className="text-green-700 dark:text-green-300">
                      <div className="text-2xl font-bold mt-2">
                        {percentOf.percent}% of {percentOf.number} = {percentOf.result}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </AnimatedElement>
        </TabsContent>

        {/* Tab 2: X is what % of Y */}
        <TabsContent value="is-what-percent">
          <AnimatedElement animation="slideUp">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  X is what % of Y?
                </CardTitle>
                <CardDescription>
                  Find what percentage one number is of another
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="number1">Number (X)</Label>
                    <Input
                      id="number1"
                      type="number"
                      placeholder="e.g., 50"
                      value={isWhatPercent.number1}
                      onChange={(e) => setIsWhatPercent({ ...isWhatPercent, number1: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number2">Of Number (Y)</Label>
                    <Input
                      id="number2"
                      type="number"
                      placeholder="e.g., 200"
                      value={isWhatPercent.number2}
                      onChange={(e) => setIsWhatPercent({ ...isWhatPercent, number2: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={calculateIsWhatPercent} className="flex-1">
                    Calculate
                  </Button>
                  <Button onClick={resetIsWhatPercent} variant="outline">
                    Reset
                  </Button>
                </div>

                {isWhatPercent.result !== null && (
                  <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <Percent className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800 dark:text-blue-200">Result</AlertTitle>
                    <AlertDescription className="text-blue-700 dark:text-blue-300">
                      <div className="text-2xl font-bold mt-2">
                        {isWhatPercent.number1} is {isWhatPercent.result}% of {isWhatPercent.number2}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </AnimatedElement>
        </TabsContent>

        {/* Tab 3: Percentage Change */}
        <TabsContent value="percent-change">
          <AnimatedElement animation="slideUp">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Percentage Increase/Decrease
                </CardTitle>
                <CardDescription>
                  Calculate the percentage change between two numbers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="original">Original Value</Label>
                    <Input
                      id="original"
                      type="number"
                      placeholder="e.g., 100"
                      value={percentChange.original}
                      onChange={(e) => setPercentChange({ ...percentChange, original: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newValue">New Value</Label>
                    <Input
                      id="newValue"
                      type="number"
                      placeholder="e.g., 150"
                      value={percentChange.newValue}
                      onChange={(e) => setPercentChange({ ...percentChange, newValue: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={calculatePercentChange} className="flex-1">
                    Calculate
                  </Button>
                  <Button onClick={resetPercentChange} variant="outline">
                    Reset
                  </Button>
                </div>

                {percentChange.result !== null && (
                  <Alert className={`${
                    percentChange.type === "increase" 
                      ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                  }`}>
                    {percentChange.type === "increase" ? (
                      <TrendingUp className={`h-4 w-4 ${percentChange.type === "increase" ? "text-green-600" : "text-red-600"}`} />
                    ) : (
                      <TrendingDown className={`h-4 w-4 text-red-600`} />
                    )}
                    <AlertTitle className={percentChange.type === "increase" ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}>
                      {percentChange.type === "increase" ? "Percentage Increase" : "Percentage Decrease"}
                    </AlertTitle>
                    <AlertDescription className={percentChange.type === "increase" ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}>
                      <div className="text-2xl font-bold mt-2">
                        {percentChange.result}% {percentChange.type}
                      </div>
                      <div className="text-sm mt-1">
                        From {percentChange.original} to {percentChange.newValue}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </AnimatedElement>
        </TabsContent>
      </Tabs>

      {/* Info Section */}
      <AnimatedElement animation="fadeIn" delay={0.2}>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>About Percentage Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              This free online percentage calculator helps you calculate percentages quickly and accurately.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Calculate what is X% of Y</li>
              <li>Find what percentage X is of Y</li>
              <li>Calculate percentage increase or decrease</li>
              <li>Perfect for financial calculations, discounts, and statistics</li>
            </ul>
          </CardContent>
        </Card>
      </AnimatedElement>
    </div>
  );
};

export default PercentageCalculator;
