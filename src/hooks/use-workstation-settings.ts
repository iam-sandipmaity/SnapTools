import { useState, useEffect, useCallback } from "react";

export type WorkstationSettings = {
    soundEnabled: boolean;
    gridEnabled: boolean;
    ambientGlow: boolean;
    volume: number;
    terminalTheme: 'modern' | 'cyber' | 'minimal';
};

const DEFAULT_SETTINGS: WorkstationSettings = {
    soundEnabled: true,
    gridEnabled: true,
    ambientGlow: true,
    volume: 0.5,
    terminalTheme: 'modern'
};

export function useWorkstationSettings() {
    const [settings, setSettings] = useState<WorkstationSettings>(() => {
        if (typeof window === 'undefined') return DEFAULT_SETTINGS;
        const saved = localStorage.getItem('snaptools_ws_settings');
        return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    });

    const updateSetting = useCallback(<K extends keyof WorkstationSettings>(
        key: K,
        value: WorkstationSettings[K]
    ) => {
        setSettings(prev => {
            const next = { ...prev, [key]: value };
            localStorage.setItem('snaptools_ws_settings', JSON.stringify(next));
            return next;
        });
    }, []);

    return { settings, updateSetting };
}
