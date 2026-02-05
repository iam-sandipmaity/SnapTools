import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import AnimatedElement from "@/components/animated-element";
import { Calendar, Clock, Calculator } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const DateDifferenceCalculator = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [result, setResult] = useState<any>(null);

  const calculateDifference = () => {
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

    // Calculate difference in milliseconds
    const diffTime = Math.abs(end.getTime() - start.getTime());
    
    // Calculate various units
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30.44); // Average month length
    const diffYears = Math.floor(diffDays / 365.25); // Account for leap years
    
    // Calculate remaining days, months, years
    const years = Math.floor(diffDays / 365.25);
    const remainingDaysAfterYears = diffDays - Math.floor(years * 365.25);
    const months = Math.floor(remainingDaysAfterYears / 30.44);
    const days = Math.floor(remainingDaysAfterYears - (months * 30.44));

    // Calculate hours, minutes, seconds
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);

    setResult({
      totalDays: diffDays,
      totalWeeks: diffWeeks,
      totalMonths: diffMonths,
      totalYears: diffYears,
      breakdown: {
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
      },
      isAfter: end > start,
    });

    toast.success("Date difference calculated!");
  };

  const reset = () => {
    setStartDate("");
    setEndDate("");
    setResult(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <AnimatedElement animation="fadeIn">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Date Difference Calculator</h1>
          </div>
          <p className="text-muted-foreground">
            Calculate the difference between two dates in days, weeks, months, and years
          </p>
        </div>
      </AnimatedElement>

      <AnimatedElement animation="slideUp">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Select Dates
            </CardTitle>
            <CardDescription>
              Choose start and end dates to calculate the difference
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

            <div className="flex gap-2">
              <Button onClick={calculateDifference} className="flex-1">
                Calculate Difference
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
                <CardTitle>Total Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800 dark:text-blue-200">Days</AlertTitle>
                    <AlertDescription className="text-blue-700 dark:text-blue-300">
                      <div className="text-2xl font-bold mt-1">{result.totalDays}</div>
                    </AlertDescription>
                  </Alert>

                  <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <Clock className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800 dark:text-green-200">Weeks</AlertTitle>
                    <AlertDescription className="text-green-700 dark:text-green-300">
                      <div className="text-2xl font-bold mt-1">{result.totalWeeks}</div>
                    </AlertDescription>
                  </Alert>

                  <Alert className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <AlertTitle className="text-purple-800 dark:text-purple-200">Months</AlertTitle>
                    <AlertDescription className="text-purple-700 dark:text-purple-300">
                      <div className="text-2xl font-bold mt-1">{result.totalMonths}</div>
                    </AlertDescription>
                  </Alert>

                  <Alert className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <AlertTitle className="text-orange-800 dark:text-orange-200">Years</AlertTitle>
                    <AlertDescription className="text-orange-700 dark:text-orange-300">
                      <div className="text-2xl font-bold mt-1">{result.totalYears}</div>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </AnimatedElement>

          <AnimatedElement animation="slideUp" delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle>Detailed Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="bg-primary/10 border-primary/20">
                  <Calendar className="h-4 w-4" />
                  <AlertTitle>Time Difference</AlertTitle>
                  <AlertDescription>
                    <div className="text-lg font-bold mt-2">
                      {result.breakdown.years > 0 && `${result.breakdown.years} year${result.breakdown.years !== 1 ? 's' : ''} `}
                      {result.breakdown.months > 0 && `${result.breakdown.months} month${result.breakdown.months !== 1 ? 's' : ''} `}
                      {result.breakdown.days > 0 && `${result.breakdown.days} day${result.breakdown.days !== 1 ? 's' : ''}`}
                    </div>
                    {(result.breakdown.hours > 0 || result.breakdown.minutes > 0 || result.breakdown.seconds > 0) && (
                      <div className="text-sm mt-1">
                        {result.breakdown.hours}h {result.breakdown.minutes}m {result.breakdown.seconds}s
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </AnimatedElement>
        </>
      )}

      <AnimatedElement animation="fadeIn" delay={0.3}>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>About Date Difference Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              This free online date difference calculator helps you find the exact difference between two dates.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Calculate difference in days, weeks, months, and years</li>
              <li>Get detailed breakdown with hours, minutes, and seconds</li>
              <li>Perfect for age calculation, project planning, and event countdown</li>
              <li>Accurate calculations accounting for leap years</li>
            </ul>
          </CardContent>
        </Card>
      </AnimatedElement>
    </div>
  );
};

export default DateDifferenceCalculator;
