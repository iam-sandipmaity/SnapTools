import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import AnimatedElement from "@/components/animated-element";
import { TrendingUp, DollarSign, Percent, Calculator } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ROICalculator = () => {
  const [investment, setInvestment] = useState("");
  const [returns, setReturns] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [result, setResult] = useState(null);

  const currencySymbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  const calculateROI = () => {
    const initialInvestment = parseFloat(investment);
    const finalValue = parseFloat(returns);

    if (isNaN(initialInvestment) || isNaN(finalValue) || initialInvestment <= 0) {
      toast.error("Please enter valid investment amounts");
      return;
    }

    const gain = finalValue - initialInvestment;
    const roi = (gain / initialInvestment) * 100;
    const isProfitable = gain > 0;

    setResult({
      roi: roi.toFixed(2),
      gain: gain.toFixed(2),
      isProfitable,
      initialInvestment: initialInvestment.toFixed(2),
      finalValue: finalValue.toFixed(2),
    });

    toast.success(`ROI calculated: ${roi.toFixed(2)}%`);
  };

  const reset = () => {
    setInvestment("");
    setReturns("");
    setResult(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <AnimatedElement animation="fadeIn">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">ROI Calculator</h1>
          </div>
          <p className="text-muted-foreground">
            Calculate Return on Investment (ROI) and profitability
          </p>
        </div>
      </AnimatedElement>

      <AnimatedElement animation="slideUp">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Investment Details
            </CardTitle>
            <CardDescription>
              Enter your investment amount and returns to calculate ROI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 mb-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="investment" className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Initial Investment ({currencySymbols[currency]})
                </Label>
                <Input
                  id="investment"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 10000"
                  value={investment}
                  onChange={(e) => setInvestment(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="returns" className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Final Value / Returns ({currencySymbols[currency]})
                </Label>
                <Input
                  id="returns"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 12500"
                  value={returns}
                  onChange={(e) => setReturns(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={calculateROI} className="flex-1">
                Calculate ROI
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
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                ROI Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className={`${
                result.isProfitable 
                  ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" 
                  : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
              }`}>
                <Percent className={`h-4 w-4 ${result.isProfitable ? "text-green-600" : "text-red-600"}`} />
                <AlertTitle className={result.isProfitable ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}>
                  Return on Investment (ROI)
                </AlertTitle>
                <AlertDescription className={result.isProfitable ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}>
                  <div className="text-4xl font-bold mt-2">{result.roi}%</div>
                  <div className="text-sm mt-2">
                    {result.isProfitable ? "✓ Profitable Investment" : "✗ Loss"}
                  </div>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800 dark:text-blue-200">Initial Investment</AlertTitle>
                  <AlertDescription className="text-blue-700 dark:text-blue-300">
                    <div className="text-2xl font-bold mt-1">{currencySymbols[currency]}{result.initialInvestment}</div>
                  </AlertDescription>
                </Alert>

                <Alert className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                  <AlertTitle className="text-purple-800 dark:text-purple-200">Final Value</AlertTitle>
                  <AlertDescription className="text-purple-700 dark:text-purple-300">
                    <div className="text-2xl font-bold mt-1">{currencySymbols[currency]}{result.finalValue}</div>
                  </AlertDescription>
                </Alert>

                <Alert className={`${
                  result.isProfitable 
                    ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" 
                    : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                }`}>
                  <TrendingUp className={`h-4 w-4 ${result.isProfitable ? "text-green-600" : "text-red-600"}`} />
                  <AlertTitle className={result.isProfitable ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}>
                    {result.isProfitable ? "Net Gain" : "Net Loss"}
                  </AlertTitle>
                  <AlertDescription className={result.isProfitable ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}>
                    <div className="text-2xl font-bold mt-1">
                      {result.isProfitable ? "+" : ""}{result.gain >= 0 ? currencySymbols[currency] : "-" + currencySymbols[currency]}{Math.abs(result.gain)}
                    </div>
                  </AlertDescription>
                </Alert>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">ROI Interpretation</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {parseFloat(result.roi) > 0 ? (
                      <>
                        <p>✓ Your investment generated a positive return of {result.roi}%.</p>
                        <p>✓ For every {currencySymbols[currency]}1 invested, you gained {currencySymbols[currency]}{(parseFloat(result.roi) / 100).toFixed(2)}.</p>
                        <p>✓ Total profit: {currencySymbols[currency]}{result.gain}</p>
                      </>
                    ) : parseFloat(result.roi) === 0 ? (
                      <>
                        <p>→ Your investment broke even with a 0% return.</p>
                        <p>→ No gain or loss on your investment.</p>
                      </>
                    ) : (
                      <>
                        <p>✗ Your investment resulted in a loss of {Math.abs(result.roi)}%.</p>
                        <p>✗ For every {currencySymbols[currency]}1 invested, you lost {currencySymbols[currency]}{Math.abs(parseFloat(result.roi) / 100).toFixed(2)}.</p>
                        <p>✗ Total loss: {currencySymbols[currency]}{Math.abs(result.gain)}</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </AnimatedElement>
      )}

      <AnimatedElement animation="fadeIn" delay={0.2}>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>About ROI Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              This free online ROI calculator helps you measure return on investment and profitability.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Calculate ROI percentage quickly</li>
              <li>Measure investment profitability</li>
              <li>Compare different investment opportunities</li>
              <li>Perfect for business, stocks, real estate, and personal investments</li>
            </ul>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="font-semibold mb-1">ROI Formula:</p>
              <p>ROI = (Final Value - Initial Investment) / Initial Investment × 100%</p>
            </div>
          </CardContent>
        </Card>
      </AnimatedElement>
    </div>
  );
};

export default ROICalculator;
