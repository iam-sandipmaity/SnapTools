import { useState, useCallback, useEffect } from 'react';
import { playWorkstationSound } from '@/lib/sounds';

export function useFocusMode() {
    const [isFocusMode, setIsFocusMode] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('snaptools_focus_mode') === 'true';
    });

    const toggleFocusMode = useCallback(() => {
        setIsFocusMode((prev) => {
            const next = !prev;
            localStorage.setItem('snaptools_focus_mode', String(next));
            playWorkstationSound('focus');
            return next;
        });
    }, []);

    useEffect(() => {
        if (isFocusMode) {
            document.documentElement.classList.add('focus-mode');
        } else {
            document.documentElement.classList.remove('focus-mode');
        }
    }, [isFocusMode]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target as HTMLElement).isContentEditable
            ) {
                return;
            }

            if (e.key === 'F' && e.shiftKey) {
                toggleFocusMode();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleFocusMode]);

    return { isFocusMode, toggleFocusMode };
}
