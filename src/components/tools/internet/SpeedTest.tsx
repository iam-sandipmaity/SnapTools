'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Wifi, WifiOff, Download, Upload, Activity, Globe, MapPin, Clock, Gauge } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import AnimatedElement from '@/components/animated-element';
import { motion } from 'framer-motion';

interface SpeedTestResult {
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  jitter: number;
  timestamp: Date;
  ip?: string;
  isp?: string;
  location?: string;
}

interface TestProgress {
  stage: 'idle' | 'ping' | 'download' | 'upload' | 'complete';
  progress: number;
  currentSpeed: number;
}

interface SpeedDataPoint {
  timestamp: number;
  speed: number;
  type: 'download' | 'upload';
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
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('speedtest-history');
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

    // Fetch network info
    fetchNetworkInfo();
  }, []);

  const fetchNetworkInfo = async () => {
    try {
      // Use ipify for IP and ipapi for location (more reliable)
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      
      // Try to get location info, but don't fail if it doesn't work
      try {
        const geoResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
        const geoData = await geoResponse.json();
        setNetworkInfo({
          ip: ipData.ip,
          isp: geoData.org || 'Unknown ISP',
          location: `${geoData.city || 'Unknown'}, ${geoData.country_name || 'Unknown'}`
        });
      } catch {
        // Fallback if geo API fails
        setNetworkInfo({
          ip: ipData.ip,
          isp: 'Unknown',
          location: 'Unknown'
        });
      }
    } catch (error) {
      console.error('Failed to fetch network info:', error);
      // Set default values instead of leaving "Loading..."
      setNetworkInfo({
        ip: 'Unable to fetch',
        isp: 'Unknown',
        location: 'Unknown'
      });
    }
  };

  const measurePing = async (signal: AbortSignal): Promise<{ ping: number; jitter: number }> => {
    const pingTests = 10;
    const pings: number[] = [];

    for (let i = 0; i < pingTests; i++) {
      if (signal.aborted) throw new Error('Aborted');
      
      const start = performance.now();
      try {
        await fetch('https://www.cloudflare.com/cdn-cgi/trace', {
          method: 'GET',
          cache: 'no-cache',
          signal
        });
        const end = performance.now();
        pings.push(end - start);
      } catch (error: any) {
        if (error.name === 'AbortError') throw error;
      }

      setTestProgress(prev => ({
        ...prev,
        stage: 'ping',
        progress: ((i + 1) / pingTests) * 100
      }));

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length;
    const jitter = Math.sqrt(
      pings.map(p => Math.pow(p - avgPing, 2)).reduce((a, b) => a + b, 0) / pings.length
    );

    return { ping: Math.round(avgPing), jitter: Math.round(jitter) };
  };

  const measureDownloadSpeed = async (signal: AbortSignal): Promise<number> => {
    const testDuration = 10000; // 10 seconds
    const chunkSize = 1024 * 1024; // 1MB chunks
    const testUrls = [
      `https://speed.cloudflare.com/__down?bytes=${chunkSize * 5}`,
      `https://speed.cloudflare.com/__down?bytes=${chunkSize * 10}`,
      `https://speed.cloudflare.com/__down?bytes=${chunkSize * 25}`,
    ];

    let totalBytes = 0;
    const startTime = performance.now();
    const speeds: number[] = [];

    while (performance.now() - startTime < testDuration) {
      if (signal.aborted) throw new Error('Aborted');

      for (const url of testUrls) {
        if (signal.aborted || performance.now() - startTime >= testDuration) break;

        try {
          const chunkStart = performance.now();
          const response = await fetch(url, {
            cache: 'no-cache',
            signal
          });
          
          const reader = response.body?.getReader();
          if (!reader) continue;

          let chunkBytes = 0;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunkBytes += value?.length || 0;
            totalBytes += value?.length || 0;

            const elapsed = (performance.now() - startTime) / 1000;
            const currentSpeed = (totalBytes * 8) / elapsed / 1000000; // Mbps
            speeds.push(currentSpeed);

            // Add to graph data
            setSpeedData(prev => [...prev, {
              timestamp: elapsed,
              speed: currentSpeed,
              type: 'download'
            }]);

            // Update max speed for graph scaling
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

    const avgSpeed = speeds.length > 0 
      ? speeds.slice(-20).reduce((a, b) => a + b, 0) / Math.min(speeds.length, 20)
      : 0;

    const endTime = (performance.now() - startTime) / 1000;
    return { speed: Math.round(avgSpeed * 100) / 100, endTime };
  };

  const measureUploadSpeed = async (signal: AbortSignal, downloadEndTime: number = 0): Promise<number> => {
    console.log('measureUploadSpeed started with downloadEndTime:', downloadEndTime);
    const testDuration = 10000; // 10 seconds
    const chunkSize = 512 * 1024; // 512KB chunks
    const parallelUploads = 3; // Use 3 parallel connections
    
    // Use httpbin which has CORS enabled
    const testUrl = 'https://httpbin.org/post';

    let totalBytes = 0;
    const startTime = performance.now();
    const speeds: number[] = [];
    
    console.log('Upload test will run for', testDuration / 1000, 'seconds');

    // Pre-generate a reusable blob to avoid crypto limitations
    const createDataBlob = (size: number) => {
      // Create a buffer filled with repeating pattern
      const pattern = new Uint8Array(1024);
      for (let i = 0; i < pattern.length; i++) {
        pattern[i] = i % 256;
      }
      const chunks = Math.ceil(size / pattern.length);
      const arrays = Array(chunks).fill(pattern);
      return new Blob(arrays);
    };
    
    const dataBlob = createDataBlob(chunkSize);

    // Upload function for parallel requests
    const uploadChunk = async () => {
      const response = await fetch(testUrl, {
        method: 'POST',
        body: dataBlob,
        headers: {
          'Content-Type': 'application/octet-stream'
        },
        cache: 'no-cache',
        signal
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      
      return chunkSize;
    };

    let uploadIndex = 0;
    let iterationCount = 0;
    while (performance.now() - startTime < testDuration) {
      if (signal.aborted) throw new Error('Aborted');

      iterationCount++;
      console.log(`Upload iteration ${iterationCount}, elapsed: ${((performance.now() - startTime) / 1000).toFixed(2)}s`);

      try {
        // Launch parallel uploads
        const uploadPromises = Array.from({ length: parallelUploads }, () => 
          uploadChunk()
        );
        
        const uploadStart = performance.now();
        const results = await Promise.all(uploadPromises);
        const uploadTime = (performance.now() - uploadStart) / 1000;
        
        console.log(`Uploaded ${parallelUploads} chunks in ${uploadTime.toFixed(2)}s`);
        
        uploadIndex += parallelUploads;
        totalBytes += results.reduce((sum, bytes) => sum + bytes, 0);

        const elapsed = (performance.now() - startTime) / 1000;
        const currentSpeed = (totalBytes * 8) / elapsed / 1000000; // Mbps
        speeds.push(currentSpeed);

        // Add to graph data with offset timeline for sequential display
        setSpeedData(prev => [...prev, {
          timestamp: downloadEndTime + elapsed,
          speed: currentSpeed,
          type: 'upload'
        }]);

        // Update max speed for graph scaling
        setMaxSpeed(prev => Math.max(prev, currentSpeed * 1.2));

        setTestProgress(prev => ({
          ...prev,
          stage: 'upload',
          progress: Math.min((elapsed / (testDuration / 1000)) * 100, 100),
          currentSpeed: Math.round(currentSpeed * 100) / 100
        }));
      } catch (error: any) {
        if (error.name === 'AbortError') throw error;
        console.error('Upload chunk error:', error);
        break;
      }
    }

    console.log('Upload test completed, total iterations:', iterationCount, 'total bytes:', totalBytes);

    const avgSpeed = speeds.length > 0
      ? speeds.slice(-20).reduce((a, b) => a + b, 0) / Math.min(speeds.length, 20)
      : 0;

    return Math.round(avgSpeed * 100) / 100;
  };

  const startSpeedTest = async () => {
    setIsRunning(true);
    setResult(null);
    setSpeedData([]);
    setMaxSpeed(100);
    setTestProgress({ stage: 'idle', progress: 0, currentSpeed: 0 });

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      // Measure Ping & Jitter
      const { ping, jitter } = await measurePing(signal);

      // Measure Download Speed first
      setTestProgress({ stage: 'download', progress: 0, currentSpeed: 0 });
      const { speed: downloadSpeed, endTime: downloadEndTime } = await measureDownloadSpeed(signal);
      
      console.log('Download completed:', downloadSpeed, 'Mbps, endTime:', downloadEndTime);
      
      // Then measure Upload Speed after download completes
      setTestProgress({ stage: 'upload', progress: 0, currentSpeed: 0 });
      console.log('Starting upload test with downloadEndTime:', downloadEndTime);
      
      let uploadSpeed = 0;
      try {
        uploadSpeed = await measureUploadSpeed(signal, downloadEndTime);
        console.log('Upload completed:', uploadSpeed, 'Mbps');
      } catch (error) {
        console.error('Upload test failed:', error);
        toast.error('Upload test failed, showing download results only');
      }

      const testResult: SpeedTestResult = {
        downloadSpeed,
        uploadSpeed,
        ping,
        jitter,
        timestamp: new Date(),
        ...networkInfo
      };

      setResult(testResult);
      setTestProgress({ stage: 'complete', progress: 100, currentSpeed: 0 });

      // Save to history
      const newHistory = [testResult, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('speedtest-history', JSON.stringify(newHistory));

      toast.success('Speed test completed!');
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast.error('Speed test failed. Please try again.');
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

  const getSpeedColor = (speed: number) => {
    if (speed < 10) return 'text-red-500';
    if (speed < 50) return 'text-orange-500';
    if (speed < 100) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStageText = () => {
    switch (testProgress.stage) {
      case 'ping': return 'Measuring Latency...';
      case 'download': return 'Testing Download & Upload Speed...';
      case 'upload': return 'Testing Download & Upload Speed...';
      case 'complete': return 'Test Complete!';
      default: return 'Ready to Test';
    }
  };

  const SpeedGauge = ({ value, label, icon: Icon, max = 200 }: { value: number; label: string; icon: any; max?: number }) => {
    const percentage = Math.min((value / max) * 100, 100);
    
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
              className={getSpeedColor(value)}
              initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - percentage / 100) }}
              transition={{ duration: 1, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Icon className="h-6 w-6 mb-1 text-muted-foreground" />
            <motion.span
              className={`text-2xl font-bold ${getSpeedColor(value)}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              {value}
            </motion.span>
            <span className="text-xs text-muted-foreground">
              {label === 'Ping' ? 'ms' : 'Mbps'}
            </span>
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
    );
  };

  const SpeedGraph = () => {
    if (speedData.length === 0) return null;

    const width = 800;
    const height = 300;
    const padding = { top: 20, right: 40, bottom: 40, left: 60 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Dynamic time window based on data - now supports sequential testing (download then upload)
    const maxTime = Math.max(
      ...speedData.map(d => d.timestamp),
      20 // Default to 20 seconds to show both tests
    );
    const yMax = Math.max(Math.ceil(maxSpeed / 10) * 10, 10);

    // Separate download and upload data
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

    // Calculate current test position for vertical indicator
    const currentTime = speedData.length > 0 ? speedData[speedData.length - 1].timestamp : 0;
    const currentX = padding.left + (currentTime / maxTime) * graphWidth;

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => {
            const y = padding.top + (graphHeight / 4) * i;
            const speed = yMax - (yMax / 4) * i;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-muted-foreground/20"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-muted-foreground"
                >
                  {speed.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Time grid lines (every 2 seconds) */}
          {Array.from({ length: Math.ceil(maxTime / 2) + 1 }, (_, i) => i * 2).map(time => {
            const x = padding.left + (time / maxTime) * graphWidth;
            return (
              <line
                key={time}
                x1={x}
                y1={padding.top}
                x2={x}
                y2={height - padding.bottom}
                stroke="currentColor"
                strokeWidth="1"
                className="text-muted-foreground/10"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* X-axis labels */}
          {Array.from({ length: Math.ceil(maxTime / 2) + 1 }, (_, i) => i * 2).map(time => {
            const x = padding.left + (time / maxTime) * graphWidth;
            return (
              <text
                key={time}
                x={x}
                y={height - padding.bottom + 20}
                textAnchor="middle"
                className="text-xs fill-muted-foreground"
              >
                {time}s
              </text>
            );
          })}

          {/* Current position indicator */}
          {isRunning && (
            <motion.line
              x1={currentX}
              y1={padding.top}
              x2={currentX}
              y2={height - padding.bottom}
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
            />
          )}

          {/* Download area fill */}
          {downloadPath && downloadData.length > 1 && (
            <motion.path
              d={`${downloadPath} L ${padding.left + (downloadData[downloadData.length - 1].timestamp / maxTime) * graphWidth} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`}
              fill="#22c55e"
              fillOpacity="0.1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}

          {/* Upload area fill */}
          {uploadPath && uploadData.length > 1 && (
            <motion.path
              d={`${uploadPath} L ${padding.left + (uploadData[uploadData.length - 1].timestamp / maxTime) * graphWidth} ${height - padding.bottom} L ${padding.left + (uploadData[0].timestamp / maxTime) * graphWidth} ${height - padding.bottom} Z`}
              fill="#3b82f6"
              fillOpacity="0.1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}

          {/* Download line */}
          {downloadPath && (
            <path
              d={downloadPath}
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Upload line */}
          {uploadPath && (
            <path
              d={uploadPath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Axes */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="currentColor"
            strokeWidth="2"
            className="text-foreground"
          />
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="currentColor"
            strokeWidth="2"
            className="text-foreground"
          />

          {/* Y-axis label */}
          <text
            x={20}
            y={height / 2}
            textAnchor="middle"
            className="text-sm fill-foreground font-medium"
            transform={`rotate(-90, 20, ${height / 2})`}
          >
            Speed (Mbps)
          </text>

          {/* X-axis label */}
          <text
            x={width / 2}
            y={height - 5}
            textAnchor="middle"
            className="text-sm fill-foreground font-medium"
          >
            Time (seconds)
          </text>
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-green-500" />
            <span className="text-sm text-muted-foreground">Download</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-blue-500" />
            <span className="text-sm text-muted-foreground">Upload</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatedElement>
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-6 w-6" />
              Internet Speed Test
            </CardTitle>
            <CardDescription>
              Test your internet connection speed including download, upload, ping, and jitter
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Network Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Globe className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">IP Address</p>
                  <p className="font-medium">{networkInfo.ip || 'Loading...'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Wifi className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">ISP</p>
                  <p className="font-medium text-sm">{networkInfo.isp || 'Loading...'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium text-sm">{networkInfo.location || 'Loading...'}</p>
                </div>
              </div>
            </div>

            {/* Test Control */}
            <div className="text-center space-y-4">
              {!isRunning ? (
                <Button
                  size="lg"
                  onClick={startSpeedTest}
                  className="w-full md:w-auto px-8"
                >
                  <Activity className="h-5 w-5 mr-2" />
                  Start Speed Test
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={stopSpeedTest}
                  className="w-full md:w-auto px-8"
                >
                  Stop Test
                </Button>
              )}

              {isRunning && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">{getStageText()}</p>
                  <Progress value={testProgress.progress} className="h-2" />
                  {testProgress.currentSpeed > 0 && (
                    <p className="text-lg font-bold">
                      {testProgress.currentSpeed} Mbps
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Real-time Speed Graph */}
            {(isRunning || speedData.length > 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Real-time Speed Chart
                </h3>
                <SpeedGraph />
              </motion.div>
            )}

            {/* Results */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border">
                  <SpeedGauge value={result.downloadSpeed} label="Download" icon={Download} />
                  <SpeedGauge value={result.uploadSpeed} label="Upload" icon={Upload} />
                  <SpeedGauge value={result.ping} label="Ping" icon={Activity} max={100} />
                  <SpeedGauge value={result.jitter} label="Jitter" icon={Activity} max={50} />
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Test completed at</p>
                      <p className="font-medium">{result.timestamp.toLocaleString()}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const text = `Speed Test Results:\n` +
                          `Download: ${result.downloadSpeed} Mbps\n` +
                          `Upload: ${result.uploadSpeed} Mbps\n` +
                          `Ping: ${result.ping} ms\n` +
                          `Jitter: ${result.jitter} ms\n` +
                          `IP: ${result.ip}\n` +
                          `ISP: ${result.isp}`;
                        navigator.clipboard.writeText(text);
                        toast.success('Results copied to clipboard!');
                      }}
                    >
                      Copy Results
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Tests
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {history.map((test, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Download className="h-4 w-4 text-green-500" />
                          <span className="font-medium">{test.downloadSpeed}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Upload className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{test.uploadSpeed}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">{test.ping}ms</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {test.timestamp.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AnimatedElement>
  );
};

export default SpeedTest;
