'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/* ------------------------------------------------------------------ */

type AlarmInput = {
  hours: string;
  minutes: string;
  seconds: string;
};

const ALARM_SOUND = '/sounds/alarm.wav';
const STORAGE_KEY = 'alarm-v4';
const DEFAULT_SNOOZE_MIN = 5;

/* ------------------------------------------------------------------ */

const CurrentTime: React.FC = () => {
  const [now, setNow] = useState(new Date());
  const [timezone, setTimezone] = useState('');
  const [gmtOffset, setGmtOffset] = useState('');

  const [alarmInput, setAlarmInput] = useState<AlarmInput>({
    hours: '',
    minutes: '',
    seconds: '',
  });

  const [alarmActive, setAlarmActive] = useState(false);
  const [targetTime, setTargetTime] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const soundTimeoutRef = useRef<number | null>(null);

  const hasAlarmFiredRef = useRef(false); // 🔥 critical fix

  /* ---------------- CLOCK ---------------- */
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(tz);

    const offsetMinutes = new Date().getTimezoneOffset();
    const sign = offsetMinutes > 0 ? '-' : '+';
    const h = Math.floor(Math.abs(offsetMinutes) / 60);
    const m = Math.abs(offsetMinutes) % 60;

    setGmtOffset(
      `GMT${sign}${h.toString().padStart(2, '0')}:${m
        .toString()
        .padStart(2, '0')}`
    );

    audioRef.current = new Audio(ALARM_SOUND);
    audioRef.current.preload = 'auto';

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const s = JSON.parse(saved);
      if (s.targetTime) {
        setTargetTime(new Date(s.targetTime));
        setAlarmActive(true);
      }
    }
  }, []);

  /* ---------------- PERSIST ---------------- */
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ targetTime })
    );
  }, [targetTime]);

  /* ---------------- AUDIO UNLOCK ---------------- */
  const unlockAudio = async () => {
    if (!audioRef.current || audioUnlockedRef.current) return;
    try {
      audioRef.current.volume = 0.05;
      await audioRef.current.play();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1;
      audioUnlockedRef.current = true;
    } catch (err) {
      console.warn('Audio unlock failed:', err);
    }
  };

  /* ---------------- NOTIFICATION ---------------- */
  const ensureNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (err) {
        console.warn('Notification permission denied:', err);
      }
    }
  };

  const notifyOnce = (title: string, body?: string) => {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    new Notification(title, { body, silent: true });
  };

  /* ---------------- VIBRATION ---------------- */
  const vibrateAlarm = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([300, 150, 300, 150, 600]);
    }
  };

  /* ---------------- COUNTDOWN ENGINE ---------------- */
  useEffect(() => {
    if (!alarmActive || !targetTime) return;

    const tick = () => {
      const diff = targetTime.getTime() - Date.now();

      if (diff <= 0) {
        if (!hasAlarmFiredRef.current) {
          triggerAlarm();
        }
        return;
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setCountdown(
        `${h.toString().padStart(2, '0')}:${m
          .toString()
          .padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [alarmActive, targetTime]);

  /* ---------------- HELPERS ---------------- */
  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);

  const parseAlarmDuration = () => {
    const h = Math.max(0, Number(alarmInput.hours || 0));
    const m = Math.min(59, Math.max(0, Number(alarmInput.minutes || 0)));
    const s = Math.min(59, Math.max(0, Number(alarmInput.seconds || 0)));
    return (h * 3600 + m * 60 + s) * 1000;
  };

  /* ---------------- ACTIONS ---------------- */
  const setAlarm = async () => {
    const duration = parseAlarmDuration();
    if (duration <= 0) return;

    await unlockAudio();
    await ensureNotificationPermission();

    hasAlarmFiredRef.current = false;
    setTargetTime(new Date(Date.now() + duration));
    setAlarmActive(true);
  };

  const quickAlarm = async (minutes: number) => {
    await unlockAudio();
    await ensureNotificationPermission();

    hasAlarmFiredRef.current = false;
    setAlarmInput({ hours: '0', minutes: minutes.toString(), seconds: '0' });
    setTargetTime(new Date(Date.now() + minutes * 60000));
    setAlarmActive(true);
  };

  const triggerAlarm = () => {
    hasAlarmFiredRef.current = true;

    notifyOnce('⏰ Alarm', 'Time is up');
    vibrateAlarm();

    if (!audioRef.current || !audioUnlockedRef.current) return;

    const audio = audioRef.current;
    audio.currentTime = 0;
    audio.play().catch(() => {});

    soundTimeoutRef.current = window.setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, 5000);
  };

  const stopAlarm = () => {
    // 🛑 FULL ABORT (NO SNOOZE)
    setAlarmActive(false);
    setTargetTime(null);
    setCountdown('');
    hasAlarmFiredRef.current = false;

    if (intervalRef.current) clearInterval(intervalRef.current);
    if (soundTimeoutRef.current) clearTimeout(soundTimeoutRef.current);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4">
          <div className="text-6xl font-bold">{formatTime(now)}</div>

          {alarmActive && countdown && (
            <div className="text-2xl font-mono text-primary">
              Countdown: {countdown}
            </div>
          )}

          <div className="text-xl text-muted-foreground">
            {formatDate(now)}
          </div>

          <div className="text-sm text-muted-foreground">
            {timezone} ({gmtOffset})
          </div>

          <div className="w-full max-w-xs space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {(['hours', 'minutes', 'seconds'] as const).map((unit) => (
                <div key={unit}>
                  <Label>{unit.toUpperCase()}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={unit === 'hours' ? 23 : 59}
                    value={alarmInput[unit]}
                    disabled={alarmActive}
                    onChange={(e) =>
                      setAlarmInput({
                        ...alarmInput,
                        [unit]: e.target.value,
                      })
                    }
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-2">
              <Button onClick={setAlarm} disabled={alarmActive}>
                Set Alarm
              </Button>

              <Button
                variant="outline"
                onClick={() => quickAlarm(5)}
                disabled={alarmActive}
              >
                +5 Min
              </Button>

              {alarmActive && (
                <Button variant="destructive" onClick={stopAlarm}>
                  Stop
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentTime;
