import React, { useRef, useCallback } from 'react';

interface UsePinchZoomProps {
    settings: any;
    setSettings: React.Dispatch<React.SetStateAction<any>>;
    storageKey: string;
}

export const usePinchZoom = ({ settings, setSettings, storageKey }: UsePinchZoomProps) => {
    const initialPinchDistanceRef = useRef<number | null>(null);
    const initialPinchFontSizeRef = useRef<number | null>(null);
    const settingsRef = useRef(settings);

    // Keep settingsRef updated
    React.useEffect(() => {
        settingsRef.current = settings;
    }, [settings]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
            initialPinchDistanceRef.current = distance;
            initialPinchFontSizeRef.current = settingsRef.current.fontSize;
        }
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2 && initialPinchDistanceRef.current !== null && initialPinchFontSizeRef.current !== null) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
            
            const scaleFactor = distance / initialPinchDistanceRef.current;
            const newFontSize = Math.min(Math.max(initialPinchFontSizeRef.current * scaleFactor, 1.0), 5.0);
            
            setSettings((prev: any) => ({ ...prev, fontSize: newFontSize }));
        }
    }, [setSettings]);

    const handleTouchEnd = useCallback(() => {
        if (initialPinchDistanceRef.current !== null) {
             localStorage.setItem(storageKey, JSON.stringify(settingsRef.current));
             window.dispatchEvent(new Event('settings-change'));
        }
        initialPinchDistanceRef.current = null;
        initialPinchFontSizeRef.current = null;
    }, [storageKey]);

    return {
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd
    };
};
