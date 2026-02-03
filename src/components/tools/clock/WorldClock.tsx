'use client';

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { CityTimezone } from '@/data/timezones';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps';
import { useVirtualizer } from '@tanstack/react-virtual';

/* ------------------------------------------------------------------ */
/* Utils */
/* ------------------------------------------------------------------ */

function useDebouncedValue<T>(value: T, delay = 150) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

/* ------------------------------------------------------------------ */

const GEO_URL =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const MAX_RESULTS = 1000;

const WorldClock: React.FC = () => {
  const [query, setQuery] = useState('');
  const [now, setNow] = useState(new Date());
  const [selectedCity, setSelectedCity] =
    useState<CityTimezone | null>(null);
  const [timezones, setTimezones] = useState<CityTimezone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const debouncedQuery = useDebouncedValue(query);

  /* ---------------- Load Timezones Data ---------------- */
  useEffect(() => {
    fetch('/timezones.json')
      .then((res) => res.json())
      .then((data) => {
        setTimezones(data.timezones);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load timezones:', err);
        setIsLoading(false);
      });
  }, []);

  /* ---------------- Clock Tick ---------------- */
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ---------------- Pre-index Cities ---------------- */
  const cityIndex = useMemo(
    () =>
      timezones.map((c) => ({
        ...c,
        cityLower: c.city.toLowerCase(),
        countryLower: c.country.toLowerCase(),
      })),
    [timezones]
  );

  /* ---------------- Smart Search ---------------- */
  const filteredCities = useMemo(() => {
    if (!debouncedQuery.trim()) return [];

    const q = debouncedQuery.toLowerCase();

    /* 1️⃣ Country intent (exact or prefix) */
    const countryMatches = cityIndex.filter(
      (c) =>
        c.countryLower === q ||
        c.countryLower.startsWith(q)
    );

    if (countryMatches.length > 0) {
      return countryMatches.slice(0, MAX_RESULTS);
    }

    /* 2️⃣ Starts-with (high priority) */
    const startsWith = cityIndex.filter(
      (c) =>
        c.cityLower.startsWith(q) ||
        c.countryLower.startsWith(q)
    );

    /* 3️⃣ Includes (lower priority) */
    const includes = cityIndex.filter(
      (c) =>
        c.cityLower.includes(q) ||
        c.countryLower.includes(q)
    );

    /* Merge safely */
    const seen = new Set<string>();
    const merged: CityTimezone[] = [];

    for (const c of [...startsWith, ...includes]) {
      const key = `${c.city}-${c.country}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(c);
        if (merged.length >= MAX_RESULTS) break;
      }
    }

    return merged;
  }, [debouncedQuery, cityIndex]);

  /* ---------------- Virtualization ---------------- */
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredCities.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
  });

  /* ---------------- Time Formatter ---------------- */
  const formattedTime = (tz: string) =>
    new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    }).format(now);

  /* ------------------------------------------------------------------ */

  return (
    <Card className="mt-6">
      <CardContent className="pt-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading timezones...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">

          {/* ---------------- SEARCH MODE ---------------- */}
          {!selectedCity && (
            <>
              <Input
                placeholder="Search city or country (Tokyo, India, New York)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="w-full px-2 text-xs text-muted-foreground">If you can't find your city, try searching by your country name.</div>

              {query && (
                <div className="w-full space-y-2">
                  <div className="px-2 text-xs text-muted-foreground">
                    {filteredCities.length} result
                    {filteredCities.length !== 1 ? 's' : ''}
                  </div>

                  {filteredCities.length > 0 ? (
                    <div
                      ref={parentRef}
                      className="w-full max-h-64 overflow-auto border rounded-md"
                    >
                      <div
                        style={{
                          height: rowVirtualizer.getTotalSize(),
                          position: 'relative',
                        }}
                      >
                        {rowVirtualizer
                          .getVirtualItems()
                          .map((row) => {
                            const city =
                              filteredCities[row.index];

                            return (
                              <Button
                                key={`${city.city}-${city.country}`}
                                variant="ghost"
                                className="absolute w-full justify-start"
                                style={{
                                  transform: `translateY(${row.start}px)`,
                                }}
                                onClick={() =>
                                  setSelectedCity(city)
                                }
                              >
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">
                                    {city.city}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {city.country}
                                  </span>
                                </div>
                              </Button>
                            );
                          })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground border rounded-md">
                      <div>No cities found</div>
                      <div className="mt-1 text-xs">If you can't find your city, try searching by your country name.</div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ---------------- CLOCK MODE ---------------- */}
          {selectedCity && (
            <>
              <div className="text-center">
                <div className="text-2xl font-semibold">
                  {selectedCity.city}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedCity.country}
                </div>
              </div>

              <div className="text-6xl font-mono font-bold">
                {formattedTime(selectedCity.timezone)}
              </div>

              {/* ---------------- MAP ---------------- */}
              <div className="w-full max-w-2xl rounded-lg border overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-900">
                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{
                    center: [
                      selectedCity.lng,
                      selectedCity.lat,
                    ],
                    scale: 400,
                  }}
                  width={800}
                  height={400}
                  style={{ width: '100%', height: 'auto' }}
                >
                  <Geographies geography={GEO_URL}>
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill="#10B981"
                          stroke="#059669"
                          strokeWidth={1}
                          style={{
                            default: { outline: 'none' },
                            hover: {
                              outline: 'none',
                              fill: '#34D399',
                            },
                            pressed: { outline: 'none' },
                          }}
                        />
                      ))
                    }
                  </Geographies>

                  <Marker
                    coordinates={[
                      selectedCity.lng,
                      selectedCity.lat,
                    ]}
                  >
                    <g
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="2"
                      transform="translate(-12, -24)"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                      <circle
                        cx="12"
                        cy="9"
                        r="2.5"
                        fill="#EF4444"
                      />
                    </g>
                  </Marker>
                </ComposableMap>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCity(null);
                  setQuery('');
                }}
              >
                Change Location
              </Button>
            </>
          )}
        </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorldClock;
