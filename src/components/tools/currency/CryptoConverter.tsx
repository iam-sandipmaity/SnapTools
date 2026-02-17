import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import AnimatedElement from "@/components/animated-element";
import { fetchCryptoRates, fetchCurrencyRates } from "@/lib/api/exchange-rates";

type Currency = {
  code: string;
  name: string;
  symbol: string;
  type: "crypto" | "fiat";
};

const currencies: Currency[] = [
  { code: "BTC", name: "Bitcoin", symbol: "₿", type: "crypto" },
  { code: "ETH", name: "Ethereum", symbol: "Ξ", type: "crypto" },
  { code: "USDT", name: "Tether", symbol: "₮", type: "crypto" },
  { code: "BNB", name: "Binance Coin", symbol: "BNB", type: "crypto" },
  { code: "XRP", name: "Ripple", symbol: "XRP", type: "crypto" },
  { code: "SOL", name: "Solana", symbol: "SOL", type: "crypto" },
  { code: "ADA", name: "Cardano", symbol: "ADA", type: "crypto" },
  { code: "DOGE", name: "Dogecoin", symbol: "Ð", type: "crypto" },
  { code: "MATIC", name: "Polygon", symbol: "MATIC", type: "crypto" },
  { code: "DOT", name: "Polkadot", symbol: "DOT", type: "crypto" },
  { code: "USD", name: "US Dollar", symbol: "$", type: "fiat" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", type: "fiat" },
  { code: "GBP", name: "British Pound", symbol: "£", type: "fiat" },
  { code: "EUR", name: "Euro", symbol: "€", type: "fiat" },
];

const cryptoIdMap: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  BNB: 'binancecoin',
  XRP: 'ripple',
  SOL: 'solana',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  MATIC: 'matic-network',
  DOT: 'polkadot',
};

const CryptoConverter = () => {
  const [cryptoRates, setCryptoRates] = useState<{ [key: string]: { usd: number } }>({});
  const [fiatRates, setFiatRates] = useState<{ [key: string]: number }>({});
  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState<string>("BTC");
  const [toCurrency, setToCurrency] = useState<string>("USD");
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
  }, [amount, fromCurrency, toCurrency, cryptoRates, fiatRates]);

  const convertCurrency = () => {
    if (Object.keys(cryptoRates).length === 0 || Object.keys(fiatRates).length === 0) {
      return;
    }

    const value = parseFloat(amount);
    if (isNaN(value)) {
      setResult("");
      return;
    }

    const getRateToUsd = (code: string) => {
      if (cryptoIdMap[code]) {
        return cryptoRates[cryptoIdMap[code]]?.usd;
      }
      if (code === 'USD') return 1;
      const fiatRate = fiatRates[code]; // 1 USD = X Fiat
      return fiatRate ? (1 / fiatRate) : null;
    };

    const getRateFromUsd = (code: string) => {
      if (cryptoIdMap[code]) {
        const usdRate = cryptoRates[cryptoIdMap[code]]?.usd;
        return usdRate ? (1 / usdRate) : null;
      }
      if (code === 'USD') return 1;
      return fiatRates[code]; // 1 USD = X Fiat
    };

    const fromRate = getRateToUsd(fromCurrency);
    const toRate = getRateFromUsd(toCurrency);

    if (fromRate !== null && toRate !== null && fromRate !== undefined && toRate !== undefined) {
      const convertedAmount = value * fromRate * toRate;
      const toCurrencyObj = currencies.find(c => c.code === toCurrency);

      const precision = toCurrencyObj?.type === "crypto" ? 8 : 2;

      setResult(`${toCurrencyObj?.symbol || ''} ${convertedAmount.toLocaleString(undefined, {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      })}`);
    }
  };

  const refreshRates = async () => {
    setIsLoading(true);
    try {
      const cryptoIds = Object.values(cryptoIdMap);
      const [cRates, fRates] = await Promise.all([
        fetchCryptoRates(cryptoIds),
        fetchCurrencyRates('USD')
      ]);

      setCryptoRates(cRates);
      setFiatRates(fRates);
      setLastUpdated(new Date().toLocaleString());
      toast.success("Rates updated successfully!");
    } catch (error) {
      toast.error("Failed to update rates. Using cached data if available.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  return (
    <AnimatedElement>
      <Card className="max-w-2xl mx-auto bg-white/60 dark:bg-white/[0.01] backdrop-blur-3xl border-black/5 dark:border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <CardContent className="p-8 md:p-10 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-serif font-black tracking-tighter">Crypto <em className="italic font-light text-primary">Converter</em></h3>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
              Sync: {lastUpdated}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 rounded-full hover:bg-primary/10"
                onClick={refreshRates}
                disabled={isLoading}
              >
                {isLoading ? "..." : "⟳"}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-[10px] font-black uppercase tracking-widest opacity-40">Evaluation Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount..."
                className="h-14 rounded-2xl border-black/5 dark:border-white/10 bg-muted/30 dark:bg-white/[0.02] text-lg font-bold px-6 focus-visible:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
              <div className="space-y-2">
                <Label htmlFor="from-currency" className="text-[10px] font-black uppercase tracking-widest opacity-40">Source</Label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger id="from-currency" className="h-12 rounded-xl border-black/5 dark:border-white/10 bg-muted/30 dark:bg-white/[0.02] font-bold">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-black/5 dark:border-white/10 backdrop-blur-xl">
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code} className="rounded-lg">
                        <span className="font-mono mr-2 opacity-60">{currency.symbol}</span> {currency.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-center pt-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSwapCurrencies}
                  className="rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  <div className="text-xl">⇄</div>
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="to-currency" className="text-[10px] font-black uppercase tracking-widest opacity-40">Target</Label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger id="to-currency" className="h-12 rounded-xl border-black/5 dark:border-white/10 bg-muted/30 dark:bg-white/[0.02] font-bold">
                    <SelectValue placeholder="Target" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-black/5 dark:border-white/10 backdrop-blur-xl">
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code} className="rounded-lg">
                        <span className="font-mono mr-2 opacity-60">{currency.symbol}</span> {currency.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-black/5 dark:border-white/5">
            <div className="text-center space-y-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-primary italic">Intelligence Output</div>
              <div className="text-5xl font-serif font-black tracking-tighter text-foreground">
                {result || "-"}
              </div>
              <div className="text-sm font-medium text-muted-foreground/60">
                {amount && result
                  ? `${currencies.find(c => c.code === fromCurrency)?.symbol || ''} ${parseFloat(amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })} ${fromCurrency} = ${result} ${toCurrency}`
                  : "Awaiting input for synchronization"}
              </div>
            </div>
          </div>

          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 text-center pt-6">
            Network Protocol: Coingecko & ExchangeRate API • Secure Sandbox
          </div>
        </CardContent>
      </Card>
    </AnimatedElement>
  );
};

export default CryptoConverter;
