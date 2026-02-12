'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Wifi, WifiOff, Download, Upload, Activity, Globe, MapPin, Clock, Gauge,
  Server, TrendingUp, TrendingDown, Minus, Share2, BarChart3, History,
  Settings, Zap, Signal, Info, ChevronDown, ExternalLink, RefreshCw
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import AnimatedElement from '@/components/animated-element';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SpeedTestResult {
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  jitter: number;
  packetLoss: number;
  timestamp: Date;
  ip?: string;
  isp?: string;
  location?: string;
  serverId?: string;
  serverName?: string;
  serverDistance?: number;
  downloadConsistency?: number;
  uploadConsistency?: number;
  idleLatency?: number;
  downloadLatency?: number;
  uploadLatency?: number;
}

interface TestProgress {
  stage: 'idle' | 'initializing' | 'ping' | 'download' | 'upload' | 'complete';
  progress: number;
  currentSpeed: number;
}

interface SpeedDataPoint {
  timestamp: number;
  speed: number;
  type: 'download' | 'upload';
}

interface TestServer {
  id: string;
  name: string;
  host: string;
  distance?: number;
  latency?: number;
}

interface ConnectionQuality {
  rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  color: string;
  description: string;
}

const SpeedTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testProgress, setTestProgress] = useState<TestProgress>({
    stage: 'idle',
    progress: 0,
    currentSpeed: 0
  });
  const [result, setResult] = useState<SpeedTestResult | null>(null);
  const [history, setHistory] = useState<SpeedTestResult[]>([]);
  const [networkInfo, setNetworkInfo] = useState<{ ip?: string; isp?: string; location?: string }>({});
  const [speedData, setSpeedData] = useState<SpeedDataPoint[]>([]);
  const [maxSpeed, setMaxSpeed] = useState<number>(100);
  const [selectedServer, setSelectedServer] = useState<TestServer | null>(null);
  const [availableServers, setAvailableServers] = useState<TestServer[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoSelectServer, setAutoSelectServer] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Default test servers
  const defaultServers: TestServer[] = [
    { id: 'cloudflare', name: 'Cloudflare (Global CDN)', host: 'https://speed.cloudflare.com' },
    { id: 'google', name: 'Google (Global)', host: 'https://www.google.com' },
    { id: 'fastly', name: 'Fastly CDN', host: 'https://www.fastly.com' },
    { id: 'akamai', name: 'Akamai CDN', host: 'https://www.akamai.com' },
  ];

  useEffect(() => {
    loadHistory();
    fetchNetworkInfo();
    measureServerLatencies();
  }, []);

  const loadHistory = () => {
    const savedHistory = localStorage.getItem('speedtest-history-v2');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }
  };

  const saveHistory = (newResult: SpeedTestResult) => {
    const newHistory = [newResult, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('speedtest-history-v2', JSON.stringify(newHistory));
  };

  const fetchNetworkInfo = async () => {
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();

      try {
        const geoResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
        const geoData = await geoResponse.json();
        setNetworkInfo({
          ip: ipData.ip,
          isp: geoData.org || 'Unknown ISP',
          location: `${geoData.city || 'Unknown'}, ${geoData.region || ''}, ${geoData.country_name || 'Unknown'}`
        });
      } catch {
        setNetworkInfo({
          ip: ipData.ip,
          isp: 'Unknown',
          location: 'Unknown'
        });
      }
    } catch (error) {
      console.error('Failed to fetch network info:', error);
      setNetworkInfo({
        ip: 'Unable to fetch',
        isp: 'Unknown',
        location: 'Unknown'
      });
    }
  };

  const measureServerLatencies = async () => {
    const serversWithLatency = await Promise.all(
      defaultServers.map(async (server) => {
        try {
          const start = performance.now();
          await fetch(`${server.host}/favicon.ico`, {
            method: 'HEAD',
            cache: 'no-cache',
            signal: AbortSignal.timeout(5000)
          });
          const latency = performance.now() - start;
          return { ...server, latency: Math.round(latency) };
        } catch {
          return { ...server, latency: 9999 };
        }
      })
    );

    const sorted = serversWithLatency.sort((a, b) => (a.latency || 9999) - (b.latency || 9999));
    setAvailableServers(sorted);

    if (autoSelectServer && sorted[0]) {
      setSelectedServer(sorted[0]);
    }
  };

  const measurePing = async (signal: AbortSignal): Promise<{
    ping: number;
    jitter: number;
    packetLoss: number;
    idleLatency: number;
  }> => {
    const pingTests = 20;
    const pings: number[] = [];
    let packetsLost = 0;

    for (let i = 0; i < pingTests; i++) {
      if (signal.aborted) throw new Error('Aborted');

      const start = performance.now();
      try {
        const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace', {
          method: 'GET',
          cache: 'no-cache',
          signal: AbortSignal.timeout(3000)
        });

        if (response.ok) {
          const end = performance.now();
          pings.push(end - start);
        } else {
          packetsLost++;
        }
      } catch (error: any) {
        if (error.name === 'AbortError') throw error;
        packetsLost++;
      }

      setTestProgress(prev => ({
        ...prev,
        stage: 'ping',
        progress: ((i + 1) / pingTests) * 100
      }));

      await new Promise(resolve => setTimeout(resolve, 50));
    }

    if (pings.length === 0) {
      throw new Error('All ping tests failed');
    }

    const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length;
    const jitter = Math.sqrt(
      pings.map(p => Math.pow(p - avgPing, 2)).reduce((a, b) => a + b, 0) / pings.length
    );
    const packetLoss = (packetsLost / pingTests) * 100;

    return {
      ping: Math.round(avgPing),
      jitter: Math.round(jitter),
      packetLoss: Math.round(packetLoss * 10) / 10,
      idleLatency: Math.round(avgPing)
    };
  };

  const measureDownloadSpeed = async (signal: AbortSignal): Promise<{
    speed: number;
    endTime: number;
    consistency: number;
    latency: number;
  }> => {
    const testDuration = 15000;
    const chunkSizes = [1, 2, 5, 10, 25]; // MB
    const baseUrl = 'https://speed.cloudflare.com/__down?bytes=';

    let totalBytes = 0;
    const startTime = performance.now();
    const speeds: number[] = [];
    const latencies: number[] = [];

    while (performance.now() - startTime < testDuration) {
      if (signal.aborted) throw new Error('Aborted');

      for (const size of chunkSizes) {
        if (signal.aborted || performance.now() - startTime >= testDuration) break;

        try {
          const url = `${baseUrl}${size * 1024 * 1024}`;
          const chunkStart = performance.now();

          const response = await fetch(url, {
            cache: 'no-cache',
            signal
          });

          const latency = performance.now() - chunkStart;
          latencies.push(latency);

          const reader = response.body?.getReader();
          if (!reader) continue;

          let chunkBytes = 0;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const bytes = value?.length || 0;
            chunkBytes += bytes;
            totalBytes += bytes;

            const elapsed = (performance.now() - startTime) / 1000;
            const currentSpeed = (totalBytes * 8) / elapsed / 1000000;
            speeds.push(currentSpeed);

            setSpeedData(prev => [...prev, {
              timestamp: elapsed,
              speed: currentSpeed,
              type: 'download'
            }]);

            setMaxSpeed(prev => Math.max(prev, currentSpeed * 1.2));

            setTestProgress(prev => ({
              ...prev,
              stage: 'download',
              progress: Math.min((elapsed / (testDuration / 1000)) * 100, 100),
              currentSpeed: Math.round(currentSpeed * 100) / 100
            }));
          }
        } catch (error: any) {
          if (error.name === 'AbortError') throw error;
          break;
        }
      }
    }

    const recentSpeeds = speeds.slice(-30);
    const avgSpeed = recentSpeeds.reduce((a, b) => a + b, 0) / recentSpeeds.length;
    const speedVariance = recentSpeeds.map(s => Math.abs(s - avgSpeed)).reduce((a, b) => a + b, 0) / recentSpeeds.length;
    const consistency = Math.max(0, 100 - (speedVariance / avgSpeed) * 100);

    const avgLatency = latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : 0;

    const endTime = (performance.now() - startTime) / 1000;
    return {
      speed: Math.round(avgSpeed * 100) / 100,
      endTime,
      consistency: Math.round(consistency),
      latency: Math.round(avgLatency)
    };
  };

  const measureUploadSpeed = async (signal: AbortSignal, downloadEndTime: number = 0): Promise<{
    speed: number;
    consistency: number;
    latency: number;
  }> => {
    const testDuration = 15000;
    const chunkSizes = [256, 512, 1024]; // KB
    const testUrl = 'https://httpbin.org/post';

    let totalBytes = 0;
    const startTime = performance.now();
    const speeds: number[] = [];
    const latencies: number[] = [];

    const createDataBlob = (sizeKB: number) => {
      const size = sizeKB * 1024;
      const pattern = new Uint8Array(1024);
      for (let i = 0; i < pattern.length; i++) {
        pattern[i] = i % 256;
      }
      const chunks = Math.ceil(size / pattern.length);
      return new Blob(Array(chunks).fill(pattern));
    };

    while (performance.now() - startTime < testDuration) {
      if (signal.aborted) throw new Error('Aborted');

      for (const size of chunkSizes) {
        if (signal.aborted || performance.now() - startTime >= testDuration) break;

        try {
          const dataBlob = createDataBlob(size);
          const uploadStart = performance.now();

          const response = await fetch(testUrl, {
            method: 'POST',
            body: dataBlob,
            headers: { 'Content-Type': 'application/octet-stream' },
            cache: 'no-cache',
            signal
          });

          const latency = performance.now() - uploadStart;
          latencies.push(latency);

          if (response.ok) {
            totalBytes += size * 1024;

            const elapsed = (performance.now() - startTime) / 1000;
            const currentSpeed = (totalBytes * 8) / elapsed / 1000000;
            speeds.push(currentSpeed);

            setSpeedData(prev => [...prev, {
              timestamp: downloadEndTime + elapsed,
              speed: currentSpeed,
              type: 'upload'
            }]);

            setMaxSpeed(prev => Math.max(prev, currentSpeed * 1.2));

            setTestProgress(prev => ({
              ...prev,
              stage: 'upload',
              progress: Math.min((elapsed / (testDuration / 1000)) * 100, 100),
              currentSpeed: Math.round(currentSpeed * 100) / 100
            }));
          }
        } catch (error: any) {
          if (error.name === 'AbortError') throw error;
          break;
        }
      }
    }

    const recentSpeeds = speeds.slice(-30);
    const avgSpeed = recentSpeeds.length > 0
      ? recentSpeeds.reduce((a, b) => a + b, 0) / recentSpeeds.length
      : 0;

    const speedVariance = recentSpeeds.length > 0
      ? recentSpeeds.map(s => Math.abs(s - avgSpeed)).reduce((a, b) => a + b, 0) / recentSpeeds.length
      : 0;

    const consistency = Math.max(0, 100 - (speedVariance / (avgSpeed || 1)) * 100);

    const avgLatency = latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : 0;

    return {
      speed: Math.round(avgSpeed * 100) / 100,
      consistency: Math.round(consistency),
      latency: Math.round(avgLatency)
    };
  };

  const startSpeedTest = async () => {
    setIsRunning(true);
    setResult(null);
    setSpeedData([]);
    setMaxSpeed(100);
    setTestProgress({ stage: 'initializing', progress: 0, currentSpeed: 0 });

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      // Initialize
      await new Promise(resolve => setTimeout(resolve, 500));

      // Measure Ping & Jitter
      const { ping, jitter, packetLoss, idleLatency } = await measurePing(signal);

      // Measure Download Speed
      setTestProgress({ stage: 'download', progress: 0, currentSpeed: 0 });
      const {
        speed: downloadSpeed,
        endTime: downloadEndTime,
        consistency: downloadConsistency,
        latency: downloadLatency
      } = await measureDownloadSpeed(signal);

      // Measure Upload Speed
      setTestProgress({ stage: 'upload', progress: 0, currentSpeed: 0 });
      const {
        speed: uploadSpeed,
        consistency: uploadConsistency,
        latency: uploadLatency
      } = await measureUploadSpeed(signal, downloadEndTime);

      const testResult: SpeedTestResult = {
        downloadSpeed,
        uploadSpeed,
        ping,
        jitter,
        packetLoss,
        timestamp: new Date(),
        downloadConsistency,
        uploadConsistency,
        idleLatency,
        downloadLatency,
        uploadLatency,
        serverId: selectedServer?.id,
        serverName: selectedServer?.name,
        ...networkInfo
      };

      setResult(testResult);
      setTestProgress({ stage: 'complete', progress: 100, currentSpeed: 0 });
      saveHistory(testResult);

      toast.success('Speed test completed!', {
        description: `Download: ${downloadSpeed} Mbps | Upload: ${uploadSpeed} Mbps`
      });
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast.error('Speed test failed. Please try again.');
        console.error('Speed test error:', error);
      }
      setTestProgress({ stage: 'idle', progress: 0, currentSpeed: 0 });
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  };

  const stopSpeedTest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsRunning(false);
    setSpeedData([]);
    setTestProgress({ stage: 'idle', progress: 0, currentSpeed: 0 });
    toast.info('Speed test stopped');
  };

  const getConnectionQuality = (speed: number, type: 'download' | 'upload'): ConnectionQuality => {
    const threshold = type === 'download' ? { excellent: 100, good: 50, fair: 25 } : { excellent: 50, good: 25, fair: 10 };

    if (speed >= threshold.excellent) {
      return { rating: 'Excellent', color: 'text-green-500', description: 'Perfect for 4K streaming, gaming, and large downloads' };
    } else if (speed >= threshold.good) {
      return { rating: 'Good', color: 'text-blue-500', description: 'Great for HD streaming and video calls' };
    } else if (speed >= threshold.fair) {
      return { rating: 'Fair', color: 'text-yellow-500', description: 'Suitable for browsing and SD streaming' };
    } else {
      return { rating: 'Poor', color: 'text-red-500', description: 'May experience buffering and slow loads' };
    }
  };

  const getSpeedColor = (speed: number) => {
    if (speed < 10) return 'text-red-500';
    if (speed < 50) return 'text-orange-500';
    if (speed < 100) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStageText = () => {
    switch (testProgress.stage) {
      case 'initializing': return 'Initializing test...';
      case 'ping': return 'Measuring latency & packet loss...';
      case 'download': return 'Testing download speed...';
      case 'upload': return 'Testing upload speed...';
      case 'complete': return 'Test complete!';
      default: return 'Ready to test';
    }
  };

  const shareResults = () => {
    if (!result) return;

    const text = `My Internet Speed Test Results 🚀\n\n` +
      `📥 Download: ${result.downloadSpeed} Mbps\n` +
      `📤 Upload: ${result.uploadSpeed} Mbps\n` +
      `⚡ Ping: ${result.ping} ms\n` +
      `📊 Jitter: ${result.jitter} ms\n` +
      `${result.packetLoss > 0 ? `📉 Packet Loss: ${result.packetLoss}%\n` : ''}` +
      `🌐 ISP: ${result.isp}\n` +
      `📍 Location: ${result.location}`;

    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Results copied to clipboard!');
    }
  };

  const SpeedGauge = ({
    value,
    label,
    icon: Icon,
    max = 200,
    unit = 'Mbps',
    showQuality = false,
    type
  }: {
    value: number;
    label: string;
    icon: any;
    max?: number;
    unit?: string;
    showQuality?: boolean;
    type?: 'download' | 'upload';
  }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const quality = type ? getConnectionQuality(value, type) : null;

    return (
      <div className="flex flex-col items-center space-y-3">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r="64"
              stroke="currentColor"
              strokeWidth="10"
              fill="none"
              className="text-muted/30"
            />
            <motion.circle
              cx="72"
              cy="72"
              r="64"
              stroke="currentColor"
              strokeWidth="10"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 64}`}
              strokeDashoffset={`${2 * Math.PI * 64 * (1 - percentage / 100)}`}
              className={getSpeedColor(value)}
              initial={{ strokeDashoffset: 2 * Math.PI * 64 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 64 * (1 - percentage / 100) }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Icon className="h-6 w-6 mb-2 text-muted-foreground" />
            <motion.span
              className={`text-3xl font-bold ${getSpeedColor(value)}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            >
              {value}
            </motion.span>
            <span className="text-xs text-muted-foreground mt-1">
              {unit}
            </span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          {showQuality && quality && (
            <p className={`text-xs font-medium ${quality.color} mt-1`}>
              {quality.rating}
            </p>
          )}
        </div>
      </div>
    );
  };

  const SpeedGraph = () => {
    if (speedData.length === 0) return null;

    const width = 900;
    const height = 350;
    const padding = { top: 30, right: 50, bottom: 50, left: 70 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    const maxTime = Math.max(...speedData.map(d => d.timestamp), 30);
    const yMax = Math.max(Math.ceil(maxSpeed / 10) * 10, 10);

    const downloadData = speedData.filter(d => d.type === 'download');
    const uploadData = speedData.filter(d => d.type === 'upload');

    const createPath = (data: SpeedDataPoint[]) => {
      if (data.length === 0) return '';

      return data.map((point, i) => {
        const x = padding.left + (point.timestamp / maxTime) * graphWidth;
        const y = padding.top + graphHeight - (point.speed / yMax) * graphHeight;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ');
    };

    const downloadPath = createPath(downloadData);
    const uploadPath = createPath(uploadData);

    const currentTime = speedData.length > 0 ? speedData[speedData.length - 1].timestamp : 0;
    const currentX = padding.left + (currentTime / maxTime) * graphWidth;

    return (
      <div className="w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Grid */}
          {[0, 1, 2, 3, 4, 5].map(i => {
            const y = padding.top + (graphHeight / 5) * i;
            const speed = yMax - (yMax / 5) * i;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-muted-foreground/10"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 15}
                  y={y + 5}
                  textAnchor="end"
                  className="text-sm fill-muted-foreground font-medium"
                >
                  {speed.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Time grid */}
          {Array.from({ length: Math.ceil(maxTime / 5) + 1 }, (_, i) => i * 5).map(time => {
            const x = padding.left + (time / maxTime) * graphWidth;
            return (
              <g key={time}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-muted-foreground/5"
                  strokeDasharray="4 4"
                />
                <text
                  x={x}
                  y={height - padding.bottom + 25}
                  textAnchor="middle"
                  className="text-sm fill-muted-foreground"
                >
                  {time}s
                </text>
              </g>
            );
          })}

          {/* Current position */}
          {isRunning && (
            <motion.line
              x1={currentX}
              y1={padding.top}
              x2={currentX}
              y2={height - padding.bottom}
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary"
              strokeDasharray="5 5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
            />
          )}

          {/* Download area */}
          {downloadPath && downloadData.length > 1 && (
            <>
              <motion.path
                d={`${downloadPath} L ${padding.left + (downloadData[downloadData.length - 1].timestamp / maxTime) * graphWidth} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`}
                fill="url(#downloadGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
              <path
                d={downloadPath}
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Upload area */}
          {uploadPath && uploadData.length > 1 && (
            <>
              <motion.path
                d={`${uploadPath} L ${padding.left + (uploadData[uploadData.length - 1].timestamp / maxTime) * graphWidth} ${height - padding.bottom} L ${padding.left + (uploadData[0].timestamp / maxTime) * graphWidth} ${height - padding.bottom} Z`}
                fill="url(#uploadGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
              <path
                d={uploadPath}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Axes */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted-foreground"
          />
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted-foreground"
          />

          {/* Labels */}
          <text
            x={25}
            y={height / 2}
            textAnchor="middle"
            className="text-sm fill-foreground font-semibold"
            transform={`rotate(-90, 25, ${height / 2})`}
          >
            Speed (Mbps)
          </text>
          <text
            x={width / 2}
            y={height - 8}
            textAnchor="middle"
            className="text-sm fill-foreground font-semibold"
          >
            Time (seconds)
          </text>

          {/* Gradients */}
          <defs>
            <linearGradient id="downloadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="uploadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>

        <div className="flex items-center justify-center gap-8 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-1 bg-green-500 rounded-full" />
            <span className="text-sm font-medium text-muted-foreground">Download</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-1 bg-blue-500 rounded-full" />
            <span className="text-sm font-medium text-muted-foreground">Upload</span>
          </div>
        </div>
      </div>
    );
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    unit,
    trend,
    info
  }: {
    icon: any;
    label: string;
    value: string | number;
    unit?: string;
    trend?: 'up' | 'down' | 'neutral';
    info?: string;
  }) => {
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground';

    return (
      <div className="relative group p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 hover:from-muted/70 hover:to-muted/50 transition-all border border-border/50 hover:border-border">
        <div className="flex items-start justify-between mb-2">
          <Icon className="h-5 w-5 text-primary" />
          {info && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">{info}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-foreground">
              {value}
              {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
            </p>
            {trend && (
              <TrendIcon className={`h-4 w-4 ${trendColor}`} />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatedElement>
      <TooltipProvider>
        <div className="max-w-7xl mx-auto space-y-6 p-4">
          {/* Header */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 text-3xl">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Gauge className="h-8 w-8 text-primary" />
                    </div>
                    Internet Speed Test
                  </CardTitle>
                  <CardDescription className="mt-2 text-base">
                    Professional speed testing powered by Cloudflare & global CDN servers
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={showHistory} onOpenChange={setShowHistory}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <History className="h-5 w-5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Test History</DialogTitle>
                        <DialogDescription>
                          Your recent speed test results (last 20 tests)
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 mt-4">
                        {history.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">No test history yet</p>
                        ) : (
                          history.map((test, index) => (
                            <div
                              key={index}
                              className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    {test.timestamp.toLocaleString()}
                                  </span>
                                </div>
                                {test.serverName && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Server className="h-3 w-3" />
                                    {test.serverName}
                                  </div>
                                )}
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center gap-2">
                                  <Download className="h-4 w-4 text-green-500" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Download</p>
                                    <p className="font-bold text-green-500">{test.downloadSpeed} Mbps</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Upload className="h-4 w-4 text-blue-500" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Upload</p>
                                    <p className="font-bold text-blue-500">{test.uploadSpeed} Mbps</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Activity className="h-4 w-4 text-orange-500" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Ping</p>
                                    <p className="font-bold text-orange-500">{test.ping} ms</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Signal className="h-4 w-4 text-purple-500" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Jitter</p>
                                    <p className="font-bold text-purple-500">{test.jitter} ms</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Network Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Globe className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">IP Address</p>
                    <p className="font-semibold text-foreground">{networkInfo.ip || 'Loading...'}</p>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Wifi className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-medium">Internet Provider</p>
                    <p className="font-semibold text-foreground truncate">{networkInfo.isp || 'Loading...'}</p>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <MapPin className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-medium">Location</p>
                    <p className="font-semibold text-foreground truncate">{networkInfo.location || 'Loading...'}</p>
                  </div>
                </motion.div>
              </div>

              {/* Server Selection */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border">
                <Server className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Test Server</p>
                  <Select
                    value={selectedServer?.id}
                    onValueChange={(id) => {
                      const server = availableServers.find(s => s.id === id);
                      setSelectedServer(server || null);
                      setAutoSelectServer(false);
                    }}
                  >
                    <SelectTrigger className="w-full md:w-[300px]">
                      <SelectValue placeholder="Select a server" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableServers.map((server) => (
                        <SelectItem key={server.id} value={server.id}>
                          <div className="flex items-center justify-between gap-3">
                            <span>{server.name}</span>
                            {server.latency && server.latency < 999 && (
                              <span className="text-xs text-muted-foreground">
                                {server.latency}ms
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={measureServerLatencies}
                  disabled={isRunning}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {/* Main Test Button */}
              <div className="text-center space-y-4 py-6">
                <AnimatePresence mode="wait">
                  {!isRunning ? (
                    <motion.div
                      key="start"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                    >
                      <Button
                        size="lg"
                        onClick={startSpeedTest}
                        className="w-full md:w-auto px-12 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        <Zap className="h-6 w-6 mr-2" />
                        Start Speed Test
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="stop"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="space-y-4"
                    >
                      <Button
                        size="lg"
                        variant="destructive"
                        onClick={stopSpeedTest}
                        className="w-full md:w-auto px-12 py-6 text-lg font-semibold"
                      >
                        Stop Test
                      </Button>
                      <div className="space-y-3">
                        <p className="text-base font-semibold text-foreground">{getStageText()}</p>
                        <Progress value={testProgress.progress} className="h-3 w-full max-w-md mx-auto" />
                        {testProgress.currentSpeed > 0 && (
                          <motion.p
                            className="text-2xl font-bold text-primary"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring" }}
                          >
                            {testProgress.currentSpeed} Mbps
                          </motion.p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Real-time Graph */}
              {(isRunning || speedData.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-2 border-primary/20"
                >
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-primary" />
                    Real-time Speed Analysis
                  </h3>
                  <SpeedGraph />
                </motion.div>
              )}

              {/* Results */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Main Speed Gauges */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20">
                      <SpeedGauge
                        value={result.downloadSpeed}
                        label="Download"
                        icon={Download}
                        max={Math.max(result.downloadSpeed * 1.2, 200)}
                        showQuality
                        type="download"
                      />
                      <SpeedGauge
                        value={result.uploadSpeed}
                        label="Upload"
                        icon={Upload}
                        max={Math.max(result.uploadSpeed * 1.2, 100)}
                        showQuality
                        type="upload"
                      />
                      <SpeedGauge
                        value={result.ping}
                        label="Ping"
                        icon={Activity}
                        max={100}
                        unit="ms"
                      />
                      <SpeedGauge
                        value={result.jitter}
                        label="Jitter"
                        icon={Signal}
                        max={50}
                        unit="ms"
                      />
                    </div>

                    {/* Detailed Stats */}
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="latency">Latency</TabsTrigger>
                        <TabsTrigger value="quality">Quality</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <StatCard
                            icon={Download}
                            label="Download Speed"
                            value={result.downloadSpeed}
                            unit="Mbps"
                            info="Maximum download speed achieved during the test"
                          />
                          <StatCard
                            icon={Upload}
                            label="Upload Speed"
                            value={result.uploadSpeed}
                            unit="Mbps"
                            info="Maximum upload speed achieved during the test"
                          />
                          <StatCard
                            icon={Activity}
                            label="Latency"
                            value={result.ping}
                            unit="ms"
                            info="Average round-trip time for data packets"
                          />
                          <StatCard
                            icon={Signal}
                            label="Jitter"
                            value={result.jitter}
                            unit="ms"
                            info="Variation in latency over time"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="latency" className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <StatCard
                            icon={Activity}
                            label="Idle Latency"
                            value={result.idleLatency || result.ping}
                            unit="ms"
                            info="Latency when connection is idle"
                          />
                          <StatCard
                            icon={Download}
                            label="Download Latency"
                            value={result.downloadLatency || '-'}
                            unit="ms"
                            info="Latency during download test"
                          />
                          <StatCard
                            icon={Upload}
                            label="Upload Latency"
                            value={result.uploadLatency || '-'}
                            unit="ms"
                            info="Latency during upload test"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="quality" className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <StatCard
                            icon={TrendingUp}
                            label="Download Consistency"
                            value={result.downloadConsistency || '-'}
                            unit="%"
                            info="Stability of download speed throughout the test"
                          />
                          <StatCard
                            icon={TrendingUp}
                            label="Upload Consistency"
                            value={result.uploadConsistency || '-'}
                            unit="%"
                            info="Stability of upload speed throughout the test"
                          />
                          <StatCard
                            icon={WifiOff}
                            label="Packet Loss"
                            value={result.packetLoss}
                            unit="%"
                            info="Percentage of data packets lost during transmission"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Connection Quality Summary */}
                    <div className="p-6 rounded-xl bg-muted/50 border">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        Connection Quality Summary
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Download Performance</p>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${getConnectionQuality(result.downloadSpeed, 'download').color}`}>
                              {getConnectionQuality(result.downloadSpeed, 'download').rating}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              - {getConnectionQuality(result.downloadSpeed, 'download').description}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Upload Performance</p>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${getConnectionQuality(result.uploadSpeed, 'upload').color}`}>
                              {getConnectionQuality(result.uploadSpeed, 'upload').rating}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              - {getConnectionQuality(result.uploadSpeed, 'upload').description}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Test completed at</p>
                          <p className="font-semibold">{result.timestamp.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={shareResults}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={startSpeedTest}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retest
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Download className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Download Speed</h4>
                    <p className="text-sm text-muted-foreground">
                      Measures how fast you can receive data from the internet. Important for streaming, downloading files, and browsing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Upload className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Upload Speed</h4>
                    <p className="text-sm text-muted-foreground">
                      Measures how fast you can send data to the internet. Critical for video calls, uploading files, and online gaming.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Activity className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Ping & Latency</h4>
                    <p className="text-sm text-muted-foreground">
                      Measures connection responsiveness. Lower is better for gaming, video calls, and real-time applications.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TooltipProvider>
    </AnimatedElement>
  );
};

export default SpeedTest;