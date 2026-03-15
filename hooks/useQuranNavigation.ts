import React, { useState, useRef, useCallback } from 'react';
import { toArabic } from '../components/QuranReader/constants';

interface UseQuranNavigationProps {
    quranData: any;
    isLandscapeRef: React.MutableRefObject<boolean>;
    stopAudio: () => void;
    scrollToAyah: (s: number, a: number, instant?: boolean) => void;
    handleAyahClick: (s: number, a: number) => void;
    setActiveModals: React.Dispatch<React.SetStateAction<string[]>>;
    showToast: (msg: string) => void;
    isPageInputActiveRef: React.MutableRefObject<boolean>;
}

export function useQuranNavigation({
    quranData,
    isLandscapeRef,
    stopAudio,
    scrollToAyah,
    handleAyahClick,
    setActiveModals,
    showToast,
    isPageInputActiveRef
}: UseQuranNavigationProps) {
    const [visiblePages, setVisiblePages] = useState<number[]>([1, 2, 3]);
    const isJumpingRef = useRef(false);
    const lastNotifiedJuz = useRef<number | null>(null);
    const lastNotifiedQuarter = useRef<number | null>(null);

    const getPageData = useCallback((pageNum: number) => quranData ? quranData.surahs.flatMap((s:any) => s.ayahs.filter((a:any) => Number(a.page) === Number(pageNum)).map((a:any) => ({ ...a, sNum: s.number, sName: s.name }))) : [], [quranData]);
    
    const jumpToAyah = useCallback((s: number, a: number, instant = false) => {
        stopAudio();
        if (!quranData) return;
        const surah = quranData.surahs.find((su:any) => su.number === s);
        const ayah = surah?.ayahs.find((ay:any) => ay.numberInSurah === a);
        if (!ayah) return;
        
        isJumpingRef.current = true;
        lastNotifiedJuz.current = null;
        lastNotifiedQuarter.current = null;
        const p = Number(ayah.page);
        setVisiblePages([...new Set([p, p + 1, p + 2, p - 1, p - 2])].filter(n => n > 0 && n <= 604).sort((a: number, b: number) => a - b));
        
        setTimeout(() => {
            scrollToAyah(s, a, instant);
            handleAyahClick(s, a);
            setTimeout(() => {
                isJumpingRef.current = false;
            }, 500);
        }, 150);
        
        if (!isPageInputActiveRef.current) {
            setActiveModals([]);
        }
    }, [quranData, handleAyahClick, stopAudio, scrollToAyah, setActiveModals, isPageInputActiveRef]);

    const jumpToPage = useCallback((pageNum: number, instant: boolean = true) => {
        if (!quranData || isNaN(pageNum) || pageNum < 1 || pageNum > 604) return;
        
        const pageData = getPageData(pageNum);
        if (pageData && pageData.length > 0) {
            const sortedAyahs = pageData.sort((a: any, b: any) => {
                if (a.sNum !== b.sNum) return a.sNum - b.sNum;
                return a.numberInSurah - b.numberInSurah;
            });
            const firstAyah = sortedAyahs[0];
            jumpToAyah(firstAyah.sNum, firstAyah.numberInSurah, instant);
        } else {
            showToast(`لا توجد بيانات لصفحة ${toArabic(pageNum)}`);
        }
    }, [quranData, jumpToAyah, getPageData, showToast]);

    return {
        visiblePages,
        setVisiblePages,
        isJumpingRef,
        lastNotifiedJuz,
        lastNotifiedQuarter,
        getPageData,
        jumpToAyah,
        jumpToPage
    };
}
