import React, { useState, useRef, useCallback, useEffect } from 'react';

interface UseTafseerProps {
    quranData: any;
    settings: any;
    setSettings: any;
    autoScrollStateRef: any;
    autoScrollPausedRef: any;
    setAutoScrollState: any;
    storageKey: string;
}

export const useTafseer = ({
    quranData,
    settings,
    setSettings,
    autoScrollStateRef,
    autoScrollPausedRef,
    setAutoScrollState,
    storageKey
}: UseTafseerProps) => {
    const [tafseerInfo, setTafseerInfo] = useState({ isOpen: false, s: 0, a: 0, text: '', surahName: '', wasAutoscrolling: false });
    const [tafseerSelectionInfo, setTafseerSelectionInfo] = useState({ isOpen: false, s: 0, a: 0, wasAutoscrolling: false });
    const [isTafseerLoading, setIsTafseerLoading] = useState(false);
    const tafseerCache = useRef<any>({});

    const handleVerseClick = useCallback((s: number, a: number, event: React.MouseEvent) => {
        event.stopPropagation();
        if (!quranData) return;
        const surah = quranData.surahs.find((su: any) => su.number === s);
        if (surah) {
            const wasAutoscrolling = autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused;
            if (wasAutoscrolling) {
                autoScrollPausedRef.current = true;
                setAutoScrollState((p: any) => ({ ...p, isPaused: true }));
            }
            setIsTafseerLoading(true);
            setTafseerInfo({ isOpen: true, s, a, text: '', surahName: surah.name, wasAutoscrolling });
        }
    }, [quranData, autoScrollStateRef, autoScrollPausedRef, setAutoScrollState]);

    const handleVerseLongPress = useCallback((s: number, a: number) => {
        const wasAutoscrolling = autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused;
        if (wasAutoscrolling) {
            autoScrollPausedRef.current = true;
            setAutoScrollState((p: any) => ({ ...p, isPaused: true }));
        }
        setTafseerSelectionInfo({ isOpen: true, s, a, wasAutoscrolling });
    }, [autoScrollStateRef, autoScrollPausedRef, setAutoScrollState]);

    const handleTafseerSelect = useCallback((tafseerId: string) => {
        // If we were autoscrolling, resume it now as we are closing the selection modal
        // But wait, usually selecting tafseer might open the tafseer modal? 
        // No, in this app it just changes the source.
        // So we should resume if it was autoscrolling.
        
        // However, we access tafseerSelectionInfo from state which might be stale in callback if not in dependency?
        // Actually we can just use the state updater or ref.
        // But simpler: just check if we paused it.
        
        setTafseerSelectionInfo(prev => {
            if (prev.wasAutoscrolling) {
                autoScrollPausedRef.current = false;
                setAutoScrollState((p: any) => ({ ...p, isPaused: false }));
            }
            return { ...prev, isOpen: false, wasAutoscrolling: false };
        });
        
        const newSettings = { ...settings, tafseer: tafseerId };
        setSettings(newSettings);
        localStorage.setItem(storageKey, JSON.stringify(newSettings));
        window.dispatchEvent(new Event('settings-change'));
    }, [settings, setSettings, storageKey, autoScrollPausedRef, setAutoScrollState]);

    useEffect(() => {
        const fetchTafseer = async () => {
            if (!tafseerInfo.isOpen) return;
            const currentTafseerId = settings.tafseer || 'ar.muyassar';
            const cacheKey = `${tafseerInfo.s}_${currentTafseerId}`;
            try {
                if (!tafseerCache.current[cacheKey]) {
                    const res = await fetch(`https://api.alquran.cloud/v1/surah/${tafseerInfo.s}/${currentTafseerId}`);
                    const data = await res.json();
                    if (data.code === 200) tafseerCache.current[cacheKey] = data.data.ayahs;
                    else throw new Error('Failed to fetch tafseer data');
                }
                const ayahTafseer = tafseerCache.current[cacheKey]?.[tafseerInfo.a - 1];
                setTafseerInfo(prev => ({ ...prev, text: ayahTafseer?.text || "التفسير غير متوفر لهذه الآية." }));
            } catch (e) {
                setTafseerInfo(prev => ({...prev, text: 'خطأ في تحميل التفسير. يرجى التحقق من اتصالك بالإنترنت.'}));
            } finally { setIsTafseerLoading(false); }
        };
        fetchTafseer();
    }, [tafseerInfo.isOpen, tafseerInfo.s, tafseerInfo.a, settings.tafseer]);

    const closeTafseer = useCallback(() => {
        if (tafseerInfo.wasAutoscrolling) {
            autoScrollPausedRef.current = false;
            setAutoScrollState((p: any) => ({ ...p, isPaused: false }));
        }
        setTafseerInfo(p => ({ ...p, isOpen: false, wasAutoscrolling: false }));
    }, [tafseerInfo.wasAutoscrolling, autoScrollPausedRef, setAutoScrollState]);

    const closeTafseerSelection = useCallback(() => {
        if (tafseerSelectionInfo.wasAutoscrolling) {
            autoScrollPausedRef.current = false;
            setAutoScrollState((p: any) => ({ ...p, isPaused: false }));
        }
        setTafseerSelectionInfo(p => ({ ...p, isOpen: false, wasAutoscrolling: false }));
    }, [tafseerSelectionInfo.wasAutoscrolling, autoScrollPausedRef, setAutoScrollState]);

    return {
        tafseerInfo,
        tafseerSelectionInfo,
        isTafseerLoading,
        handleVerseClick,
        handleVerseLongPress,
        handleTafseerSelect,
        closeTafseer,
        closeTafseerSelection,
        setTafseerSelectionInfo
    };
};
