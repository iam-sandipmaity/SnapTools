import { useState, useEffect, useCallback } from "react";

/**
 * A hook that works like useState but persists the value to localStorage.
 * Ideal for "remembering" user preferences across sessions.
 * 
 * @param key The localStorage key to use
 * @param defaultValue The initial value if no value is found in localStorage
 */
export function useWorkspacePreference<T>(key: string, defaultValue: T) {
    const [state, setState] = useState<T>(() => {
        if (typeof window === "undefined") return defaultValue;

        try {
            const stored = localStorage.getItem(`snaptools_pref_${key}`);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return defaultValue;
        }
    });

    const setPersistentState = useCallback((value: T | ((prevState: T) => T)) => {
        setState((prevState) => {
            const newState = value instanceof Function ? value(prevState) : value;
            try {
                localStorage.setItem(`snaptools_pref_${key}`, JSON.stringify(newState));
            } catch (error) {
                console.warn(`Error writing localStorage key "${key}":`, error);
            }
            return newState;
        });
    }, [key]);

    return [state, setPersistentState] as const;
}
