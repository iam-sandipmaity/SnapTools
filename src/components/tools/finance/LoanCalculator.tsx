import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import AnimatedElement from "@/components/animated-element";
import { DollarSign, Calendar, Percent, Calculator, TrendingUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [result, setResult] = useState(null);
  const [amortization, setAmortization] = useState([]);

  const currencySymbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  const calculateLoan = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 100 / 12; // Monthly interest rate
    const months = parseFloat(loanTerm) * 12; // Convert years to months

    if (isNaN(principal) || isNaN(rate) || isNaN(months) || principal <= 0 || months <= 0) {
      toast.error("Please enter valid loan details");
      return;
    }

    // Calculate monthly payment using the formula: M = P[r(1+r)^n]/[(1+r)^n-1]
    const monthlyPayment = rate === 0 
      ? principal / months 
      : (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);

    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - principal;

    // Generate amortization schedule (first 12 months)
    let balance = principal;
    const schedule = [];
    
    for (let i = 1; i <= Math.min(12, months); i++) {
      const interestPayment = balance * rate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;

      schedule.push({
        month: i,
        payment: monthlyPayment.toFixed(2),
        principal: principalPayment.toFixed(2),
        interest: interestPayment.toFixed(2),
        balance: balance.toFixed(2),
      });
    }

    setResult({
      monthlyPayment: monthlyPayment.toFixed(2),
      totalPayment: totalPayment.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      loanAmount: principal.toFixed(2),
    });

    setAmortization(schedule);
    toast.success("Loan calculation completed!");
  };

  const reset = () => {
    setLoanAmount("");
    setInterestRate("");
    setLoanTerm("");
    setResult(null);
    setAmortization([]);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <AnimatedElement animation="fadeIn">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <DollarSign className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Loan Calculator</h1>
          </div>
          <p className="text-muted-foreground">
            Calculate monthly loan payments, total interest, and amortization schedule
          </p>
        </div>
      </AnimatedElement>

      <AnimatedElement animation="slideUp">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Loan Details
            </CardTitle>
            <CardDescription>
              Enter your loan information to calculate payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
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
                <Label htmlFor="loanAmount" className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Loan Amount ({currencySymbols[currency]})
                </Label>
                <Input
                  id="loanAmount"
                  type="number"
                  placeholder="e.g., 10000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
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
                  placeholder="e.g., 5.5"
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
                  placeholder="e.g., 5"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={calculateLoan} className="flex-1">
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
        <>
          <AnimatedElement animation="slideUp" delay={0.1}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Loan Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800 dark:text-blue-200">Monthly Payment</AlertTitle>
                    <AlertDescription className="text-blue-700 dark:text-blue-300">
                      <div className="text-2xl font-bold mt-1">{currencySymbols[currency]}{result.monthlyPayment}</div>
                    </AlertDescription>
                  </Alert>

                  <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800 dark:text-green-200">Loan Amount</AlertTitle>
                    <AlertDescription className="text-green-700 dark:text-green-300">
                      <div className="text-2xl font-bold mt-1">{currencySymbols[currency]}{result.loanAmount}</div>
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
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </AnimatedElement>

          {amortization.length > 0 && (
            <AnimatedElement animation="slideUp" delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle>Amortization Schedule (First 12 Months)</CardTitle>
                  <CardDescription>
                    Breakdown of principal and interest payments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Month</th>
                          <th className="text-right p-2">Payment</th>
                          <th className="text-right p-2">Principal</th>
                          <th className="text-right p-2">Interest</th>
                          <th className="text-right p-2">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {amortization.map((row) => (
                          <tr key={row.month} className="border-b hover:bg-muted/50">
                            <td className="p-2">{row.month}</td>
                            <td className="text-right p-2">{currencySymbols[currency]}{row.payment}</td>
                            <td className="text-right p-2 text-green-600">{currencySymbols[currency]}{row.principal}</td>
                            <td className="text-right p-2 text-red-600">{currencySymbols[currency]}{row.interest}</td>
                            <td className="text-right p-2 font-medium">{currencySymbols[currency]}{row.balance}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </AnimatedElement>
          )}
        </>
      )}

      <AnimatedElement animation="fadeIn" delay={0.3}>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>About Loan Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              This free online loan calculator helps you calculate monthly loan payments and view amortization schedules.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Calculate monthly loan payments</li>
              <li>View total interest paid over the loan term</li>
              <li>See detailed amortization schedule</li>
              <li>Perfect for personal loans, car loans, and more</li>
            </ul>
          </CardContent>
        </Card>
      </AnimatedElement>
    </div>
  );
};

export default LoanCalculator;
