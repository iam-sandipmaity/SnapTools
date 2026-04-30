import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Trash2, Clock, CheckCircle2, XCircle, Calendar, RotateCw } from 'lucide-react';
import { toast } from 'sonner';

interface CronPart {
  label: string;
  expression: string;
  description: string;
  examples: string[];
}

const CronExpressionBuilder = () => {
  const [minute, setMinute] = useState<string>('*');
  const [hour, setHour] = useState<string>('*');
  const [dayOfMonth, setDayOfMonth] = useState<string>('*');
  const [month, setMonth] = useState<string>('*');
  const [dayOfWeek, setDayOfWeek] = useState<string>('*');
  const [activeTab, setActiveTab] = useState<string>('builder');
  const [humanReadable, setHumanReadable] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Presets for common cron expressions
  const presets = [
    { name: 'Every Minute', expression: '* * * * *', description: 'Runs every minute' },
    { name: 'Every 5 Minutes', expression: '*/5 * * * *', description: 'Runs every 5 minutes' },
    { name: 'Hourly', expression: '0 * * * *', description: 'Runs at minute 0 of every hour' },
    { name: 'Daily (Midnight)', expression: '0 0 * * *', description: 'Runs at 12:00 AM every day' },
    { name: 'Daily (9 AM)', expression: '0 9 * * *', description: 'Runs at 9:00 AM every day' },
    { name: 'Weekly (Monday)', expression: '0 0 * * 1', description: 'Runs at midnight every Monday' },
    { name: 'Monthly (1st)', expression: '0 0 1 * *', description: 'Runs at midnight on the 1st of every month' },
    { name: 'Yearly (Jan 1)', expression: '0 0 1 1 *', description: 'Runs at midnight on January 1st' },
    { name: 'Every 6 Hours', expression: '0 */6 * * *', description: 'Runs every 6 hours' },
    { name: 'Weekdays Only', expression: '0 9-17 * * 1-5', description: 'Runs hourly 9AM-5PM on weekdays' },
  ];

  // Quick select options
  const minuteOptions = [
    { label: 'Every minute (*)', value: '*' },
    { label: 'Every 5 minutes (*/5)', value: '*/5' },
    { label: 'Every 15 minutes (*/15)', value: '*/15' },
    { label: 'Every 30 minutes (*/30)', value: '*/30' },
    { label: 'At minute 0 (0)', value: '0' },
    { label: 'At minute 30 (30)', value: '30' },
  ];

  const hourOptions = [
    { label: 'Every hour (*)', value: '*' },
    { label: 'Every 6 hours (*/6)', value: '*/6' },
    { label: 'Every 12 hours (*/12)', value: '*/12' },
    { label: '9 AM - 5 PM (9-17)', value: '9-17' },
    { label: 'Midnight (0)', value: '0' },
    { label: 'Noon (12)', value: '12' },
  ];

  const dayOfWeekOptions = [
    { label: 'Every day (*)', value: '*' },
    { label: 'Weekdays (1-5)', value: '1-5' },
    { label: 'Weekends (0,6)', value: '0,6' },
    { label: 'Monday (1)', value: '1' },
    { label: 'Sunday (0)', value: '0' },
  ];

  // Build cron expression
  const cronExpression = useMemo(() => {
    return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
  }, [minute, hour, dayOfMonth, month, dayOfWeek]);

  // Validate cron expression
  const validateCron = (expr: string): { valid: boolean; error?: string } => {
    const parts = expr.split(' ');
    if (parts.length !== 5) {
      return { valid: false, error: 'Expression must have exactly 5 fields' };
    }

    const [min, hr, dom, mon, dow] = parts;

    // Basic validation (simplified)
    const validMin = min === '*' || /^\d+$|^\*\/\d+$|^[\d,\-]+$/.test(min);
    const validHr = hr === '*' || /^\d+$|^\*\/\d+$|^[\d,\-]+$/.test(hr);
    const validDom = dom === '*' || /^\d+$|^\*\/\d+$|^[\d,\-]+$/.test(dom);
    const validMon = mon === '*' || /^\d+$|^\*\/\d+$|^[\d,\-]+$/.test(mon);
    const validDow = dow === '*' || /^\d+$|^[\d,\-]+$/.test(dow);

    if (!validMin || !validHr || !validDom || !validMon || !validDow) {
      return { valid: false, error: 'Invalid cron syntax' };
    }

    return { valid: true };
  };

  // Generate human readable description
  const generateHumanReadable = () => {
    const validation = validateCron(cronExpression);
    setIsValid(validation.valid);
    setError(validation.error || '');

    if (!validation.valid) return;

    let description = 'Runs ';

    // Minute
    if (minute === '*') {
      description += 'every minute';
    } else if (minute.startsWith('*/')) {
      description += `every ${minute.slice(2)} minutes`;
    } else {
      description += `at minute ${minute}`;
    }

    // Hour
    if (hour === '*') {
      description += ' of every hour';
    } else if (hour.startsWith('*/')) {
      description += `, every ${hour.slice(2)} hours`;
    } else if (hour.includes('-')) {
      description += `, ${hour.split('-')[0]}:00 to ${hour.split('-')[1]}:59`;
    } else {
      description += `, at ${hour}:00`;
    }

    // Day of month
    if (dayOfMonth !== '*') {
      description += `, on day ${dayOfMonth}`;
    }

    // Month
    if (month !== '*') {
      const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      if (month.includes(',')) {
        const months = month.split(',').map(m => monthNames[parseInt(m)]);
        description += `, in ${months.join(', ')}`;
      } else if (month.startsWith('*/')) {
        description += `, every ${month.slice(2)} months`;
      } else {
        description += `, in ${monthNames[parseInt(month)] || month}`;
      }
    }

    // Day of week
    if (dayOfWeek !== '*') {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      if (dayOfWeek.includes(',')) {
        const days = dayOfWeek.split(',').map(d => dayNames[parseInt(d)]);
        description += `, on ${days.join(', ')}`;
      } else if (dayOfWeek.includes('-')) {
        const [start, end] = dayOfWeek.split('-').map(d => dayNames[parseInt(d)]);
        description += `, ${start} through ${end}`;
      } else {
        description += `, on ${dayNames[parseInt(dayOfWeek)] || dayOfWeek}`;
      }
    }

    setHumanReadable(description);
  };

  // Update human readable on changes
  useMemo(() => {
    generateHumanReadable();
  }, [cronExpression]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cronExpression);
    toast.success('Cron expression copied!');
  };

  const loadPreset = (expression: string) => {
    const parts = expression.split(' ');
    setMinute(parts[0]);
    setHour(parts[1]);
    setDayOfMonth(parts[2]);
    setMonth(parts[3]);
    setDayOfWeek(parts[4]);
  };

  const clearAll = () => {
    setMinute('*');
    setHour('*');
    setDayOfMonth('*');
    setMonth('*');
    setDayOfWeek('*');
  };

  const testExpression = () => {
    const validation = validateCron(cronExpression);
    if (validation.valid) {
      toast.success('Cron expression is valid!');
    } else {
      toast.error(validation.error || 'Invalid expression');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Cron Expression Builder - Professional Grade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Presets */}
          <div className="space-y-2">
            <Label>Quick Presets</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  onClick={() => loadPreset(preset.expression)}
                  className="justify-start text-left h-auto p-2"
                >
                  <div>
                    <div className="font-semibold text-xs">{preset.name}</div>
                    <div className="text-xs text-muted-foreground">{preset.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="builder">Visual Builder</TabsTrigger>
              <TabsTrigger value="manual">Manual Input</TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="space-y-4 mt-4">
              {/* Minute Selector */}
              <div className="space-y-2">
                <Label>Minute (0-59)</Label>
                <div className="flex gap-2 flex-wrap">
                  {minuteOptions.map((opt) => (
                    <Badge
                      key={opt.value}
                      variant={minute === opt.value ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setMinute(opt.value)}
                    >
                      {opt.label}
                    </Badge>
                  ))}
                </div>
                <Input
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  placeholder="Custom minute expression..."
                  className="font-mono"
                />
              </div>

              {/* Hour Selector */}
              <div className="space-y-2">
                <Label>Hour (0-23)</Label>
                <div className="flex gap-2 flex-wrap">
                  {hourOptions.map((opt) => (
                    <Badge
                      key={opt.value}
                      variant={hour === opt.value ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setHour(opt.value)}
                    >
                      {opt.label}
                    </Badge>
                  ))}
                </div>
                <Input
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  placeholder="Custom hour expression..."
                  className="font-mono"
                />
              </div>

              {/* Day of Week Selector */}
              <div className="space-y-2">
                <Label>Day of Week (0-7, where 0 and 7 are Sunday)</Label>
                <div className="flex gap-2 flex-wrap">
                  {dayOfWeekOptions.map((opt) => (
                    <Badge
                      key={opt.value}
                      variant={dayOfWeek === opt.value ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setDayOfWeek(opt.value)}
                    >
                      {opt.label}
                    </Badge>
                  ))}
                </div>
                <Input
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  placeholder="Custom day of week expression..."
                  className="font-mono"
                />
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4 mt-4">
              <div className="grid grid-cols-5 gap-2">
                {['Minute', 'Hour', 'Day', 'Month', 'Weekday'].map((label, idx) => (
                  <div key={idx} className="space-y-1">
                    <Label className="text-xs">{label}</Label>
                    <Input
                      value={[minute, hour, dayOfMonth, month, dayOfWeek][idx]}
                      onChange={(e) => {
                        const setters = [setMinute, setHour, setDayOfMonth, setMonth, setDayOfWeek];
                        setters[idx](e.target.value);
                      }}
                      className="font-mono text-center text-sm"
                      placeholder="*"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Current Expression Display */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <Label>Cron Expression</Label>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={testExpression}>
                  <CheckCircle2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <code className="block text-lg font-mono font-bold break-all">
              {cronExpression}
            </code>
            {!isValid && error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Human Readable */}
          {humanReadable && isValid && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>Meaning:</strong> {humanReadable}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={copyToClipboard} className="flex-1">
              <Copy className="mr-2 h-4 w-4" />
              Copy Expression
            </Button>
            <Button variant="outline" onClick={clearAll}>
              <Trash2 className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reference Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Cron Syntax Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div className="p-2 bg-muted rounded">
              <code>*</code> - Any value
            </div>
            <div className="p-2 bg-muted rounded">
              <code>,</code> - Value list separator
            </div>
            <div className="p-2 bg-muted rounded">
              <code>-</code> - Range of values
            </div>
            <div className="p-2 bg-muted rounded">
              <code>/</code> - Step values
            </div>
            <div className="p-2 bg-muted rounded">
              <code>1-5</code> - Range (1 through 5)
            </div>
            <div className="p-2 bg-muted rounded">
              <code>*/15</code> - Every 15 units
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground space-y-1">
            <p><strong>Format:</strong> minute hour day-of-month month day-of-week</p>
            <p><strong>Example:</strong> <code>0 9-17 * * 1-5</code> = 9AM-5PM on weekdays</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CronExpressionBuilder;
