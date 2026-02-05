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

const DateFormatter = () => {
  const [inputDate, setInputDate] = useState("");
  const [customFormat, setCustomFormat] = useState("YYYY-MM-DD");
  const [formats, setFormats] = useState<any>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const dateFormats = [
    { label: "ISO 8601", value: "iso", example: "2024-01-15T10:30:00.000Z" },
    { label: "Date Only (YYYY-MM-DD)", value: "date", example: "2024-01-15" },
    { label: "US Format (MM/DD/YYYY)", value: "us", example: "01/15/2024" },
    { label: "European Format (DD/MM/YYYY)", value: "eu", example: "15/01/2024" },
    { label: "Long Format", value: "long", example: "January 15, 2024" },
    { label: "Full Format", value: "full", example: "Monday, January 15, 2024" },
    { label: "Time 24h", value: "time24", example: "14:30:00" },
    { label: "Time 12h", value: "time12", example: "2:30:00 PM" },
    { label: "DateTime 24h", value: "datetime24", example: "2024-01-15 14:30:00" },
    { label: "DateTime 12h", value: "datetime12", example: "01/15/2024 2:30:00 PM" },
    { label: "RFC 2822", value: "rfc2822", example: "Mon, 15 Jan 2024 14:30:00 +0000" },
    { label: "Unix Timestamp", value: "unix", example: "1705327800" },
    { label: "Milliseconds", value: "ms", example: "1705327800000" },
  ];

  const formatDate = () => {
    if (!inputDate) {
      toast.error("Please select a date");
      return;
    }

    const date = new Date(inputDate);
    
    if (isNaN(date.getTime())) {
      toast.error("Invalid date");
      return;
    }

    const formatted: any = {};

    // ISO 8601
    formatted.iso = date.toISOString();

    // Date only
    formatted.date = date.toISOString().split('T')[0];

    // US Format
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    formatted.us = `${month}/${day}/${year}`;

    // European Format
    formatted.eu = `${day}/${month}/${year}`;

    // Long Format
    formatted.long = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Full Format
    formatted.full = date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Time 24h
    formatted.time24 = date.toTimeString().split(' ')[0];

    // Time 12h
    formatted.time12 = date.toLocaleTimeString('en-US');

    // DateTime 24h
    formatted.datetime24 = `${formatted.date} ${formatted.time24}`;

    // DateTime 12h
    formatted.datetime12 = `${formatted.us} ${formatted.time12}`;

    // RFC 2822
    formatted.rfc2822 = date.toUTCString();

    // Unix Timestamp (seconds)
    formatted.unix = Math.floor(date.getTime() / 1000);

    // Milliseconds
    formatted.ms = date.getTime();

    setFormats(formatted);
    toast.success("Date formatted successfully!");
  };

  const copyToClipboard = (text: string, formatName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatName);
    toast.success(`${formatName} copied!`);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const reset = () => {
    setInputDate("");
    setFormats(null);
    setCopiedFormat(null);
  };

  const setToNow = () => {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setInputDate(localDate);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <AnimatedElement animation="fadeIn">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Date Formatter</h1>
          </div>
          <p className="text-muted-foreground">
            Convert dates to different formats like ISO 8601, US, European, and more
          </p>
        </div>
      </AnimatedElement>

      <AnimatedElement animation="slideUp">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Input Date & Time
            </CardTitle>
            <CardDescription>
              Select or enter a date and time to format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inputDate">Date and Time</Label>
              <Input
                id="inputDate"
                type="datetime-local"
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={formatDate} className="flex-1">
                Format Date
              </Button>
              <Button onClick={setToNow} variant="outline">
                Now
              </Button>
              <Button onClick={reset} variant="outline">
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </AnimatedElement>

      {formats && (
        <AnimatedElement animation="slideUp" delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>Formatted Outputs</CardTitle>
              <CardDescription>
                Click any format to copy to clipboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dateFormats.map((format) => (
                  <div
                    key={format.value}
                    className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => copyToClipboard(String(formats[format.value]), format.label)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Label className="font-semibold">{format.label}</Label>
                      {copiedFormat === format.label ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="font-mono text-sm bg-muted p-2 rounded">
                      {formats[format.value]}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Example: {format.example}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedElement>
      )}

      <AnimatedElement animation="fadeIn" delay={0.2}>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>About Date Formatter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              This free online date formatter converts dates to various standard and custom formats.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Support for ISO 8601, RFC 2822, and other standard formats</li>
              <li>US, European, and international date formats</li>
              <li>Unix timestamps and milliseconds</li>
              <li>12-hour and 24-hour time formats</li>
              <li>One-click copy to clipboard</li>
            </ul>
          </CardContent>
        </Card>
      </AnimatedElement>
    </div>
  );
};

export default DateFormatter;
