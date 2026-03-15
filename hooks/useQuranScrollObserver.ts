import React, { useEffect, useRef } from 'react';
import { toArabic } from '../components/QuranReader/constants';

interface UseQuranScrollObserverProps {
    mushafContentRef: React.RefObject<HTMLDivElement>;
    isLandscapeRef: React.MutableRefObject<boolean>;
    isLandscapeUIHiddenRef: React.MutableRefObject<boolean>;
    setIsLandscapeUIHidden: (hidden: boolean) => void;
    visiblePages: number[];
    setVisiblePages: React.Dispatch<React.SetStateAction<number[]>>;
    autoScrollState: { isActive: boolean; isPaused: boolean; elapsedTime: number };
    isJumpingRef: React.MutableRefObject<boolean>;
    currentAyahRef: React.MutableRefObject<{ s: number; a: number }>;
    setCurrentAyah: (ayah: { s: number; a: number }) => void;
    lastNotifiedJuz: React.MutableRefObject<number | null>;
    lastNotifiedQuarter: React.MutableRefObject<number | null>;
    showMarkerNotification: (type: 'juz' | 'quarter' | 'sajda' | 'surah', text: string) => void;
    handleSajdahVisible: (surahName: string, sNum: number, ayahNum: number) => void;
}

export function useQuranScrollObserver({
    mushafContentRef,
    isLandscapeRef,
    isLandscapeUIHiddenRef,
    setIsLandscapeUIHidden,
    visiblePages,
    setVisiblePages,
    autoScrollState,
    isJumpingRef,
    currentAyahRef,
    setCurrentAyah,
    lastNotifiedJuz,
    lastNotifiedQuarter,
    showMarkerNotification,
    handleSajdahVisible
}: UseQuranScrollObserverProps) {
    const lastScrollUpdateTime = useRef(0);

    useEffect(() => {
        const contentEl = mushafContentRef.current;
        if (!contentEl) return;
    
        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = contentEl;
            
            if (isLandscapeRef.current && !isLandscapeUIHiddenRef.current) {
                setIsLandscapeUIHidden(true);
            }

            if (scrollTop < clientHeight) {
                setVisiblePages(prev => {
                    if (prev.length === 0) return prev;
                    const firstPage = Math.min(...prev);
                    return firstPage > 1 ? [...new Set([firstPage - 1, ...prev])] : prev;
                });
            }
            if (scrollHeight - scrollTop <= clientHeight + 200) {
                setVisiblePages(prev => {
                    if (prev.length === 0) return prev;
                    const lastPage = Math.max(...prev);
                    return lastPage < 604 ? [...new Set([...prev, lastPage + 1])] : prev;
                });
            }
    
            if (autoScrollState.isActive || isJumpingRef.current) return;
    
            const now = Date.now();
            if (now - lastScrollUpdateTime.current < 100) return;
            lastScrollUpdateTime.current = now;
    
            const x = window.innerWidth / 2;
            const y = contentEl.getBoundingClientRect().top + (contentEl.clientHeight / 2);
            
            const el = document.elementFromPoint(x, y);
            if (!el) return;
            
            const ayahBlock = el.closest('.ayah-text-block');
            if (ayahBlock && ayahBlock.id) {
                const parts = ayahBlock.id.split('-');
                if (parts.length === 3) {
                    const s = parseInt(parts[1], 10);
                    const a = parseInt(parts[2], 10);
    
                    if (s !== currentAyahRef.current.s || a !== currentAyahRef.current.a) {
                        setCurrentAyah({ s, a });

                        const juzAttr = (ayahBlock as HTMLElement).dataset.juz;
                        const quarterAttr = (ayahBlock as HTMLElement).dataset.hizbQuarter;
                        
                        if (juzAttr) {
                            const newJuz = parseInt(juzAttr, 10);
                            if (lastNotifiedJuz.current !== null && newJuz !== lastNotifiedJuz.current) {
                                showMarkerNotification('juz', `بداية الجزء ${toArabic(newJuz)}`);
                            }
                            lastNotifiedJuz.current = newJuz;
                        }

                        if (quarterAttr) {
                            const newQuarter = parseInt(quarterAttr, 10);
                            if (lastNotifiedQuarter.current !== null && newQuarter !== lastNotifiedQuarter.current) {
                                let label = '';
                                const qInHizb = ((newQuarter - 1) % 4) + 1;
                                const hizbNum = Math.ceil(newQuarter / 4);
                                if (qInHizb === 1) label = `بداية الحزب ${toArabic(hizbNum)}`;
                                else if (qInHizb === 2) label = `ربع الحزب ${toArabic(hizbNum)}`;
                                else if (qInHizb === 3) label = `نصف الحزب ${toArabic(hizbNum)}`;
                                else if (qInHizb === 4) label = `ثلاثة أرباع الحزب ${toArabic(hizbNum)}`;
                                
                                showMarkerNotification('quarter', label);
                            }
                            lastNotifiedQuarter.current = newQuarter;
                        }

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
        };
    
        contentEl.addEventListener('scroll', handleScroll, { passive: true });
    
        return () => {
            contentEl.removeEventListener('scroll', handleScroll);
        };
    }, [visiblePages, autoScrollState.isActive, handleSajdahVisible, mushafContentRef, isLandscapeRef, isLandscapeUIHiddenRef, setIsLandscapeUIHidden, setVisiblePages, isJumpingRef, currentAyahRef, setCurrentAyah, lastNotifiedJuz, lastNotifiedQuarter, showMarkerNotification]);
}
