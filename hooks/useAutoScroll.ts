import React, { useState, useRef, useCallback, useEffect } from 'react';

interface UseAutoScrollProps {
    mushafContentRef: React.RefObject<HTMLDivElement>;
    scrollMinutes: number;
    currentAyahRef: React.MutableRefObject<{ s: number; a: number }>;
    setCurrentAyah: (ayah: { s: number; a: number }) => void;
    handleSajdahVisible: (surahName: string, sNum: number, ayahNum: number) => void;
    showToast: (msg: string) => void;
    isLandscape: boolean;
    setIsLandscapeUIHidden: (hidden: boolean | ((prev: boolean) => boolean)) => void;
}

export function useAutoScroll({
    mushafContentRef,
    scrollMinutes,
    currentAyahRef,
    setCurrentAyah,
    handleSajdahVisible,
    showToast,
    isLandscape,
    setIsLandscapeUIHidden
}: UseAutoScrollProps) {
    const [autoScrollState, setAutoScrollState] = useState({ isActive: false, isPaused: false, elapsedTime: 0 });
    const [isAutoScrollSettingsOpen, setIsAutoScrollSettingsOpen] = useState(false);

    const autoScrollStateRef = useRef(autoScrollState);
    useEffect(() => { autoScrollStateRef.current = autoScrollState; }, [autoScrollState]);

    const autoScrollButtonTimerRef = useRef<number | null>(null);
    const autoScrollFrameRef = useRef<number | null>(null);
    const timerIntervalRef = useRef<number | null>(null);
    const scrollAccumulatorRef = useRef(0);
    const autoScrollPausedRef = useRef(false);
    const lastScrollTimeRef = useRef<number>(0);

    const PAGES_PER_JUZ = 20;
    const PAGE_HEIGHT_FALLBACK = 1300;
    const settingsRef = useRef({ scrollMinutes });
    useEffect(() => { settingsRef.current = { scrollMinutes }; }, [scrollMinutes]);

    const updateHeadersDuringAutoScroll = useCallback(() => {
        const content = mushafContentRef.current;
        if (!content) return;
        const el = document.elementFromPoint(window.innerWidth / 2, content.getBoundingClientRect().top + (content.clientHeight / 2)); 
        if (!el) return;
        const ayahBlock = el.closest('.ayah-text-block');
        if (ayahBlock && ayahBlock.id) {
            const parts = ayahBlock.id.split('-'); 
            if (parts.length === 3) {
                const s = parseInt(parts[1]); const a = parseInt(parts[2]);
                if (s !== currentAyahRef.current.s || a !== currentAyahRef.current.a) {
                    setCurrentAyah({ s, a });
                    currentAyahRef.current = { s, a };
                    if (ayahBlock.getAttribute('data-sajdah') === 'true') {
                        const surahName = (ayahBlock as HTMLElement).dataset.surah || '';
                        const sNum = parseInt((ayahBlock as HTMLElement).dataset.snum || '0', 10);
                        const ayahNum = parseInt((ayahBlock as HTMLElement).dataset.ayah || '0', 10);
                        if(surahName && sNum && ayahNum){
                            handleSajdahVisible(surahName, sNum, ayahNum);
                        }
                    }
                }
            }
        }
    }, [mushafContentRef, currentAyahRef, setCurrentAyah, handleSajdahVisible]);

    const stopAutoScroll = useCallback((showTimer = true) => {
        if (autoScrollFrameRef.current) cancelAnimationFrame(autoScrollFrameRef.current);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        autoScrollFrameRef.current = null;
        timerIntervalRef.current = null;
        autoScrollPausedRef.current = false;
        
        const newState = { isActive: false, isPaused: false, elapsedTime: autoScrollStateRef.current.elapsedTime };
        autoScrollStateRef.current = newState;
        setAutoScrollState(newState);
        
        if (showTimer) setTimeout(() => setAutoScrollState(p => ({...p, elapsedTime: 0})), 3000);
        else setAutoScrollState(p => ({...p, elapsedTime: 0}));
    }, []);

    const startAutoScroll = useCallback(() => {
        if (!mushafContentRef.current) return;
        stopAutoScroll(false);
        
        const initialState = { isActive: true, isPaused: false, elapsedTime: 0 };
        autoScrollStateRef.current = initialState;
        setAutoScrollState(initialState);
        
        setTimeout(() => {
            if (!mushafContentRef.current) return;
            
            scrollAccumulatorRef.current = 0;
            autoScrollPausedRef.current = false;
            lastScrollTimeRef.current = performance.now();
            
            let cachedPageHeight = PAGE_HEIGHT_FALLBACK;
            let lastHeightCalcTime = 0;

            const scrollStep = (timestamp: number) => {
                if (!lastScrollTimeRef.current) lastScrollTimeRef.current = timestamp;
                const deltaTime = timestamp - lastScrollTimeRef.current;
                lastScrollTimeRef.current = timestamp;

                if (!autoScrollPausedRef.current && mushafContentRef.current) {
                    const content = mushafContentRef.current;
                    
                    if (timestamp - lastHeightCalcTime > 3000 || lastHeightCalcTime === 0) {
                        const pages = content.querySelectorAll('.mushaf-page');
                        let totalHeight = 0; let count = 0;
                        pages.forEach((page: any) => { const h = page.offsetHeight; if (h) { totalHeight += h; count++; } });
                        cachedPageHeight = count ? (totalHeight / count) : (content.clientHeight || PAGE_HEIGHT_FALLBACK);
                        lastHeightCalcTime = timestamp;
                    }
                    
                    const minutesPerJuz = parseInt(String(settingsRef.current.scrollMinutes), 10) || 20;
                    const totalPixels = cachedPageHeight * PAGES_PER_JUZ;
                    const totalTimeMs = minutesPerJuz * 60 * 1000;
                    
                    if (totalPixels > 0 && totalTimeMs > 0) {
                        const pixelsPerMs = totalPixels / totalTimeMs;
                        scrollAccumulatorRef.current += pixelsPerMs * deltaTime;
                        
                        if (scrollAccumulatorRef.current >= 1) {
                            const pixelsToMove = Math.floor(scrollAccumulatorRef.current);
                            content.scrollTop += pixelsToMove;
                            scrollAccumulatorRef.current -= pixelsToMove;
                            updateHeadersDuringAutoScroll();
                        }
                    }
                }
                autoScrollFrameRef.current = requestAnimationFrame(scrollStep);
            };

            autoScrollFrameRef.current = requestAnimationFrame(scrollStep);

            timerIntervalRef.current = window.setInterval(() => {
                 if (!autoScrollPausedRef.current) {
                     setAutoScrollState(prev => ({ ...prev, elapsedTime: prev.elapsedTime + 1 }));
                 }
            }, 1000);
        }, 200);
    }, [mushafContentRef, stopAutoScroll, updateHeadersDuringAutoScroll]);

    const lastToggleTimeRef = useRef<number>(0);

    const toggleAutoScroll = useCallback(() => {
        lastToggleTimeRef.current = Date.now();
        if (autoScrollStateRef.current.isActive) stopAutoScroll();
        else { startAutoScroll(); showToast('تم تفعيل التمرير التلقائي'); }
    }, [stopAutoScroll, startAutoScroll, showToast]);

    const handleAutoScrollButtonPointerDown = (e: React.PointerEvent) => {
        e.stopPropagation();
        autoScrollButtonTimerRef.current = window.setTimeout(() => {
            autoScrollButtonTimerRef.current = null;
            setIsAutoScrollSettingsOpen(true);
        }, 500);
    };

    const handleAutoScrollButtonPointerUp = (e: React.PointerEvent) => {
        e.stopPropagation();
        if (autoScrollButtonTimerRef.current) {
            clearTimeout(autoScrollButtonTimerRef.current);
            autoScrollButtonTimerRef.current = null;
            toggleAutoScroll();
        }
    };

    const handleAutoScrollButtonPointerLeave = (e: React.PointerEvent) => {
        e.stopPropagation();
        if (autoScrollButtonTimerRef.current) {
            clearTimeout(autoScrollButtonTimerRef.current);
            autoScrollButtonTimerRef.current = null;
        }
    };

    const handleScreenTap = useCallback(() => {
        if (Date.now() - lastToggleTimeRef.current < 500) return; // Ignore ghost clicks immediately after toggling
        if (autoScrollStateRef.current.isActive) {
            const newPausedState = !autoScrollStateRef.current.isPaused;
            autoScrollPausedRef.current = newPausedState;
            const newState = { ...autoScrollStateRef.current, isPaused: newPausedState };
            autoScrollStateRef.current = newState;
            setAutoScrollState(newState);
            
            if (newPausedState && isLandscape) {
                setIsLandscapeUIHidden(false);
            }
        } else if (isLandscape) {
            setIsLandscapeUIHidden(prev => !prev);
        }
    }, [isLandscape, setIsLandscapeUIHidden]);

    return {
        autoScrollState,
        setAutoScrollState,
        autoScrollStateRef,
        autoScrollPausedRef,
        isAutoScrollSettingsOpen,
        setIsAutoScrollSettingsOpen,
        startAutoScroll,
        stopAutoScroll,
        toggleAutoScroll,
        handleAutoScrollButtonPointerDown,
        handleAutoScrollButtonPointerUp,
        handleAutoScrollButtonPointerLeave,
        handleScreenTap
    };
}
