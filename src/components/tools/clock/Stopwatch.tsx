'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CopyIcon, Pencil1Icon, ImageIcon } from '@radix-ui/react-icons';
import { toast } from '@/components/ui/sonner';
import { Input } from '@/components/ui/input';

/* ------------------------------------------------------------------ */

interface Timestamp {
  time: number;
  formattedTime: string;
  delta: number;
  formattedDelta: string;
  reference?: string;
}

const STORAGE_KEY = 'stopwatch-v5';

/* ------------------------------------------------------------------ */

const Stopwatch: React.FC = () => {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timestamps, setTimestamps] = useState<Timestamp[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false);
  const soundTimeoutRef = useRef<number | null>(null);

  /* ------------------------------------------------------------------ */
  /* Init + Recovery */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    audioRef.current = new Audio('/sounds/alarm.wav');
    audioRef.current.preload = 'auto';

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const s = JSON.parse(saved);
      setElapsed(s.elapsed ?? 0);
      setTimestamps(s.timestamps ?? []);
      if (s.isRunning && s.lastTick) {
        const drift = performance.now() - s.lastTick;
        startTimeRef.current = performance.now() - (s.elapsed + drift);
        setIsRunning(true);
      }
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /* Persist */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        elapsed,
        timestamps,
        isRunning,
        lastTick: lastTickRef.current,
      })
    );
  }, [elapsed, timestamps, isRunning]);

  /* ------------------------------------------------------------------ */
  /* 🔑 Audio unlock */
  /* ------------------------------------------------------------------ */

  const unlockAudio = async () => {
    if (!audioRef.current || audioUnlockedRef.current) return;
    try {
      audioRef.current.volume = 0.01;
      await audioRef.current.play();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1;
      audioUnlockedRef.current = true;
    } catch {}
  };

  /* ------------------------------------------------------------------ */
  /* 🔊 Stop sound (1s) */
  /* ------------------------------------------------------------------ */

  const playStopSound = () => {
    if (!audioUnlockedRef.current || !audioRef.current) return;

    if (soundTimeoutRef.current) clearTimeout(soundTimeoutRef.current);

    const audio = audioRef.current;
    audio.currentTime = 0;
    audio.play().catch(() => {});

    soundTimeoutRef.current = window.setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
      soundTimeoutRef.current = null;
    }, 1000);
  };

  /* ------------------------------------------------------------------ */
  /* 📱 Vibration */
  /* ------------------------------------------------------------------ */

  const vibrateLap = () => {
    if ('vibrate' in navigator) navigator.vibrate(40);
  };

  const vibrateStop = () => {
    if ('vibrate' in navigator)
      navigator.vibrate([200, 100, 200, 100, 400]);
  };

  /* ------------------------------------------------------------------ */
  /* Timing loop */
  /* ------------------------------------------------------------------ */

  const tick = () => {
    if (!startTimeRef.current) return;
    lastTickRef.current = performance.now();
    setElapsed(lastTickRef.current - startTimeRef.current);
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (isRunning) rafRef.current = requestAnimationFrame(tick);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [isRunning]);

  /* ------------------------------------------------------------------ */
  /* Helpers */
  /* ------------------------------------------------------------------ */

  const formatTime = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
  };

  const lapStats = (() => {
    if (timestamps.length === 0) return null;
    const deltas = timestamps.map((t) => t.delta);
    const fastest = Math.min(...deltas);
    const slowest = Math.max(...deltas);
    const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    return { fastest, slowest, avg };
  })();

  /* ------------------------------------------------------------------ */
  /* Actions */
  /* ------------------------------------------------------------------ */

  const startStop = async () => {
    await unlockAudio();
    if (!isRunning) {
      startTimeRef.current = performance.now() - elapsed;
      setIsRunning(true);
    } else {
      setIsRunning(false);
      playStopSound();
      vibrateStop();
    }
  };

  const reset = () => {
    if (isRunning) return;
    setElapsed(0);
    setTimestamps([]);
    startTimeRef.current = null;
  };

  const addLap = () => {
    if (!isRunning) return;
    vibrateLap();
    const last = timestamps[timestamps.length - 1];
    const delta = last ? elapsed - last.time : elapsed;

    setTimestamps((prev) => [
      ...prev,
      {
        time: elapsed,
        formattedTime: formatTime(elapsed),
        delta,
        formattedDelta: formatTime(delta),
        reference: `Lap ${prev.length + 1}`,
      },
    ]);
  };

  /* ------------------------------------------------------------------ */
  /* ⌨️ Keyboard shortcuts */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement)?.tagName === 'INPUT' ||
        (e.target as HTMLElement)?.isContentEditable
      )
        return;

      if (e.code === 'Space') {
        e.preventDefault();
        startStop();
      }
      if (e.key.toLowerCase() === 'l') addLap();
      if (e.key.toLowerCase() === 'r') reset();
      if (e.key.toLowerCase() === 'e') handleExport(e);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isRunning, elapsed, timestamps]);

  /* ------------------------------------------------------------------ */
  /* Export */
  /* ------------------------------------------------------------------ */

  const exportCSV = () => {
    const stats = lapStats;
    const csv =
      'Lap,Time,Delta\n' +
      timestamps
        .map(
          (t) =>
            `${t.reference},${t.formattedTime},${t.formattedDelta}`
        )
        .join('\n') +
      (stats
        ? `\n\nFastest,${formatTime(stats.fastest)}\nSlowest,${formatTime(
            stats.slowest
          )}\nAverage,${formatTime(stats.avg)}`
        : '');

    download(csv, 'stopwatch.csv', 'text/csv');
  };

  const exportJSON = () => {
    download(
      JSON.stringify({ timestamps, stats: lapStats }, null, 2),
      'stopwatch.json',
      'application/json'
    );
  };

  const handleExport = (e: KeyboardEvent | React.MouseEvent) => {
    if ('shiftKey' in e && e.shiftKey) return exportCSV();
    if ('altKey' in e && e.altKey) return exportJSON();

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 900;
    canvas.height = Math.max(220, 140 + timestamps.length * 28);

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#000';
    ctx.font = '24px monospace';
    ctx.fillText('Stopwatch Laps', 20, 40);

    ctx.font = '16px monospace';
    timestamps.forEach((t, i) =>
      ctx.fillText(
        `${t.reference} ${t.formattedTime} Δ ${t.formattedDelta}`,
        20,
        80 + i * 26
      )
    );

    if (lapStats) {
      ctx.fillText(
        `Fastest: ${formatTime(lapStats.fastest)}  Avg: ${formatTime(
          lapStats.avg
        )}  Slowest: ${formatTime(lapStats.slowest)}`,
        20,
        canvas.height - 20
      );
    }

    download(canvas.toDataURL('image/png'), 'stopwatch.png');
  };

  const download = (data: string, name: string, type?: string) => {
    const blob =
      type === 'text/csv' || type === 'application/json'
        ? new Blob([data], { type })
        : null;

    const link = document.createElement('a');
    link.href = blob ? URL.createObjectURL(blob) : data;
    link.download = name;
    link.click();
  };

  /* ------------------------------------------------------------------ */

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-6">
          <div className="text-6xl font-mono font-bold">
            {formatTime(elapsed)}
          </div>

          <div className="flex space-x-4">
            <Button
              onClick={startStop}
              variant={isRunning ? 'destructive' : 'default'}
            >
              {isRunning ? 'Stop' : 'Start'}
            </Button>
            <Button
              onClick={reset}
              variant="outline"
              disabled={isRunning}
            >
              Reset
            </Button>
            {isRunning && (
              <Button onClick={addLap} variant="secondary">
                Add Timestamp
              </Button>
            )}
          </div>

          {timestamps.length > 0 && (
            <ScrollArea className="h-[200px] w-full border rounded-md p-4">
              <div className="space-y-2">
                <div className="flex justify-end mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                  >
                    <ImageIcon className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>

                {timestamps.map((t, i) => (
                  <div key={i} className="flex justify-between">
                    {editingIndex === i ? (
                      <Input
                        value={t.reference}
                        onChange={(e) => {
                          const copy = [...timestamps];
                          copy[i].reference = e.target.value;
                          setTimestamps(copy);
                        }}
                        onBlur={() => setEditingIndex(null)}
                        autoFocus
                        className="w-40 font-mono"
                      />
                    ) : (
                      <span className="font-mono">
                        {t.reference} – {t.formattedTime} (Δ{' '}
                        {t.formattedDelta})
                      </span>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingIndex(i)}
                    >
                      <Pencil1Icon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Stopwatch;
