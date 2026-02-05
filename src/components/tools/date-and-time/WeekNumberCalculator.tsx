import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import AnimatedElement from "@/components/animated-element";
import { Calendar, Hash } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const WeekNumberCalculator = () => {
  const [inputDate, setInputDate] = useState("");
  const [result, setResult] = useState<any>(null);

  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
  };

  const getWeeksInYear = (year: number) => {
    const dec31 = new Date(year, 11, 31);
    const weekNumber = getWeekNumber(dec31);
    return weekNumber === 1 ? 52 : weekNumber;
  };

  const getDayOfYear = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  const calculateWeek = () => {
    if (!inputDate) {
      toast.error("Please select a date");
      return;
    }

    const date = new Date(inputDate);
    
    if (isNaN(date.getTime())) {
      toast.error("Invalid date");
      return;
    }

    const weekNumber = getWeekNumber(date);
    const year = date.getFullYear();
    const weeksInYear = getWeeksInYear(year);
    const dayOfYear = getDayOfYear(date);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    
    // Get week start and end dates
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - (date.getDay() || 7) + 1);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    setResult({
      weekNumber,
      year,
      weeksInYear,
      dayOfYear,
      dayOfWeek,
      month,
      weekStart: weekStart.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      weekEnd: weekEnd.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      formattedDate: date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
    });

    toast.success("Week number calculated!");
  };

  const setToToday = () => {
    const today = new Date();
    const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0];
    setInputDate(localDate);
  };

  const reset = () => {
    setInputDate("");
    setResult(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <AnimatedElement animation="fadeIn">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Hash className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Week Number Calculator</h1>
          </div>
          <p className="text-muted-foreground">
            Find the ISO week number for any date
          </p>
        </div>
      </AnimatedElement>

      <AnimatedElement animation="slideUp">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Date
            </CardTitle>
            <CardDescription>
              Choose a date to find its ISO week number
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inputDate">Date</Label>
              <Input
                id="inputDate"
                type="date"
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={calculateWeek} className="flex-1">
                Get Week Number
              </Button>
              <Button onClick={setToToday} variant="outline">
                Today
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
                <CardTitle>Week Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-primary/10 border-primary/20">
                  <Hash className="h-4 w-4" />
                  <AlertTitle>ISO Week Number</AlertTitle>
                  <AlertDescription>
                    <div className="text-4xl font-bold mt-2">Week {result.weekNumber}</div>
                    <div className="text-lg mt-1">{result.year}</div>
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800 dark:text-blue-200">Day of Year</AlertTitle>
                    <AlertDescription className="text-blue-700 dark:text-blue-300">
                      <div className="text-2xl font-bold mt-1">Day {result.dayOfYear}</div>
                    </AlertDescription>
                  </Alert>

                  <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800 dark:text-green-200">Day of Week</AlertTitle>
                    <AlertDescription className="text-green-700 dark:text-green-300">
                      <div className="text-2xl font-bold mt-1">{result.dayOfWeek}</div>
                    </AlertDescription>
                  </Alert>

                  <Alert className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <AlertTitle className="text-purple-800 dark:text-purple-200">Weeks in {result.year}</AlertTitle>
                    <AlertDescription className="text-purple-700 dark:text-purple-300">
                      <div className="text-2xl font-bold mt-1">{result.weeksInYear} weeks</div>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </AnimatedElement>

          <AnimatedElement animation="slideUp" delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle>Date Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert className="bg-muted">
                  <Calendar className="h-4 w-4" />
                  <AlertTitle>Selected Date</AlertTitle>
                  <AlertDescription>
                    <div className="text-lg font-semibold mt-1">{result.formattedDate}</div>
                  </AlertDescription>
                </Alert>

                <Alert className="bg-muted">
                  <Calendar className="h-4 w-4" />
                  <AlertTitle>Week Range</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-1 mt-2 text-sm">
                      <div><strong>Start:</strong> {result.weekStart}</div>
                      <div><strong>End:</strong> {result.weekEnd}</div>
                    </div>
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
            <CardTitle>About ISO Week Numbers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              This calculator uses the ISO 8601 standard for week numbering.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>ISO Week Date System:</strong> Weeks start on Monday and end on Sunday</li>
              <li><strong>Week 1:</strong> The first week with at least 4 days in the new year</li>
              <li><strong>Week Numbers:</strong> Range from 1 to 52 or 53 depending on the year</li>
              <li>Perfect for business planning, project scheduling, and calendar systems</li>
              <li>Widely used in Europe, Asia, and international standards</li>
            </ul>
          </CardContent>
        </Card>
      </AnimatedElement>
    </div>
  );
};

export default WeekNumberCalculator;
