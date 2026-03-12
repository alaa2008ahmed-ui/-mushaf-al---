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
    const timerRef = useRef<number | null>(null);
    const scrollAccumulatorRef = useRef(0);
    const elapsedTimeRef = useRef(0);
    const prevSettingsRef = useRef({ fontSize: settings.fontSize, scrollMinutes: settings.scrollMinutes });

    const stopAutoScroll = useCallback((showTimer = true) => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        autoScrollPausedRef.current = false;
        scrollAccumulatorRef.current = 0;
        
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

    const getAveragePageSize = useCallback(() => {
        const content = mushafContentRef.current;
        const PAGE_SIZE_FALLBACK = isHorizontal ? window.innerWidth : (window.innerHeight || 800);
        if (!content) return PAGE_SIZE_FALLBACK;
        
        const pages = content.querySelectorAll(isHorizontal ? '.horizontal-mushaf-page' : '.mushaf-page');
        if (!pages.length) return isHorizontal ? (content.clientWidth || PAGE_SIZE_FALLBACK) : (content.clientHeight || PAGE_SIZE_FALLBACK);
        
        let total = 0;
        let count = 0;
        pages.forEach((page: any) => {
            const size = isHorizontal ? page.offsetWidth : page.offsetHeight;
            if (size) { total += size; count++; }
        });
        return count ? (total / count) : (isHorizontal ? (content.clientWidth || PAGE_SIZE_FALLBACK) : (content.clientHeight || PAGE_SIZE_FALLBACK));
    }, [mushafContentRef, isHorizontal]);

    const startScrollInterval = useCallback(() => {
        const content = mushafContentRef.current;
        if (!content) return;

        const minutesPerJuz = parseInt(settings.scrollMinutes, 10) || 20;
        const tickRate = 20;
        const PAGES_PER_JUZ = 20;
        const pageSize = getAveragePageSize();
        const totalPixels = pageSize * PAGES_PER_JUZ;
        const totalTimeMs = minutesPerJuz * 60 * 1000;
        
        if (totalPixels <= 0 || totalTimeMs <= 0) return;

        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = window.setInterval(() => {
            if (autoScrollPausedRef.current || isUserInteractingRef.current) return;
            
            elapsedTimeRef.current += tickRate;
            const pixelsPerTick = (totalPixels / totalTimeMs) * tickRate;
            scrollAccumulatorRef.current += pixelsPerTick;
            
            if (scrollAccumulatorRef.current >= 1) {
                const pixelsToMove = Math.floor(scrollAccumulatorRef.current);
                
                if (isHorizontal) {
                    const isRTL = window.getComputedStyle(content).direction === 'rtl';
                    if (isRTL) {
                        content.scrollLeft -= pixelsToMove;
                    } else {
                        content.scrollLeft += pixelsToMove;
                    }
                } else {
                    content.scrollTop += pixelsToMove;
                }
                
                scrollAccumulatorRef.current -= pixelsToMove;
                
                const now = Date.now();
                if (now - lastHeaderUpdateRef.current > 250) {
                    updateHeadersDuringAutoScroll();
                    lastHeaderUpdateRef.current = now;
                }
            }
        }, tickRate);
    }, [mushafContentRef, settings.scrollMinutes, getAveragePageSize, isHorizontal, updateHeadersDuringAutoScroll, autoScrollPausedRef]);

    const startAutoScroll = useCallback((keepState = false) => {
        if (!mushafContentRef.current) return;
        
        if (timerRef.current) clearInterval(timerRef.current);
        
        if (!keepState) {
            elapsedTimeRef.current = 0;
            setAutoScrollState({ isActive: true, isPaused: false, elapsedTime: 0 });
            scrollAccumulatorRef.current = 0;
        }
        
        autoScrollPausedRef.current = false;
        startScrollInterval();
    }, [mushafContentRef, startScrollInterval, setAutoScrollState, autoScrollPausedRef]);

    useEffect(() => {
        if (
            prevSettingsRef.current.fontSize !== settings.fontSize ||
            prevSettingsRef.current.scrollMinutes !== settings.scrollMinutes
        ) {
            prevSettingsRef.current = { fontSize: settings.fontSize, scrollMinutes: settings.scrollMinutes };
            
            if (autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused) {
                startScrollInterval();
            }
        }
    }, [settings.fontSize, settings.scrollMinutes, startScrollInterval, autoScrollStateRef]);

    const toggleAutoScroll = useCallback(() => {
        if (autoScrollStateRef.current.isActive) stopAutoScroll();
        else { startAutoScroll(false); showToast('تم تفعيل التمرير التلقائي'); }
    }, [stopAutoScroll, startAutoScroll, showToast, autoScrollStateRef]);

    const pauseResumeAutoScroll = useCallback(() => {
      if (autoScrollStateRef.current.isActive) {
        const newPausedState = !autoScrollStateRef.current.isPaused;
        autoScrollPausedRef.current = newPausedState;
        
        setAutoScrollState(p => ({
            ...p, 
            isPaused: newPausedState,
            elapsedTime: Math.floor(elapsedTimeRef.current / 1000)
        }));
      }
    }, [setAutoScrollState, autoScrollPausedRef, autoScrollStateRef]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return {
        stopAutoScroll,
        startAutoScroll,
        toggleAutoScroll,
        pauseResumeAutoScroll
    };
};
