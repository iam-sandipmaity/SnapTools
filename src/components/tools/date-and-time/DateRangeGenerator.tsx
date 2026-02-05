import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import AnimatedElement from "@/components/animated-element";
import { Calendar, Copy, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DateRangeGenerator = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("daily");
  const [dateFormat, setDateFormat] = useState<"iso" | "us" | "eu">("iso");
  const [dates, setDates] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const generateDates = () => {
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

    const generatedDates: string[] = [];
    const current = new Date(start);

    while (current <= end) {
      generatedDates.push(formatDate(new Date(current), dateFormat));
      
      // Increment based on frequency
      switch (frequency) {
        case "daily":
          current.setDate(current.getDate() + 1);
          break;
        case "weekly":
          current.setDate(current.getDate() + 7);
          break;
        case "monthly":
          current.setMonth(current.getMonth() + 1);
          break;
      }
    }

    if (generatedDates.length > 1000) {
      toast.error("Too many dates (max 1000). Please use a smaller date range.");
      return;
    }

    setDates(generatedDates);
    toast.success(`Generated ${generatedDates.length} dates!`);
  };

  const formatDate = (date: Date, format: string) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    switch (format) {
      case "iso":
        return `${year}-${month}-${day}`;
      case "us":
        return `${month}/${day}/${year}`;
      case "eu":
        return `${day}/${month}/${year}`;
      default:
        return `${year}-${month}-${day}`;
    }
  };

  const copyToClipboard = (format: "list" | "comma" | "json" | "array") => {
    let text = "";
    
    switch (format) {
      case "list":
        text = dates.join("\n");
        break;
      case "comma":
        text = dates.join(", ");
        break;
      case "json":
        text = JSON.stringify(dates, null, 2);
        break;
      case "array":
        text = `[${dates.map(d => `"${d}"`).join(", ")}]`;
        break;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`Copied ${dates.length} dates as ${format}!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setStartDate("");
    setEndDate("");
    setDates([]);
    setCopied(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <AnimatedElement animation="fadeIn">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Date Range Generator</h1>
          </div>
          <p className="text-muted-foreground">
            Generate lists of dates for any period with custom frequency
          </p>
        </div>
      </AnimatedElement>

      <AnimatedElement animation="slideUp">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Configure Date Range
            </CardTitle>
            <CardDescription>
              Set the start and end dates, frequency, and format
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select value={dateFormat} onValueChange={(value: any) => setDateFormat(value)}>
                  <SelectTrigger id="dateFormat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iso">ISO (YYYY-MM-DD)</SelectItem>
                    <SelectItem value="us">US (MM/DD/YYYY)</SelectItem>
                    <SelectItem value="eu">European (DD/MM/YYYY)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={generateDates} className="flex-1">
                Generate Dates
              </Button>
              <Button onClick={reset} variant="outline">
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </AnimatedElement>

      {dates.length > 0 && (
        <>
          <AnimatedElement animation="slideUp" delay={0.1}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Copy As</CardTitle>
                <CardDescription>
                  Choose a format to copy the dates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard("list")}
                    className="flex items-center gap-2"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    Line by Line
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard("comma")}
                    className="flex items-center gap-2"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    Comma Separated
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard("json")}
                    className="flex items-center gap-2"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    JSON
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard("array")}
                    className="flex items-center gap-2"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    Array
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedElement>

          <AnimatedElement animation="slideUp" delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle>Generated Dates ({dates.length})</CardTitle>
                <CardDescription>
                  {frequency.charAt(0).toUpperCase() + frequency.slice(1)} dates from {startDate} to {endDate}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto border rounded-lg p-4 bg-muted/30">
                  <div className="space-y-1 font-mono text-sm">
                    {dates.map((date, index) => (
                      <div key={index} className="hover:bg-accent/50 p-1 rounded">
                        {index + 1}. {date}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedElement>
        </>
      )}

      <AnimatedElement animation="fadeIn" delay={0.3}>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>About Date Range Generator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              This free online date range generator creates lists of dates for any period.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Generate daily, weekly, or monthly date sequences</li>
              <li>Support for ISO, US, and European date formats</li>
              <li>Copy dates in multiple formats (list, comma-separated, JSON, array)</li>
              <li>Perfect for calendars, schedules, and data generation</li>
              <li>Maximum 1000 dates per generation</li>
            </ul>
          </CardContent>
        </Card>
      </AnimatedElement>
    </div>
  );
};

export default DateRangeGenerator;
