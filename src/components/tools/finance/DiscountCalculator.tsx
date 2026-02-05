import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import AnimatedElement from "@/components/animated-element";
import { DollarSign, Percent, Calculator, Tag } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DiscountCalculator = () => {
  const [currency, setCurrency] = useState("INR");
  
  const currencySymbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };
  
  // Tab 1: Calculate final price after discount
  const [priceDiscount, setPriceDiscount] = useState({ originalPrice: "", discountPercent: "", result: null });
  
  // Tab 2: Calculate discount percentage
  const [percentCalc, setPercentCalc] = useState({ originalPrice: "", finalPrice: "", result: null });
  
  // Tab 3: Multiple discounts
  const [multiDiscount, setMultiDiscount] = useState({ originalPrice: "", discount1: "", discount2: "", result: null });

  const calculateFinalPrice = () => {
    const price = parseFloat(priceDiscount.originalPrice);
    const discount = parseFloat(priceDiscount.discountPercent);

    if (isNaN(price) || isNaN(discount) || price <= 0 || discount < 0) {
      toast.error("Please enter valid values");
      return;
    }

    if (discount > 100) {
      toast.error("Discount cannot exceed 100%");
      return;
    }

    const discountAmount = (price * discount) / 100;
    const finalPrice = price - discountAmount;
    const savings = discountAmount;

    setPriceDiscount({
      ...priceDiscount,
      result: {
        finalPrice: finalPrice.toFixed(2),
        savings: savings.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
      },
    });

    toast.success(`Final price: $${finalPrice.toFixed(2)}`);
  };

  const calculateDiscountPercent = () => {
    const original = parseFloat(percentCalc.originalPrice);
    const final = parseFloat(percentCalc.finalPrice);

    if (isNaN(original) || isNaN(final) || original <= 0) {
      toast.error("Please enter valid prices");
      return;
    }

    if (final > original) {
      toast.error("Final price cannot be greater than original price");
      return;
    }

    const discountAmount = original - final;
    const discountPercent = (discountAmount / original) * 100;

    setPercentCalc({
      ...percentCalc,
      result: {
        discountPercent: discountPercent.toFixed(2),
        savings: discountAmount.toFixed(2),
      },
    });

    toast.success(`Discount: ${discountPercent.toFixed(2)}%`);
  };

  const calculateMultipleDiscounts = () => {
    const price = parseFloat(multiDiscount.originalPrice);
    const disc1 = parseFloat(multiDiscount.discount1);
    const disc2 = parseFloat(multiDiscount.discount2);

    if (isNaN(price) || isNaN(disc1) || isNaN(disc2) || price <= 0 || disc1 < 0 || disc2 < 0) {
      toast.error("Please enter valid values");
      return;
    }

    if (disc1 > 100 || disc2 > 100) {
      toast.error("Discounts cannot exceed 100%");
      return;
    }

    // Apply first discount
    const priceAfterFirst = price - (price * disc1) / 100;
    // Apply second discount on the already discounted price
    const finalPrice = priceAfterFirst - (priceAfterFirst * disc2) / 100;
    const totalSavings = price - finalPrice;
    const effectiveDiscount = (totalSavings / price) * 100;

    setMultiDiscount({
      ...multiDiscount,
      result: {
        finalPrice: finalPrice.toFixed(2),
        totalSavings: totalSavings.toFixed(2),
        effectiveDiscount: effectiveDiscount.toFixed(2),
      },
    });

    toast.success(`Final price after multiple discounts: $${finalPrice.toFixed(2)}`);
  };

  const resetPriceDiscount = () => {
    setPriceDiscount({ originalPrice: "", discountPercent: "", result: null });
  };

  const resetPercentCalc = () => {
    setPercentCalc({ originalPrice: "", finalPrice: "", result: null });
  };

  const resetMultiDiscount = () => {
    setMultiDiscount({ originalPrice: "", discount1: "", discount2: "", result: null });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <AnimatedElement animation="fadeIn">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Tag className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Discount Calculator</h1>
          </div>
          <p className="text-muted-foreground">
            Calculate discounts, final prices, and savings amounts
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

      <Tabs defaultValue="final-price" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="final-price">Final Price</TabsTrigger>
          <TabsTrigger value="discount-percent">Discount %</TabsTrigger>
          <TabsTrigger value="multiple">Multiple Discounts</TabsTrigger>
        </TabsList>

        {/* Tab 1: Calculate Final Price */}
        <TabsContent value="final-price">
          <AnimatedElement animation="slideUp">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calculate Final Price After Discount
                </CardTitle>
                <CardDescription>
                  Enter the original price and discount percentage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice" className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Original Price ({currencySymbols[currency]})
                    </Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 100"
                      value={priceDiscount.originalPrice}
                      onChange={(e) => setPriceDiscount({ ...priceDiscount, originalPrice: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountPercent" className="flex items-center gap-1">
                      <Percent className="h-4 w-4" />
                      Discount (%)
                    </Label>
                    <Input
                      id="discountPercent"
                      type="number"
                      placeholder="e.g., 20"
                      value={priceDiscount.discountPercent}
                      onChange={(e) => setPriceDiscount({ ...priceDiscount, discountPercent: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={calculateFinalPrice} className="flex-1">
                    Calculate
                  </Button>
                  <Button onClick={resetPriceDiscount} variant="outline">
                    Reset
                  </Button>
                </div>

                {priceDiscount.result && (
                  <div className="space-y-4">
                    <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800 dark:text-green-200">Final Price</AlertTitle>
                      <AlertDescription className="text-green-700 dark:text-green-300">
                        <div className="text-3xl font-bold mt-1">{currencySymbols[currency]}{priceDiscount.result.finalPrice}</div>
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                        <Tag className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-800 dark:text-blue-200">You Save</AlertTitle>
                        <AlertDescription className="text-blue-700 dark:text-blue-300">
                          <div className="text-2xl font-bold mt-1">{currencySymbols[currency]}{priceDiscount.result.savings}</div>
                        </AlertDescription>
                      </Alert>

                      <Alert className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                        <Percent className="h-4 w-4 text-purple-600" />
                        <AlertTitle className="text-purple-800 dark:text-purple-200">Discount Amount</AlertTitle>
                        <AlertDescription className="text-purple-700 dark:text-purple-300">
                          <div className="text-2xl font-bold mt-1">{currencySymbols[currency]}{priceDiscount.result.discountAmount}</div>
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedElement>
        </TabsContent>

        {/* Tab 2: Calculate Discount Percentage */}
        <TabsContent value="discount-percent">
          <AnimatedElement animation="slideUp">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calculate Discount Percentage
                </CardTitle>
                <CardDescription>
                  Find the discount percentage between original and final price
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice2" className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Original Price ({currencySymbols[currency]})
                    </Label>
                    <Input
                      id="originalPrice2"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 100"
                      value={percentCalc.originalPrice}
                      onChange={(e) => setPercentCalc({ ...percentCalc, originalPrice: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="finalPrice" className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Final Price ({currencySymbols[currency]})
                    </Label>
                    <Input
                      id="finalPrice"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 80"
                      value={percentCalc.finalPrice}
                      onChange={(e) => setPercentCalc({ ...percentCalc, finalPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={calculateDiscountPercent} className="flex-1">
                    Calculate
                  </Button>
                  <Button onClick={resetPercentCalc} variant="outline">
                    Reset
                  </Button>
                </div>

                {percentCalc.result && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                      <Percent className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-800 dark:text-blue-200">Discount Percentage</AlertTitle>
                      <AlertDescription className="text-blue-700 dark:text-blue-300">
                        <div className="text-3xl font-bold mt-1">{percentCalc.result.discountPercent}%</div>
                      </AlertDescription>
                    </Alert>

                    <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800 dark:text-green-200">You Save</AlertTitle>
                      <AlertDescription className="text-green-700 dark:text-green-300">
                        <div className="text-3xl font-bold mt-1">{currencySymbols[currency]}{percentCalc.result.savings}</div>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedElement>
        </TabsContent>

        {/* Tab 3: Multiple Discounts */}
        <TabsContent value="multiple">
          <AnimatedElement animation="slideUp">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calculate Multiple Discounts
                </CardTitle>
                <CardDescription>
                  Apply multiple successive discounts (e.g., 20% off, then additional 10% off)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice3" className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Original Price ({currencySymbols[currency]})
                    </Label>
                    <Input
                      id="originalPrice3"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 100"
                      value={multiDiscount.originalPrice}
                      onChange={(e) => setMultiDiscount({ ...multiDiscount, originalPrice: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount1" className="flex items-center gap-1">
                      <Percent className="h-4 w-4" />
                      First Discount (%)
                    </Label>
                    <Input
                      id="discount1"
                      type="number"
                      placeholder="e.g., 20"
                      value={multiDiscount.discount1}
                      onChange={(e) => setMultiDiscount({ ...multiDiscount, discount1: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount2" className="flex items-center gap-1">
                      <Percent className="h-4 w-4" />
                      Second Discount (%)
                    </Label>
                    <Input
                      id="discount2"
                      type="number"
                      placeholder="e.g., 10"
                      value={multiDiscount.discount2}
                      onChange={(e) => setMultiDiscount({ ...multiDiscount, discount2: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={calculateMultipleDiscounts} className="flex-1">
                    Calculate
                  </Button>
                  <Button onClick={resetMultiDiscount} variant="outline">
                    Reset
                  </Button>
                </div>

                {multiDiscount.result && (
                  <div className="space-y-4">
                    <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800 dark:text-green-200">Final Price</AlertTitle>
                      <AlertDescription className="text-green-700 dark:text-green-300">
                        <div className="text-3xl font-bold mt-1">{currencySymbols[currency]}{multiDiscount.result.finalPrice}</div>
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                        <Tag className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-800 dark:text-blue-200">Total Savings</AlertTitle>
                        <AlertDescription className="text-blue-700 dark:text-blue-300">
                          <div className="text-2xl font-bold mt-1">{currencySymbols[currency]}{multiDiscount.result.totalSavings}</div>
                        </AlertDescription>
                      </Alert>

                      <Alert className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                        <Percent className="h-4 w-4 text-purple-600" />
                        <AlertTitle className="text-purple-800 dark:text-purple-200">Effective Discount</AlertTitle>
                        <AlertDescription className="text-purple-700 dark:text-purple-300">
                          <div className="text-2xl font-bold mt-1">{multiDiscount.result.effectiveDiscount}%</div>
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
            <CardTitle>About Discount Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              This free online discount calculator helps you calculate sale prices, discount percentages, and savings.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Calculate final price after discount</li>
              <li>Find discount percentage from prices</li>
              <li>Apply multiple successive discounts</li>
              <li>Perfect for shopping, sales, and price comparisons</li>
            </ul>
          </CardContent>
        </Card>
      </AnimatedElement>
    </div>
  );
};

export default DiscountCalculator;
