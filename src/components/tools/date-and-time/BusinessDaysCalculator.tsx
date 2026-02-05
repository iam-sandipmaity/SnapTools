import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import AnimatedElement from "@/components/animated-element";
import { Calendar, Briefcase, Calculator } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from "@/components/ui/checkbox";

const BusinessDaysCalculator = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeStartDate, setIncludeStartDate] = useState(true);
  const [includeEndDate, setIncludeEndDate] = useState(true);
  const [result, setResult] = useState<any>(null);

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  const calculateBusinessDays = () => {
    if (!startDate || !endDate) {
      toast.error("Please select both dates");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      toast.error("Invalid date format");
      return;
    }

    if (start > end) {
      toast.error("Start date must be before end date");
      return;
    }

    let businessDays = 0;
    let weekendDays = 0;
    let totalDays = 0;
    
    const current = new Date(start);
    const adjustedStart = includeStartDate ? new Date(start) : new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const adjustedEnd = includeEndDate ? new Date(end) : new Date(end.getTime() - 24 * 60 * 60 * 1000);

    // Count days
    const startTime = adjustedStart.getTime();
    const endTime = adjustedEnd.getTime();
    totalDays = Math.floor((endTime - startTime) / (1000 * 60 * 60 * 24)) + 1;

    // Count business days
    const tempDate = new Date(adjustedStart);
    while (tempDate <= adjustedEnd) {
      if (isWeekend(tempDate)) {
        weekendDays++;
      } else {
        businessDays++;
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }

    setResult({
      businessDays,
      weekendDays,
      totalDays,
      startDate: adjustedStart.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      endDate: adjustedEnd.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
    });

    toast.success("Business days calculated!");
  };

  const reset = () => {
    setStartDate("");
    setEndDate("");
    setResult(null);
    setIncludeStartDate(true);
    setIncludeEndDate(true);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <AnimatedElement animation="fadeIn">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Briefcase className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Business Days Calculator</h1>
          </div>
          <p className="text-muted-foreground">
            Calculate working days between dates excluding weekends
          </p>
        </div>
      </AnimatedElement>

      <AnimatedElement animation="slideUp">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Select Date Range
            </CardTitle>
            <CardDescription>
              Choose start and end dates to calculate business days
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeStart"
                  checked={includeStartDate}
                  onCheckedChange={(checked) => setIncludeStartDate(!!checked)}
                />
                <Label htmlFor="includeStart" className="cursor-pointer">
                  Include start date in calculation
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeEnd"
                  checked={includeEndDate}
                  onCheckedChange={(checked) => setIncludeEndDate(!!checked)}
                />
                <Label htmlFor="includeEnd" className="cursor-pointer">
                  Include end date in calculation
                </Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={calculateBusinessDays} className="flex-1">
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
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <Briefcase className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800 dark:text-green-200">Business Days</AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    <div className="text-3xl font-bold mt-1">{result.businessDays}</div>
                  </AlertDescription>
                </Alert>

                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800 dark:text-blue-200">Weekend Days</AlertTitle>
                  <AlertDescription className="text-blue-700 dark:text-blue-300">
                    <div className="text-3xl font-bold mt-1">{result.weekendDays}</div>
                  </AlertDescription>
                </Alert>

                <Alert className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <AlertTitle className="text-purple-800 dark:text-purple-200">Total Days</AlertTitle>
                  <AlertDescription className="text-purple-700 dark:text-purple-300">
                    <div className="text-3xl font-bold mt-1">{result.totalDays}</div>
                  </AlertDescription>
                </Alert>
              </div>

              <Alert className="bg-muted">
                <Calendar className="h-4 w-4" />
                <AlertTitle>Date Range</AlertTitle>
                <AlertDescription>
                  <div className="space-y-1 mt-2 text-sm">
                    <div><strong>From:</strong> {result.startDate}</div>
                    <div><strong>To:</strong> {result.endDate}</div>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </AnimatedElement>
      )}

      <AnimatedElement animation="fadeIn" delay={0.2}>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>About Business Days Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              This free online business days calculator helps you count working days between dates.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Automatically excludes weekends (Saturday and Sunday)</li>
              <li>Option to include or exclude start/end dates</li>
              <li>Shows total days, business days, and weekend days</li>
              <li>Perfect for project planning, delivery estimates, and deadline calculations</li>
            </ul>
          </CardContent>
        </Card>
      </AnimatedElement>
    </div>
  );
};

export default BusinessDaysCalculator;
