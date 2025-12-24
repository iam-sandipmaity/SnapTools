'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/* ------------------------------------------------------------------ */
/* Config */
/* ------------------------------------------------------------------ */

const PRESETS = [
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '25 min', seconds: 1500 },
];

const WORK = 25 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;

const STORAGE_KEY = 'single-timer-v4';

/* ------------------------------------------------------------------ */

type TimerMode = 'normal' | 'pomodoro';
type TimerState = 'idle' | 'running' | 'paused';

const Timer: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>('normal');
  const [state, setState] = useState<TimerState>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);

  const [input, setInput] = useState({
    hours: '',
    minutes: '',
    seconds: '',
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false);

  /* ------------------------------------------------------------------ */
  /* Init */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    audioRef.current = new Audio('/sounds/alarm.wav');
    audioRef.current.preload = 'auto';

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const s = JSON.parse(saved);
      setMode(s.mode);
      setState(s.state);
      setTimeLeft(s.timeLeft);
      setTotalTime(s.totalTime);
      setIsBreak(s.isBreak);
      setPomodoroCount(s.pomodoroCount);
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /* Persist */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        mode,
        state,
        timeLeft,
        totalTime,
        isBreak,
        pomodoroCount,
      })
    );
  }, [mode, state, timeLeft, totalTime, isBreak, pomodoroCount]);

  /* ------------------------------------------------------------------ */
  /* 🔑 Audio unlock (gesture-safe) */
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
    } catch {
      // Browser blocked – user gesture required
    }
  };

  const playSound = () => {
    if (!audioUnlockedRef.current) return;
    audioRef.current?.play().catch(() => {});
  };

  /* ------------------------------------------------------------------ */
  /* 🔔 Notification (gesture-safe permission) */
  /* ------------------------------------------------------------------ */

  const ensureNotificationPermission = async () => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch {}
    }
  };

  const notify = (title: string, body?: string) => {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    new Notification(title, {
      body,
      silent: true, // we already handle sound/vibration
    });
  };

  /* ------------------------------------------------------------------ */
  /* 📱 Mobile vibration (strong pattern) */
  /* ------------------------------------------------------------------ */

  const vibrateEnd = () => {
    if (!('vibrate' in navigator)) return;

    navigator.vibrate([
      300, 150,
      300, 150,
      600,
    ]);
  };

  /* ------------------------------------------------------------------ */
  /* Timer Engine */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (state !== 'running') return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          playSound();
          vibrateEnd();

          if (mode === 'pomodoro') {
            const next = pomodoroCount + 1;
            const longBreak = next % 4 === 0;

            const nextTime = isBreak
              ? WORK
              : longBreak
              ? LONG_BREAK
              : SHORT_BREAK;

            notify(
              isBreak ? 'Work Time 💻' : 'Break Time ☕',
              isBreak
                ? 'Time to focus again'
                : 'Take a short break'
            );

            setPomodoroCount(next);
            setIsBreak(!isBreak);
            setTotalTime(nextTime);

            return nextTime;
          }

          notify('Timer Finished ⏱', 'Your countdown is complete');
          setState('idle');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [state, mode, isBreak, pomodoroCount]);

  /* ------------------------------------------------------------------ */
  /* Helpers */
  /* ------------------------------------------------------------------ */

  const format = (s: number) =>
    `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(
      Math.floor((s % 3600) / 60)
    ).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const startWithSeconds = async (sec: number) => {
    await unlockAudio();
    await ensureNotificationPermission();

    setTotalTime(sec);
    setTimeLeft(sec);
    setState('running');
  };

  const startManual = async () => {
    const h = Number(input.hours) || 0;
    const m = Number(input.minutes) || 0;
    const s = Number(input.seconds) || 0;
    const total = h * 3600 + m * 60 + s;
    if (total > 0) startWithSeconds(total);
  };

  const stop = () => {
    clearInterval(intervalRef.current!);
    setState('idle');
    setTimeLeft(0);
    setTotalTime(0);
  };

  /* ------------------------------------------------------------------ */
  /* Progress Ring (Light / Dark) */
  /* ------------------------------------------------------------------ */

  const progress =
    totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (progress / 100) * circumference;

  const isDark =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  const ringColor = isDark ? '#22c55e' : '#10b981';
  const trackColor = isDark ? '#1f2937' : '#e5e7eb';

  /* ------------------------------------------------------------------ */

  return (
    <Card className="mt-6">
      <CardContent className="pt-6 space-y-6">
        <div className="flex flex-col items-center gap-6">

          {/* ⭕ Progress Ring (UI UNCHANGED) */}
          <svg width="220" height="220">
            <circle
              cx="110"
              cy="110"
              r={radius}
              stroke={trackColor}
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="110"
              cy="110"
              r={radius}
              stroke={ringColor}
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 110 110)"
            />
            <text
              x="50%"
              y="50%"
              dy="0.35em"
              textAnchor="middle"
              className="text-2xl font-mono fill-current"
            >
              {format(timeLeft)}
            </text>
          </svg>

          {/* Presets + Pomodoro (UI UNCHANGED) */}
          <div className="flex gap-2 flex-wrap justify-center">
            {PRESETS.map((p) => (
              <Button
                key={p.label}
                variant="outline"
                onClick={() => {
                  setMode('normal');
                  setIsBreak(false);
                  startWithSeconds(p.seconds);
                }}
              >
                {p.label}
              </Button>
            ))}
            <Button
              variant={mode === 'pomodoro' ? 'default' : 'outline'}
              onClick={() => {
                setMode('pomodoro');
                setIsBreak(false);
                setPomodoroCount(0);
                startWithSeconds(WORK);
              }}
            >
              Pomodoro
            </Button>
          </div>

          {/* Manual Input (UI UNCHANGED) */}
          <div className="grid grid-cols-3 gap-2 w-full max-w-md">
            {(['hours', 'minutes', 'seconds'] as const).map((u) => (
              <div key={u}>
                <Label>{u.toUpperCase()}</Label>
                <Input
                  type="number"
                  min={0}
                  max={u === 'hours' ? 23 : 59}
                  disabled={state === 'running'}
                  value={input[u]}
                  onChange={(e) =>
                    setInput({ ...input, [u]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>

          {/* Controls (UI UNCHANGED) */}
          <div className="flex gap-2">
            {state !== 'running' && (
              <Button onClick={startManual}>Start</Button>
            )}
            {state === 'running' && (
              <Button onClick={() => setState('paused')}>
                Pause
              </Button>
            )}
            {state === 'paused' && (
              <Button onClick={() => setState('running')}>
                Resume
              </Button>
            )}
            <Button variant="destructive" onClick={stop}>
              Stop
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Timer;
