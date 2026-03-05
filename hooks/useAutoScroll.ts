import React, { useRef, useCallback, useEffect } from 'react';

interface UseAutoScrollProps {
    mushafContentRef: React.RefObject<HTMLDivElement>;
    settings: any;
    showToast: (message: string) => void;
    updateHeadersDuringAutoScroll: () => void;
    isHorizontal?: boolean;
    autoScrollState: any;
    setAutoScrollState: React.Dispatch<React.SetStateAction<any>>;
    autoScrollStateRef: React.MutableRefObject<any>;
    autoScrollPausedRef: React.MutableRefObject<boolean>;
}

export const useAutoScroll = ({
    mushafContentRef,
    settings,
    showToast,
    updateHeadersDuringAutoScroll,
    isHorizontal = false,
    autoScrollState,
    setAutoScrollState,
    autoScrollStateRef,
    autoScrollPausedRef
}: UseAutoScrollProps) => {
    const requestRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number | null>(null);
    const scrollAccumulatorRef = useRef(0);
    const elapsedTimeRef = useRef(0);
    const prevSettingsRef = useRef({ fontSize: settings.fontSize, scrollMinutes: settings.scrollMinutes });
    const speedRef = useRef(0); // pixels per millisecond

    const stopAutoScroll = useCallback((showTimer = true) => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
        lastTimeRef.current = null;
        autoScrollPausedRef.current = false;
        
        // Update state once with final elapsed time
        setAutoScrollState(prev => ({ 
            ...prev, 
            isActive: false, 
            isPaused: false,
            elapsedTime: Math.floor(elapsedTimeRef.current / 1000)
        }));
        
        if (showTimer) {
            setTimeout(() => {
                elapsedTimeRef.current = 0;
                setAutoScrollState(p => ({...p, elapsedTime: 0}));
            }, 3000);
        } else {
            elapsedTimeRef.current = 0;
            setAutoScrollState(p => ({...p, elapsedTime: 0}));
        }
    }, [setAutoScrollState, autoScrollPausedRef]);

    const isUserInteractingRef = useRef(false);
    const frameCounterRef = useRef(0);
    const lastHeaderUpdateRef = useRef(0);

    useEffect(() => {
        const content = mushafContentRef.current;
        if (!content) return;

        const handleStart = () => { isUserInteractingRef.current = true; };
        const handleEnd = () => { isUserInteractingRef.current = false; };

        // Touch events
        content.addEventListener('touchstart', handleStart, { passive: true });
        content.addEventListener('touchend', handleEnd, { passive: true });
        content.addEventListener('touchcancel', handleEnd, { passive: true });
        
        // Mouse events (for desktop/preview)
        content.addEventListener('mousedown', handleStart, { passive: true });
        content.addEventListener('mouseup', handleEnd, { passive: true });
        content.addEventListener('mouseleave', handleEnd, { passive: true });

        return () => {
            content.removeEventListener('touchstart', handleStart);
            content.removeEventListener('touchend', handleEnd);
            content.removeEventListener('touchcancel', handleEnd);
            content.removeEventListener('mousedown', handleStart);
            content.removeEventListener('mouseup', handleEnd);
            content.removeEventListener('mouseleave', handleEnd);
        };
    }, [mushafContentRef]);

        const calculateSpeed = useCallback(() => {
        if (!mushafContentRef.current) return 0;
        
        const minutesPerJuz = parseFloat(String(settings.scrollMinutes)) || 20;
        const content = mushafContentRef.current;
        
        // Optimize: Only query the first page instead of all pages to prevent layout thrashing
        const firstPage = content.querySelector(isHorizontal ? '.horizontal-mushaf-page' : '.mushaf-page') as HTMLElement;
        
        const PAGE_SIZE_FALLBACK = isHorizontal ? window.innerWidth : (window.innerHeight || 800);
        let pageSize = PAGE_SIZE_FALLBACK;
        
        if (firstPage) {
            pageSize = isHorizontal ? firstPage.offsetWidth : firstPage.offsetHeight;
        }
        
        // Safety check: if pageSize is suspiciously small
        if (pageSize < PAGE_SIZE_FALLBACK * 0.5) {
             pageSize = PAGE_SIZE_FALLBACK;
        }

        const PAGES_PER_JUZ = 20;
        const totalPixels = pageSize * PAGES_PER_JUZ;
        const totalTimeMs = minutesPerJuz * 60 * 1000;
        
        // Desktop (Preview) stays at 9.0 as requested.
        // Mobile (APK) gets the same multiplier now that the performance bug is fixed.
        const baseMultiplier = 9.0;
        const mobileFactor = 1.0;
        
        return totalTimeMs > 0 ? (totalPixels / totalTimeMs) * baseMultiplier * mobileFactor : 0;
    }, [mushafContentRef, settings.scrollMinutes, isHorizontal]);

    const isRTLRef = useRef<boolean | null>(null);

    const animateScroll = useCallback((time: number) => {
        if (!mushafContentRef.current) return;

        if (lastTimeRef.current !== null && !autoScrollPausedRef.current && !isUserInteractingRef.current) {
            const deltaTime = time - lastTimeRef.current;
            elapsedTimeRef.current += deltaTime;
            
            // Optimize: Call updateHeaders before modifying scroll position to avoid forced synchronous layout
            if (time - lastHeaderUpdateRef.current > 500) {
                updateHeadersDuringAutoScroll();
                lastHeaderUpdateRef.current = time;
            }
            
            const pixelsToMoveFloat = speedRef.current * deltaTime;
            scrollAccumulatorRef.current += pixelsToMoveFloat;
            
            if (scrollAccumulatorRef.current >= 1) {
                const pixelsToMove = Math.floor(scrollAccumulatorRef.current);
                
                if (isHorizontal) {
                    // Optimize: Cache RTL check instead of calling getComputedStyle every frame
                    if (isRTLRef.current === null) {
                        isRTLRef.current = window.getComputedStyle(mushafContentRef.current).direction === 'rtl' || document.documentElement.dir === 'rtl';
                    }
                    if (isRTLRef.current) {
                        mushafContentRef.current.scrollLeft -= pixelsToMove;
                    } else {
                        mushafContentRef.current.scrollLeft += pixelsToMove;
                    }
                } else {
                    mushafContentRef.current.scrollTop += pixelsToMove;
                }
                
                scrollAccumulatorRef.current -= pixelsToMove;
            }
        }
        
        lastTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animateScroll);
    }, [mushafContentRef, isHorizontal, updateHeadersDuringAutoScroll, autoScrollPausedRef]);

    const startAutoScroll = useCallback((keepState = false) => {
        if (!mushafContentRef.current) return;
        
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        
        if (!keepState) {
            elapsedTimeRef.current = 0;
            setAutoScrollState({ isActive: true, isPaused: false, elapsedTime: 0 });
            scrollAccumulatorRef.current = 0;
        }
        
        autoScrollPausedRef.current = false;
        lastTimeRef.current = null;
        speedRef.current = calculateSpeed();
        
        if (speedRef.current > 0) {
            requestRef.current = requestAnimationFrame(animateScroll);
        }
    }, [mushafContentRef, calculateSpeed, animateScroll, setAutoScrollState, autoScrollPausedRef]);

    useEffect(() => {
        if (
            prevSettingsRef.current.fontSize !== settings.fontSize ||
            prevSettingsRef.current.scrollMinutes !== settings.scrollMinutes
        ) {
            prevSettingsRef.current = { fontSize: settings.fontSize, scrollMinutes: settings.scrollMinutes };
            
            if (autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused) {
                // Recalculate speed immediately based on new settings
                speedRef.current = calculateSpeed();
            }
        }
    }, [settings.fontSize, settings.scrollMinutes, calculateSpeed, autoScrollStateRef]);

    const toggleAutoScroll = useCallback(() => {
        if (autoScrollStateRef.current.isActive) stopAutoScroll();
        else { startAutoScroll(false); showToast('تم تفعيل التمرير التلقائي'); }
    }, [stopAutoScroll, startAutoScroll, showToast, autoScrollStateRef]);

    const pauseResumeAutoScroll = useCallback(() => {
      if (autoScrollStateRef.current.isActive) {
        const newPausedState = !autoScrollStateRef.current.isPaused;
        autoScrollPausedRef.current = newPausedState;
        
        if (newPausedState) {
            // Pausing: clear lastTime so we don't jump when resuming
            lastTimeRef.current = null;
        }
        
        setAutoScrollState(p => ({
            ...p, 
            isPaused: newPausedState,
            elapsedTime: Math.floor(elapsedTimeRef.current / 1000)
        }));
      }
    }, [setAutoScrollState, autoScrollPausedRef, autoScrollStateRef]);

    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return {
        stopAutoScroll,
        startAutoScroll,
        toggleAutoScroll,
        pauseResumeAutoScroll
    };
};
