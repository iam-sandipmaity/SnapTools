import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import AnimatedElement from "@/components/animated-element";
import { DollarSign, Percent, Calculator, Receipt } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TaxCalculator = () => {
  const [currency, setCurrency] = useState("INR");
  
  const currencySymbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };
  
  // Sales Tax Calculator
  const [salesTax, setSalesTax] = useState({ price: "", taxRate: "", result: null });
  
  // Simple Income Tax Calculator
  const [incomeTax, setIncomeTax] = useState({ income: "", taxRate: "", deductions: "", result: null });
  
  // VAT Calculator
  const [vat, setVat] = useState({ price: "", vatRate: "", result: null });

  const calculateSalesTax = () => {
    const price = parseFloat(salesTax.price);
    const rate = parseFloat(salesTax.taxRate);

    if (isNaN(price) || isNaN(rate) || price < 0 || rate < 0) {
      toast.error("Please enter valid values");
      return;
    }

    const taxAmount = (price * rate) / 100;
    const totalPrice = price + taxAmount;

    setSalesTax({
      ...salesTax,
      result: {
        taxAmount: taxAmount.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
        basePrice: price.toFixed(2),
      },
    });

    toast.success(`Sales tax calculated: $${taxAmount.toFixed(2)}`);
  };

  const calculateIncomeTax = () => {
    const income = parseFloat(incomeTax.income);
    const rate = parseFloat(incomeTax.taxRate);
    const deductions = parseFloat(incomeTax.deductions) || 0;

    if (isNaN(income) || isNaN(rate) || income < 0 || rate < 0) {
      toast.error("Please enter valid values");
      return;
    }

    if (deductions > income) {
      toast.error("Deductions cannot exceed income");
      return;
    }

    const taxableIncome = income - deductions;
    const taxAmount = (taxableIncome * rate) / 100;
    const afterTaxIncome = income - taxAmount;

    setIncomeTax({
      ...incomeTax,
      result: {
        taxAmount: taxAmount.toFixed(2),
        taxableIncome: taxableIncome.toFixed(2),
        afterTaxIncome: afterTaxIncome.toFixed(2),
        deductions: deductions.toFixed(2),
      },
    });

    toast.success(`Income tax calculated: $${taxAmount.toFixed(2)}`);
  };

  const calculateVAT = () => {
    const price = parseFloat(vat.price);
    const rate = parseFloat(vat.vatRate);

    if (isNaN(price) || isNaN(rate) || price < 0 || rate < 0) {
      toast.error("Please enter valid values");
      return;
    }

    const vatAmount = (price * rate) / 100;
    const priceWithVAT = price + vatAmount;
    const priceWithoutVAT = price / (1 + rate / 100);
    const vatFromTotal = price - priceWithoutVAT;

    setVat({
      ...vat,
      result: {
        vatAmount: vatAmount.toFixed(2),
        priceWithVAT: priceWithVAT.toFixed(2),
        priceWithoutVAT: priceWithoutVAT.toFixed(2),
        vatFromTotal: vatFromTotal.toFixed(2),
      },
    });

    toast.success(`VAT calculated: $${vatAmount.toFixed(2)}`);
  };

  const resetSalesTax = () => {
    setSalesTax({ price: "", taxRate: "", result: null });
  };

  const resetIncomeTax = () => {
    setIncomeTax({ income: "", taxRate: "", deductions: "", result: null });
  };

  const resetVAT = () => {
    setVat({ price: "", vatRate: "", result: null });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <AnimatedElement animation="fadeIn">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Receipt className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Tax Calculator</h1>
          </div>
          <p className="text-muted-foreground">
            Calculate sales tax, income tax, and VAT quickly and easily
          </p>
        </div>
      </AnimatedElement>

      <AnimatedElement animation="slideUp" delay={0.1}>
        <Card className="mb-6">
          <CardContent className="pt-6">
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
          </CardContent>
        </Card>
      </AnimatedElement>

      <Tabs defaultValue="sales-tax" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sales-tax">Sales Tax</TabsTrigger>
          <TabsTrigger value="income-tax">Income Tax</TabsTrigger>
          <TabsTrigger value="vat">VAT</TabsTrigger>
        </TabsList>

        {/* Tab 1: Sales Tax */}
        <TabsContent value="sales-tax">
          <AnimatedElement animation="slideUp">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Sales Tax Calculator
                </CardTitle>
                <CardDescription>
                  Calculate the sales tax and total price
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Price Before Tax ({currencySymbols[currency]})
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 100"
                      value={salesTax.price}
                      onChange={(e) => setSalesTax({ ...salesTax, price: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxRate" className="flex items-center gap-1">
                      <Percent className="h-4 w-4" />
                      Sales Tax Rate (%)
                    </Label>
                    <Input
                      id="taxRate"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 8.5"
                      value={salesTax.taxRate}
                      onChange={(e) => setSalesTax({ ...salesTax, taxRate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={calculateSalesTax} className="flex-1">
                    Calculate
                  </Button>
                  <Button onClick={resetSalesTax} variant="outline">
                    Reset
                  </Button>
                </div>

                {salesTax.result && (
                  <div className="space-y-4">
                    <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-800 dark:text-blue-200">Total Price (with tax)</AlertTitle>
                      <AlertDescription className="text-blue-700 dark:text-blue-300">
                        <div className="text-3xl font-bold mt-1">{currencySymbols[currency]}{salesTax.result.totalPrice}</div>
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                        <Receipt className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800 dark:text-green-200">Base Price</AlertTitle>
                        <AlertDescription className="text-green-700 dark:text-green-300">
                          <div className="text-2xl font-bold mt-1">{currencySymbols[currency]}{salesTax.result.basePrice}</div>
                        </AlertDescription>
                      </Alert>

                      <Alert className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                        <Percent className="h-4 w-4 text-purple-600" />
                        <AlertTitle className="text-purple-800 dark:text-purple-200">Tax Amount</AlertTitle>
                        <AlertDescription className="text-purple-700 dark:text-purple-300">
                          <div className="text-2xl font-bold mt-1">{currencySymbols[currency]}{salesTax.result.taxAmount}</div>
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedElement>
        </TabsContent>

        {/* Tab 2: Income Tax */}
        <TabsContent value="income-tax">
          <AnimatedElement animation="slideUp">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Simple Income Tax Calculator
                </CardTitle>
                <CardDescription>
                  Estimate your income tax based on a flat tax rate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="income" className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Annual Income ({currencySymbols[currency]})
                    </Label>
                    <Input
                      id="income"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 50000"
                      value={incomeTax.income}
                      onChange={(e) => setIncomeTax({ ...incomeTax, income: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incomeTaxRate" className="flex items-center gap-1">
                      <Percent className="h-4 w-4" />
                      Tax Rate (%)
                    </Label>
                    <Input
                      id="incomeTaxRate"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 22"
                      value={incomeTax.taxRate}
                      onChange={(e) => setIncomeTax({ ...incomeTax, taxRate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deductions" className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Deductions ({currencySymbols[currency]}) - Optional
                    </Label>
                    <Input
                      id="deductions"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 12950"
                      value={incomeTax.deductions}
                      onChange={(e) => setIncomeTax({ ...incomeTax, deductions: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={calculateIncomeTax} className="flex-1">
                    Calculate
                  </Button>
                  <Button onClick={resetIncomeTax} variant="outline">
                    Reset
                  </Button>
                </div>

                {incomeTax.result && (
                  <div className="space-y-4">
                    <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800 dark:text-green-200">After-Tax Income</AlertTitle>
                      <AlertDescription className="text-green-700 dark:text-green-300">
                        <div className="text-3xl font-bold mt-1">{currencySymbols[currency]}{incomeTax.result.afterTaxIncome}</div>
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                        <Receipt className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-800 dark:text-blue-200">Taxable Income</AlertTitle>
                        <AlertDescription className="text-blue-700 dark:text-blue-300">
                          <div className="text-2xl font-bold mt-1">{currencySymbols[currency]}{incomeTax.result.taxableIncome}</div>
                        </AlertDescription>
                      </Alert>

                      <Alert className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                        <Percent className="h-4 w-4 text-red-600" />
                        <AlertTitle className="text-red-800 dark:text-red-200">Tax Amount</AlertTitle>
                        <AlertDescription className="text-red-700 dark:text-red-300">
                          <div className="text-2xl font-bold mt-1">{currencySymbols[currency]}{incomeTax.result.taxAmount}</div>
                        </AlertDescription>
                      </Alert>

                      <Alert className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                        <DollarSign className="h-4 w-4 text-purple-600" />
                        <AlertTitle className="text-purple-800 dark:text-purple-200">Deductions</AlertTitle>
                        <AlertDescription className="text-purple-700 dark:text-purple-300">
                          <div className="text-2xl font-bold mt-1">{currencySymbols[currency]}{incomeTax.result.deductions}</div>
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedElement>
        </TabsContent>

        {/* Tab 3: VAT */}
        <TabsContent value="vat">
          <AnimatedElement animation="slideUp">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  VAT Calculator
                </CardTitle>
                <CardDescription>
                  Calculate Value Added Tax (VAT) - add or remove VAT
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vatPrice" className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Price ({currencySymbols[currency]})
                    </Label>
                    <Input
                      id="vatPrice"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 100"
                      value={vat.price}
                      onChange={(e) => setVat({ ...vat, price: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vatRate" className="flex items-center gap-1">
                      <Percent className="h-4 w-4" />
                      VAT Rate (%)
                    </Label>
                    <Input
                      id="vatRate"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 20"
                      value={vat.vatRate}
                      onChange={(e) => setVat({ ...vat, vatRate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={calculateVAT} className="flex-1">
                    Calculate
                  </Button>
                  <Button onClick={resetVAT} variant="outline">
                    Reset
                  </Button>
                </div>

                {vat.result && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800 dark:text-green-200">Price + VAT</AlertTitle>
                        <AlertDescription className="text-green-700 dark:text-green-300">
                          <div className="text-2xl font-bold mt-1">{currencySymbols[currency]}{vat.result.priceWithVAT}</div>
                          <div className="text-sm mt-1">VAT Added: {currencySymbols[currency]}{vat.result.vatAmount}</div>
                        </AlertDescription>
                      </Alert>

                      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                        <Receipt className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-800 dark:text-blue-200">Price - VAT</AlertTitle>
                        <AlertDescription className="text-blue-700 dark:text-blue-300">
                          <div className="text-2xl font-bold mt-1">{currencySymbols[currency]}{vat.result.priceWithoutVAT}</div>
                          <div className="text-sm mt-1">VAT Removed: {currencySymbols[currency]}{vat.result.vatFromTotal}</div>
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedElement>
        </TabsContent>
      </Tabs>

      <AnimatedElement animation="fadeIn" delay={0.2}>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>About Tax Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              This free online tax calculator helps you estimate various types of taxes.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Calculate sales tax on purchases</li>
              <li>Estimate income tax with deductions</li>
              <li>Add or remove VAT from prices</li>
              <li>Perfect for shopping, budgeting, and financial planning</li>
            </ul>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs"><strong>Note:</strong> This calculator provides estimates. Actual tax amounts may vary based on local laws and regulations. Consult a tax professional for accurate tax advice.</p>
            </div>
          </CardContent>
        </Card>
      </AnimatedElement>
    </div>
  );
};

export default TaxCalculator;
