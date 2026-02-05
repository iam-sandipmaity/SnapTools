import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import AnimatedElement from "@/components/animated-element";
import { DollarSign, Users, Percent, Plus, Trash2, User, Receipt, Calculator } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BillItem {
  id: number;
  name: string;
  price: number;
  sharedBy: number[];
}

interface Person {
  id: number;
  name: string;
}

const BillSplitter = () => {
  const [currency, setCurrency] = useState("INR");
  const [splitMode, setSplitMode] = useState<"equal" | "items">("equal");
  
  const currencySymbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  // People
  const [people, setPeople] = useState<Person[]>([
    { id: 1, name: "Person 1" },
    { id: 2, name: "Person 2" },
  ]);
  const [newPersonName, setNewPersonName] = useState("");

  // Bill items
  const [items, setItems] = useState<BillItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  // Tax and tip
  const [taxPercent, setTaxPercent] = useState<number[]>([10]);
  const [tipPercent, setTipPercent] = useState<number[]>([15]);

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const taxAmount = (subtotal * taxPercent[0]) / 100;
  const tipAmount = ((subtotal + taxAmount) * tipPercent[0]) / 100;
  const total = subtotal + taxAmount + tipAmount;

  // Add person
  const addPerson = () => {
    if (newPersonName.trim()) {
      const newPerson: Person = {
        id: Date.now(),
        name: newPersonName.trim(),
      };
      setPeople([...people, newPerson]);
      setNewPersonName("");
      toast.success(`${newPersonName} added`);
    } else {
      toast.error("Please enter a name");
    }
  };

  // Remove person
  const removePerson = (id: number) => {
    if (people.length <= 1) {
      toast.error("You need at least one person");
      return;
    }
    setPeople(people.filter((p) => p.id !== id));
    // Remove person from all items
    setItems(items.map(item => ({
      ...item,
      sharedBy: item.sharedBy.filter(personId => personId !== id)
    })));
    toast.success("Person removed");
  };

  // Add item
  const addItem = () => {
    if (!newItemName.trim()) {
      toast.error("Please enter item name");
      return;
    }
    if (!newItemPrice || parseFloat(newItemPrice) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const newItem: BillItem = {
      id: Date.now(),
      name: newItemName.trim(),
      price: parseFloat(newItemPrice),
      sharedBy: splitMode === "equal" ? people.map(p => p.id) : [],
    };
    setItems([...items, newItem]);
    setNewItemName("");
    setNewItemPrice("");
    toast.success("Item added");
  };

  // Remove item
  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
    toast.success("Item removed");
  };

  // Toggle person for item
  const togglePersonForItem = (itemId: number, personId: number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const isShared = item.sharedBy.includes(personId);
        return {
          ...item,
          sharedBy: isShared
            ? item.sharedBy.filter(id => id !== personId)
            : [...item.sharedBy, personId]
        };
      }
      return item;
    }));
  };

  // Calculate individual amounts
  const calculateIndividualAmounts = () => {
    const amounts: Record<number, number> = {};
    people.forEach(person => {
      amounts[person.id] = 0;
    });

    if (splitMode === "equal") {
      // Split everything equally
      const perPerson = total / people.length;
      people.forEach(person => {
        amounts[person.id] = perPerson;
      });
    } else {
      // Calculate based on items
      items.forEach(item => {
        if (item.sharedBy.length > 0) {
          const itemCost = item.price / item.sharedBy.length;
          item.sharedBy.forEach(personId => {
            amounts[personId] = (amounts[personId] || 0) + itemCost;
          });
        }
      });

      // Add proportional tax and tip
      const subtotalPersonal: Record<number, number> = { ...amounts };
      const totalSubtotalShared = Object.values(subtotalPersonal).reduce((sum, val) => sum + val, 0);
      
      if (totalSubtotalShared > 0) {
        people.forEach(person => {
          const proportion = subtotalPersonal[person.id] / totalSubtotalShared;
          const personTax = taxAmount * proportion;
          const personTip = tipAmount * proportion;
          amounts[person.id] = subtotalPersonal[person.id] + personTax + personTip;
        });
      }
    }

    return amounts;
  };

  const individualAmounts = calculateIndividualAmounts();

  // Reset all
  const reset = () => {
    setItems([]);
    setPeople([
      { id: 1, name: "Person 1" },
      { id: 2, name: "Person 2" },
    ]);
    setNewItemName("");
    setNewItemPrice("");
    setTaxPercent([10]);
    setTipPercent([15]);
    toast.success("Reset complete");
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <AnimatedElement animation="fadeIn">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Receipt className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Bill Splitter</h1>
          </div>
          <p className="text-muted-foreground">
            Split bills with friends - track items, tax, tips, and calculate fair shares
          </p>
        </div>
      </AnimatedElement>

      {/* Currency and Split Mode */}
      <AnimatedElement animation="slideUp">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="splitMode">Split Mode</Label>
                <Select value={splitMode} onValueChange={(value: any) => setSplitMode(value)}>
                  <SelectTrigger id="splitMode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equal">Split Equally</SelectItem>
                    <SelectItem value="items">Split by Items</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedElement>

      <Tabs defaultValue="people" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="people">People ({people.length})</TabsTrigger>
          <TabsTrigger value="items">Items ({items.length})</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        {/* People Tab */}
        <TabsContent value="people">
          <AnimatedElement animation="slideUp">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Manage People
                </CardTitle>
                <CardDescription>
                  Add or remove people splitting the bill
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add person */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter name"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addPerson()}
                  />
                  <Button onClick={addPerson}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                {/* People list */}
                <div className="space-y-2">
                  {people.map((person) => (
                    <div
                      key={person.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{person.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePerson(person.id)}
                        disabled={people.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedElement>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items">
          <AnimatedElement animation="slideUp">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Bill Items
                </CardTitle>
                <CardDescription>
                  Add items and assign who shares each one
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add item */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input
                    placeholder="Item name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="md:col-span-2"
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addItem()}
                    />
                    <Button onClick={addItem}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Items list */}
                <div className="space-y-3">
                  {items.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No items added yet. Add items to start splitting!
                    </p>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <div className="text-2xl font-bold text-primary">
                              {currencySymbols[currency]}{item.price.toFixed(2)}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        {splitMode === "items" && (
                          <div>
                            <Label className="text-sm text-muted-foreground mb-2 block">
                              Shared by:
                            </Label>
                            <div className="flex flex-wrap gap-2">
                              {people.map((person) => (
                                <Button
                                  key={person.id}
                                  variant={
                                    item.sharedBy.includes(person.id)
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    togglePersonForItem(item.id, person.id)
                                  }
                                >
                                  {person.name}
                                </Button>
                              ))}
                            </div>
                            {item.sharedBy.length > 0 && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {currencySymbols[currency]}
                                {(item.price / item.sharedBy.length).toFixed(2)} per person
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Tax and Tip */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Tax</Label>
                      <span className="text-lg font-bold">{taxPercent[0]}%</span>
                    </div>
                    <Slider
                      value={taxPercent}
                      onValueChange={setTaxPercent}
                      min={0}
                      max={30}
                      step={0.5}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Tip</Label>
                      <span className="text-lg font-bold">{tipPercent[0]}%</span>
                    </div>
                    <Slider
                      value={tipPercent}
                      onValueChange={setTipPercent}
                      min={0}
                      max={50}
                      step={1}
                    />
                    <div className="flex gap-2 flex-wrap">
                      {[10, 15, 18, 20, 25].map((percent) => (
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
                </div>
              </CardContent>
            </Card>
          </AnimatedElement>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary">
          <AnimatedElement animation="slideUp">
            <div className="space-y-6">
              {/* Total Bill Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Bill Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{currencySymbols[currency]}{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax ({taxPercent[0]}%)</span>
                      <span>{currencySymbols[currency]}{taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tip ({tipPercent[0]}%)</span>
                      <span>{currencySymbols[currency]}{tipAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold pt-2 border-t">
                      <span>Total</span>
                      <span className="text-primary">
                        {currencySymbols[currency]}{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Individual Amounts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Individual Amounts
                  </CardTitle>
                  <CardDescription>
                    {splitMode === "equal"
                      ? "Bill split equally among all people"
                      : "Bill split based on items ordered"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {people.map((person) => (
                      <Alert
                        key={person.id}
                        className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                      >
                        <User className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-800 dark:text-blue-200">
                          {person.name}
                        </AlertTitle>
                        <AlertDescription className="text-blue-700 dark:text-blue-300">
                          <div className="text-2xl font-bold mt-1">
                            {currencySymbols[currency]}
                            {(individualAmounts[person.id] || 0).toFixed(2)}
                          </div>
                          {splitMode === "items" && (
                            <div className="text-xs mt-1">
                              {items.filter(item => item.sharedBy.includes(person.id)).length} items
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reset Button */}
              <div className="flex justify-center">
                <Button onClick={reset} variant="outline" size="lg">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset All
                </Button>
              </div>
            </div>
          </AnimatedElement>
        </TabsContent>
      </Tabs>

      {/* Info Section */}
      <AnimatedElement animation="fadeIn" delay={0.2}>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>About Bill Splitter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              This free online bill splitter helps you split bills fairly with friends and family.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Split Equally:</strong> Divide the total bill evenly among everyone</li>
              <li><strong>Split by Items:</strong> Track who ordered what and split accordingly</li>
              <li><strong>Tax & Tip:</strong> Automatically calculate and distribute tax and tip proportionally</li>
              <li><strong>Multiple Currencies:</strong> Support for INR, USD, EUR, GBP, and JPY</li>
              <li>Perfect for restaurants, group dinners, parties, and shared expenses</li>
            </ul>
          </CardContent>
        </Card>
      </AnimatedElement>
    </div>
  );
};

export default BillSplitter;
