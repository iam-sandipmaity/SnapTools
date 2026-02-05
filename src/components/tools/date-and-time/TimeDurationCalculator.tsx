import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import AnimatedElement from "@/components/animated-element";
import { Clock, Plus, Minus, Calculator } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const TimeDurationCalculator = () => {
  // Add/Subtract Time
  const [startTime, setStartTime] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [operation, setOperation] = useState<"add" | "subtract">("add");
  const [resultTime, setResultTime] = useState<string | null>(null);

  // Calculate Duration
  const [time1, setTime1] = useState("");
  const [time2, setTime2] = useState("");
  const [duration, setDuration] = useState<any>(null);

  const calculateTime = () => {
    if (!startTime) {
      toast.error("Please enter a start time");
      return;
    }

    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;

    if (h === 0 && m === 0 && s === 0) {
      toast.error("Please enter at least one time value");
      return;
    }

    // Parse start time
    const [startH, startM] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(startH, startM, 0, 0);

    // Calculate milliseconds to add/subtract
    const totalMs = (h * 3600 + m * 60 + s) * 1000;

    // Add or subtract
    const resultDate = new Date(
      operation === "add" 
        ? startDate.getTime() + totalMs 
        : startDate.getTime() - totalMs
    );

    // Format result
    const resultH = String(resultDate.getHours()).padStart(2, '0');
    const resultM = String(resultDate.getMinutes()).padStart(2, '0');
    const resultS = String(resultDate.getSeconds()).padStart(2, '0');

    setResultTime(`${resultH}:${resultM}:${resultS}`);
    toast.success("Time calculated!");
  };

  const calculateDuration = () => {
    if (!time1 || !time2) {
      toast.error("Please enter both times");
      return;
    }

    const [h1, m1, s1 = 0] = time1.split(':').map(Number);
    const [h2, m2, s2 = 0] = time2.split(':').map(Number);

    const date1 = new Date();
    date1.setHours(h1, m1, s1 || 0, 0);

    const date2 = new Date();
    date2.setHours(h2, m2, s2 || 0, 0);

    // If time2 is earlier than time1, assume it's next day
    if (date2 < date1) {
      date2.setDate(date2.getDate() + 1);
    }

    const diffMs = Math.abs(date2.getTime() - date1.getTime());

    const totalSeconds = Math.floor(diffMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);

    const h = Math.floor(totalHours);
    const m = Math.floor(totalMinutes % 60);
    const s = Math.floor(totalSeconds % 60);

    setDuration({
      hours: h,
      minutes: m,
      seconds: s,
      totalHours: totalHours,
      totalMinutes: totalMinutes,
      totalSeconds: totalSeconds,
    });

    toast.success("Duration calculated!");
  };

  const resetAddSubtract = () => {
    setStartTime("");
    setHours("");
    setMinutes("");
    setSeconds("");
    setResultTime(null);
  };

  const resetDuration = () => {
    setTime1("");
    setTime2("");
    setDuration(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <AnimatedElement animation="fadeIn">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Time Duration Calculator</h1>
          </div>
          <p className="text-muted-foreground">
            Add, subtract, and calculate time durations
          </p>
        </div>
      </AnimatedElement>

      <Tabs defaultValue="add-subtract" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add-subtract">Add/Subtract Time</TabsTrigger>
          <TabsTrigger value="duration">Calculate Duration</TabsTrigger>
        </TabsList>

        {/* Add/Subtract Time Tab */}
        <TabsContent value="add-subtract">
          <AnimatedElement animation="slideUp">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Add or Subtract Time
                </CardTitle>
                <CardDescription>
                  Add or subtract hours, minutes, and seconds from a time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={operation === "add" ? "default" : "outline"}
                    onClick={() => setOperation("add")}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                  <Button
                    variant={operation === "subtract" ? "default" : "outline"}
                    onClick={() => setOperation("subtract")}
                    className="flex items-center gap-2"
                  >
                    <Minus className="h-4 w-4" />
                    Subtract
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hours">Hours</Label>
                    <Input
                      id="hours"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minutes">Minutes</Label>
                    <Input
                      id="minutes"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={minutes}
                      onChange={(e) => setMinutes(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seconds">Seconds</Label>
                    <Input
                      id="seconds"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={seconds}
                      onChange={(e) => setSeconds(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={calculateTime} className="flex-1">
                    Calculate
                  </Button>
                  <Button onClick={resetAddSubtract} variant="outline">
                    Reset
                  </Button>
                </div>

                {resultTime && (
                  <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <Clock className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800 dark:text-green-200">Result</AlertTitle>
                    <AlertDescription className="text-green-700 dark:text-green-300">
                      <div className="text-3xl font-bold mt-2">{resultTime}</div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </AnimatedElement>
        </TabsContent>

        {/* Calculate Duration Tab */}
        <TabsContent value="duration">
          <AnimatedElement animation="slideUp">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calculate Time Duration
                </CardTitle>
                <CardDescription>
                  Find the duration between two times
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time1">Start Time</Label>
                    <Input
                      id="time1"
                      type="time"
                      step="1"
                      value={time1}
                      onChange={(e) => setTime1(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time2">End Time</Label>
                    <Input
                      id="time2"
                      type="time"
                      step="1"
                      value={time2}
                      onChange={(e) => setTime2(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={calculateDuration} className="flex-1">
                    Calculate Duration
                  </Button>
                  <Button onClick={resetDuration} variant="outline">
                    Reset
                  </Button>
                </div>

                {duration && (
                  <div className="space-y-4">
                    <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-800 dark:text-blue-200">Duration</AlertTitle>
                      <AlertDescription className="text-blue-700 dark:text-blue-300">
                        <div className="text-3xl font-bold mt-2">
                          {duration.hours}h {duration.minutes}m {duration.seconds}s
                        </div>
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                        <Clock className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800 dark:text-green-200">Total Hours</AlertTitle>
                        <AlertDescription className="text-green-700 dark:text-green-300">
                          <div className="text-2xl font-bold mt-1">{duration.totalHours}</div>
                        </AlertDescription>
                      </Alert>

                      <Alert className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <AlertTitle className="text-purple-800 dark:text-purple-200">Total Minutes</AlertTitle>
                        <AlertDescription className="text-purple-700 dark:text-purple-300">
                          <div className="text-2xl font-bold mt-1">{duration.totalMinutes}</div>
                        </AlertDescription>
                      </Alert>

                      <Alert className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <AlertTitle className="text-orange-800 dark:text-orange-200">Total Seconds</AlertTitle>
                        <AlertDescription className="text-orange-700 dark:text-orange-300">
                          <div className="text-2xl font-bold mt-1">{duration.totalSeconds}</div>
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
            <CardTitle>About Time Duration Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              This free online time duration calculator helps you work with time values.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Add or subtract hours, minutes, and seconds from any time</li>
              <li>Calculate duration between two times</li>
              <li>Get results in hours, minutes, and seconds</li>
              <li>Perfect for time tracking, scheduling, and time management</li>
            </ul>
          </CardContent>
        </Card>
      </AnimatedElement>
    </div>
  );
};

export default TimeDurationCalculator;
