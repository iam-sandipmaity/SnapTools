import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import AnimatedElement from "@/components/animated-element";
import { DollarSign, Users, Percent, Calculator } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TipCalculator = () => {
  const [billAmount, setBillAmount] = useState("");
  const [tipPercent, setTipPercent] = useState([15]);
  const [numberOfPeople, setNumberOfPeople] = useState("1");
  const [currency, setCurrency] = useState("INR");
  const [result, setResult] = useState(null);

  const currencySymbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  const calculateTip = () => {
    const bill = parseFloat(billAmount);
    const people = parseInt(numberOfPeople);

    if (isNaN(bill) || bill <= 0) {
      toast.error("Please enter a valid bill amount");
      return;
    }

    if (isNaN(people) || people <= 0) {
      toast.error("Please enter a valid number of people");
      return;
    }

    const tipAmount = (bill * tipPercent[0]) / 100;
    const totalAmount = bill + tipAmount;
    const perPersonTotal = totalAmount / people;
    const perPersonTip = tipAmount / people;

    setResult({
      tipAmount: tipAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      perPersonTotal: perPersonTotal.toFixed(2),
      perPersonTip: perPersonTip.toFixed(2),
      tipPercent: tipPercent[0],
    });

    toast.success(`Tip calculated: $${tipAmount.toFixed(2)}`);
  };

  const reset = () => {
    setBillAmount("");
    setTipPercent([15]);
    setNumberOfPeople("1");
    setResult(null);
  };

  const quickTipButtons = [10, 15, 18, 20, 25];

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <AnimatedElement animation="fadeIn">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <DollarSign className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Tip Calculator</h1>
          </div>
          <p className="text-muted-foreground">
            Calculate tip amounts and split bills with ease
          </p>
        </div>
      </AnimatedElement>

      <AnimatedElement animation="slideUp">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Bill Details
            </CardTitle>
            <CardDescription>
              Enter the bill amount and tip percentage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency" className="w-full md:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="billAmount" className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Bill Amount ({currencySymbols[currency]})
              </Label>
              <Input
                id="billAmount"
                type="number"
                step="0.01"
                placeholder="e.g., 50.00"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1">
                  <Percent className="h-4 w-4" />
                  Tip Percentage
                </Label>
                <span className="text-2xl font-bold text-primary">{tipPercent[0]}%</span>
              </div>
              
              <Slider
                value={tipPercent}
                onValueChange={setTipPercent}
                min={0}
                max={50}
                step={1}
                className="w-full"
              />

              <div className="flex gap-2 flex-wrap">
                {quickTipButtons.map((percent) => (
                  <Button
                    key={percent}
                    variant={tipPercent[0] === percent ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTipPercent([percent])}
                  >
                    {percent}%
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfPeople" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Number of People
              </Label>
              <Input
                id="numberOfPeople"
                type="number"
                min="1"
                placeholder="e.g., 2"
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={calculateTip} className="flex-1">
                Calculate
              </Button>
              <Button onClick={reset} variant="outline">
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </AnimatedElement>

      {result && (
        <AnimatedElement animation="slideUp" delay={0.1}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tip Calculation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <Percent className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800 dark:text-green-200">Tip Amount ({result.tipPercent}%)</AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    <div className="text-3xl font-bold mt-1">{currencySymbols[currency]}{result.tipAmount}</div>
                  </AlertDescription>
                </Alert>

                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800 dark:text-blue-200">Total Bill</AlertTitle>
                  <AlertDescription className="text-blue-700 dark:text-blue-300">
                    <div className="text-3xl font-bold mt-1">{currencySymbols[currency]}{result.totalAmount}</div>
                  </AlertDescription>
                </Alert>
              </div>

              {parseInt(numberOfPeople) > 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Alert className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                    <Users className="h-4 w-4 text-purple-600" />
                    <AlertTitle className="text-purple-800 dark:text-purple-200">Per Person Total</AlertTitle>
                    <AlertDescription className="text-purple-700 dark:text-purple-300">
                      <div className="text-2xl font-bold mt-1">{currencySymbols[currency]}{result.perPersonTotal}</div>
                      <div className="text-xs mt-1">Split between {numberOfPeople} people</div>
                    </AlertDescription>
                  </Alert>

                  <Alert className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
                    <Percent className="h-4 w-4 text-orange-600" />
                    <AlertTitle className="text-orange-800 dark:text-orange-200">Per Person Tip</AlertTitle>
                    <AlertDescription className="text-orange-700 dark:text-orange-300">
                      <div className="text-2xl font-bold mt-1">{currencySymbols[currency]}{result.perPersonTip}</div>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </AnimatedElement>
      )}

      <AnimatedElement animation="fadeIn" delay={0.2}>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>About Tip Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              This free online tip calculator helps you calculate tips and split bills easily.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Calculate tip amounts for any percentage</li>
              <li>Split bills evenly among multiple people</li>
              <li>Quick tip percentage buttons for common amounts</li>
              <li>Perfect for restaurants, delivery, and services</li>
            </ul>
          </CardContent>
        </Card>
      </AnimatedElement>
    </div>
  );
};

export default TipCalculator;
