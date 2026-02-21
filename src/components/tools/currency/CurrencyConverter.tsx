
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import AnimatedElement from "@/components/animated-element";
import { fetchCurrencyRates } from "@/lib/api/exchange-rates";
import { useWorkspacePreference } from "@/hooks/use-workspace-preference";

type Currency = {
  code: string;
  name: string;
  symbol: string;
};

const currencies: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "MXN", name: "Mexican Peso", symbol: "Mex$" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
];

const CurrencyConverter = () => {
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useWorkspacePreference("curr_from", "USD");
  const [toCurrency, setToCurrency] = useWorkspacePreference("curr_to", "INR");
  const [result, setResult] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    refreshRates();
  }, []);

  useEffect(() => {
    if (amount && fromCurrency && toCurrency) {
      convertCurrency();
    }
  }, [amount, fromCurrency, toCurrency]);

  const convertCurrency = () => {
    if (!exchangeRates || Object.keys(exchangeRates).length === 0) {
      return;
    }
    const value = parseFloat(amount);

    if (isNaN(value)) {
      setResult("");
      return;
    }

    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];

    if (fromRate && toRate) {
      const convertedAmount = (value / fromRate) * toRate;

      const toCurrencyObj = currencies.find(c => c.code === toCurrency);
      setResult(`${toCurrencyObj?.symbol || ''} ${convertedAmount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`);
    }
  };

  const refreshRates = async () => {
    setIsLoading(true);
    try {
      const rates = await fetchCurrencyRates();
      setExchangeRates(rates);
      setLastUpdated(new Date().toLocaleString());
      toast.success("Exchange rates updated!");
      convertCurrency();
    } catch (error) {
      toast.error("Failed to update exchange rates");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <AnimatedElement>
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Currency Converter</h3>
            <div className="text-xs text-muted-foreground">
              Rates last updated: {lastUpdated}
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-6 px-2"
                onClick={refreshRates}
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "⟳"}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
              <div className="space-y-2">
                <Label htmlFor="from-currency">From</Label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger id="from-currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-center h-12">
                <button
                  onClick={handleSwapCurrencies}
                  className="rounded-full p-2 hover:bg-muted"
                  title="Swap currencies"
                >
                  ⇄
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="to-currency">To</Label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger id="to-currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Converted Amount</div>
              <div className="text-2xl font-semibold">
                {result || "-"}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {amount && result
                  ? `${currencies.find(c => c.code === fromCurrency)?.symbol || ''} ${parseFloat(amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} ${fromCurrency} = ${result} ${toCurrency}`
                  : ""}
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center mt-4 p-2 bg-muted/30 rounded-lg">
            <span className="font-medium">💱:</span> Rates are fetched from exchangeratesapi.io and may slightly differ from real-time market values.
          </div>
        </CardContent>
      </Card>
    </AnimatedElement>
  );
};

export default CurrencyConverter;
