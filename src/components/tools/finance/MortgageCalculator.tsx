import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import AnimatedElement from "@/components/animated-element";
import { Home, DollarSign, Calendar, Percent, Calculator, TrendingUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MortgageCalculator = () => {
  const [homePrice, setHomePrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [propertyTax, setPropertyTax] = useState("");
  const [homeInsurance, setHomeInsurance] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [result, setResult] = useState(null);

  const currencySymbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  const calculateMortgage = () => {
    const price = parseFloat(homePrice);
    const down = parseFloat(downPayment);
    const rate = parseFloat(interestRate) / 100 / 12; // Monthly interest rate
    const years = parseFloat(loanTerm);
    const tax = parseFloat(propertyTax) || 0;
    const insurance = parseFloat(homeInsurance) || 0;

    if (isNaN(price) || isNaN(down) || isNaN(rate) || isNaN(years) || price <= 0 || years <= 0) {
      toast.error("Please enter valid mortgage details");
      return;
    }

    if (down >= price) {
      toast.error("Down payment must be less than home price");
      return;
    }

    const loanAmount = price - down;
    const months = years * 12;

    // Calculate monthly principal & interest using mortgage formula
    const monthlyPI = rate === 0 
      ? loanAmount / months 
      : (loanAmount * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);

    const monthlyTax = tax / 12;
    const monthlyInsurance = insurance / 12;
    const totalMonthlyPayment = monthlyPI + monthlyTax + monthlyInsurance;
    
    const totalPayment = monthlyPI * months;
    const totalInterest = totalPayment - loanAmount;

    setResult({
      loanAmount: loanAmount.toFixed(2),
      monthlyPI: monthlyPI.toFixed(2),
      monthlyTax: monthlyTax.toFixed(2),
      monthlyInsurance: monthlyInsurance.toFixed(2),
      totalMonthly: totalMonthlyPayment.toFixed(2),
      totalPayment: totalPayment.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      downPaymentPercent: ((down / price) * 100).toFixed(1),
    });

    toast.success("Mortgage calculation completed!");
  };

  const reset = () => {
    setHomePrice("");
    setDownPayment("");
    setInterestRate("");
    setLoanTerm("");
    setPropertyTax("");
    setHomeInsurance("");
    setResult(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <AnimatedElement animation="fadeIn">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Home className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Mortgage Calculator</h1>
          </div>
          <p className="text-muted-foreground">
            Calculate monthly mortgage payments including taxes and insurance
          </p>
        </div>
      </AnimatedElement>

      <AnimatedElement animation="slideUp">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Mortgage Details
            </CardTitle>
            <CardDescription>
              Enter your home loan information to calculate payments
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
                <Label htmlFor="homePrice" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  Home Price ({currencySymbols[currency]})
                </Label>
                <Input
                  id="homePrice"
                  type="number"
                  placeholder="e.g., 300000"
                  value={homePrice}
                  onChange={(e) => setHomePrice(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="downPayment" className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Down Payment ({currencySymbols[currency]})
                </Label>
                <Input
                  id="downPayment"
                  type="number"
                  placeholder="e.g., 60000"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="interestRate" className="flex items-center gap-1">
                  <Percent className="h-4 w-4" />
                  Interest Rate (% per year)
                </Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 3.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="loanTerm" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Loan Term (years)
                </Label>
                <Input
                  id="loanTerm"
                  type="number"
                  placeholder="e.g., 30"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyTax" className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Annual Property Tax ({currencySymbols[currency]}) - Optional
                </Label>
                <Input
                  id="propertyTax"
                  type="number"
                  placeholder="e.g., 3000"
                  value={propertyTax}
                  onChange={(e) => setPropertyTax(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="homeInsurance" className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Annual Home Insurance ({currencySymbols[currency]}) - Optional
                </Label>
                <Input
                  id="homeInsurance"
                  type="number"
                  placeholder="e.g., 1200"
                  value={homeInsurance}
                  onChange={(e) => setHomeInsurance(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={calculateMortgage} className="flex-1">
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
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Mortgage Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800 dark:text-blue-200">Total Monthly Payment</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  <div className="text-3xl font-bold mt-1">{currencySymbols[currency]}{result.totalMonthly}</div>
                  <div className="text-sm mt-2 space-y-1">
                    <div>Principal & Interest: {currencySymbols[currency]}{result.monthlyPI}</div>
                    {parseFloat(result.monthlyTax) > 0 && <div>Property Tax: {currencySymbols[currency]}{result.monthlyTax}</div>}
                    {parseFloat(result.monthlyInsurance) > 0 && <div>Home Insurance: {currencySymbols[currency]}{result.monthlyInsurance}</div>}
                  </div>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <Home className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800 dark:text-green-200">Loan Amount</AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    <div className="text-2xl font-bold mt-1">{currencySymbols[currency]}{result.loanAmount}</div>
                    <div className="text-xs mt-1">{result.downPaymentPercent}% down</div>
                  </AlertDescription>
                </Alert>

                <Alert className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                  <AlertTitle className="text-purple-800 dark:text-purple-200">Total Interest</AlertTitle>
                  <AlertDescription className="text-purple-700 dark:text-purple-300">
                    <div className="text-2xl font-bold mt-1">{currencySymbols[currency]}{result.totalInterest}</div>
                  </AlertDescription>
                </Alert>

                <Alert className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  <AlertTitle className="text-orange-800 dark:text-orange-200">Total Payment</AlertTitle>
                  <AlertDescription className="text-orange-700 dark:text-orange-300">
                    <div className="text-2xl font-bold mt-1">{currencySymbols[currency]}{result.totalPayment}</div>
                    <div className="text-xs mt-1">Principal + Interest</div>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </AnimatedElement>
      )}

      <AnimatedElement animation="fadeIn" delay={0.2}>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>About Mortgage Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              This free online mortgage calculator helps you estimate monthly mortgage payments including property taxes and home insurance.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Calculate monthly mortgage payments (PITI - Principal, Interest, Taxes, Insurance)</li>
              <li>View total interest paid over the loan term</li>
              <li>Estimate property taxes and insurance costs</li>
              <li>Perfect for home buyers and refinancing</li>
            </ul>
          </CardContent>
        </Card>
      </AnimatedElement>
    </div>
  );
};

export default MortgageCalculator;
