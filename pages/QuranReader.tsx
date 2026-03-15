import React, { useState, useEffect, useRef, useCallback, FC } from 'react';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import './QuranReader.css'; 
import { JUZ_MAP, toArabic, THEMES, TAFSEERS, READERS } from '../components/QuranReader/constants';
import { KeepAwake } from '@capacitor-community/keep-awake';
import MushafPage from '../components/QuranReader/MushafPage';
import Toast from '../components/QuranReader/Toast';
import ReadingTimer from '../components/QuranReader/ReadingTimer';
import MarkerNotification from '../components/QuranReader/MarkerNotification';
import quranUthmaniJson from '../data/quran-uthmani.json';
import quranTajweedJson from '../data/quran-tajweed.json';
import { registerBackInterceptor } from '../hooks/useBackButton';

import QuranHeader from '../components/QuranReader/QuranHeader';
import QuranFooter from '../components/QuranReader/QuranFooter';
import FloatingMenu from '../components/QuranReader/FloatingMenu';
import QuranModalsContainer from '../components/QuranReader/QuranModalsContainer';

import { useQuranSettings } from '../hooks/useQuranSettings';
import { useQuranAudio } from '../hooks/useQuranAudio';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { useTafseer } from '../hooks/useTafseer';
import { useBookmarks } from '../hooks/useBookmarks';
import { useQuranModals } from '../hooks/useQuranModals';
import { useQuranNavigation } from '../hooks/useQuranNavigation';
import { usePinchZoom } from '../hooks/usePinchZoom';
import { useLandscapeScroll } from '../hooks/useLandscapeScroll';
import { useQuranScrollObserver } from '../hooks/useQuranScrollObserver';

declare var window: any;

const QuranReader: FC<{ onBack: () => void, initialLandscape?: boolean }> = ({ onBack, initialLandscape = false }) => {
    const [isLandscape, setIsLandscape] = useState(initialLandscape);
    const modeSuffix = isLandscape ? '_h' : '_v';

    const [isLoading, setIsLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('');
    const [loadingProgress, setLoadingProgress] = useState(100);

    const [currentAyah, setCurrentAyah] = useState<{ s: number; a: number }>({ s: 1, a: 1 });
    const [highlightedAyahId, setHighlightedAyahId] = useState<string | null>(null);

    const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);
    const [isLandscapeUIHidden, setIsLandscapeUIHidden] = useState(initialLandscape);
    
    const isLandscapeUIHiddenRef = useRef(false);
    useEffect(() => { isLandscapeUIHiddenRef.current = isLandscapeUIHidden; }, [isLandscapeUIHidden]);
    const isLandscapeRef = useRef(false);
    useEffect(() => { isLandscapeRef.current = isLandscape; }, [isLandscape]);

    const {
        useTajweed,
        setUseTajweed,
        quranData,
        setQuranData,
        settings,
        setSettings,
        settingsRef,
        currentTheme,
        setCurrentTheme,
        toolbarColors,
        setToolbarColors,
        isTransparentMode,
        setIsTransparentMode,
        showSajdahCard,
        setShowSajdahCard,
        getToolbarStyle
    } = useQuranSettings({ initialLandscape, isLandscapeRef, modeSuffix });

    const [toast, setToast] = useState({ show: false, message: '' });
    const showToast = useCallback((message: string) => setToast({ show: true, message }), []);
    const handleToastClose = useCallback(() => setToast(prev => ({ ...prev, show: false })), []);

    const mushafContentRef = useRef<HTMLDivElement>(null);
    const floatingMenuRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const currentAyahRef = useRef(currentAyah);
    useEffect(() => { currentAyahRef.current = currentAyah; }, [currentAyah]);
    
    const [markerNotification, setMarkerNotification] = useState<{ show: boolean, type: 'juz' | 'quarter' | 'sajda' | 'surah', text: string }>({ show: false, type: 'juz', text: '' });
    const [sajdahCardInfo, setSajdahCardInfo] = useState({ show: false, surah: '', ayah: 0, juz: 0, page: 0, wasAutoscrolling: false, wasPlaying: false });
    const sajdahCardInfoRef = useRef(sajdahCardInfo);
    useEffect(() => { sajdahCardInfoRef.current = sajdahCardInfo; }, [sajdahCardInfo]);

    const showMarkerNotification = useCallback((type: 'juz' | 'quarter' | 'sajda' | 'surah', text: string) => {
        setMarkerNotification({ show: true, type, text });
        setTimeout(() => setMarkerNotification(prev => ({ ...prev, show: false })), 2000);
    }, []);

    const {
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
    } = useAutoScroll({
        mushafContentRef,
        scrollMinutes: settings.scrollMinutes,
        currentAyahRef,
        setCurrentAyah,
        handleSajdahVisible: (surahName, sNum, ayahNum) => handleSajdahVisible(surahName, sNum, ayahNum),
        showToast,
        isLandscape,
        setIsLandscapeUIHidden
    });

    const {
        tafseerInfo,
        setTafseerInfo,
        tafseerSelectionInfo,
        setTafseerSelectionInfo,
        isTafseerLoading,
        setIsTafseerLoading,
        handleTafseerSelect
    } = useTafseer({
        settings,
        setSettings,
        autoScrollPausedRef,
        setAutoScrollState,
        modeSuffix
    });

    const scrollToAyah = useCallback((s: number, a: number, instant: boolean = false) => {
        const el = document.getElementById(`ayah-${s}-${a}`);
        if (el) {
            const container = mushafContentRef.current;
            if (container) {
                if (isLandscapeRef.current) {
                    const targetScroll = el.offsetTop - (container.clientHeight / 2) + (el.clientHeight / 2);
                    container.scrollTo({ top: targetScroll, behavior: instant ? 'auto' : 'smooth' });
                } else {
                    const containerRect = container.getBoundingClientRect();
                    const elRect = el.getBoundingClientRect();
                    const scrollTop = container.scrollTop + elRect.top - containerRect.top - (containerRect.height / 2) + (elRect.height / 2);
                    container.scrollTo({ top: scrollTop, behavior: instant ? 'auto' : 'smooth' });
                }
            } else {
                el.scrollIntoView({ block: 'center', behavior: instant ? 'auto' : 'smooth' });
            }
        }
    }, []);

    const {
        activeModals,
        setActiveModals,
        closeModal,
        openModal,
        wasAutoscrollingBeforeModal
    } = useQuranModals({
        autoScrollStateRef,
        autoScrollPausedRef,
        setAutoScrollState,
        setTafseerSelectionInfo,
        stopAudio: () => stopAudio() // Will be defined below
    });

    const {
        isPlaying,
        isAudioLoading,
        playingAyah,
        reciterToast,
        isPlayingRef,
        isAudioLoadingRef,
        playAudio,
        stopAudio,
        toggleAudio,
        handlePlayButtonPointerDown,
        handlePlayButtonPointerUp,
        handlePlayButtonPointerLeave
    } = useQuranAudio({
        quranData,
        reader: settings.reader,
        currentAyah,
        setCurrentAyah,
        setHighlightedAyahId,
        scrollToAyah,
        showToast,
        openModal
    });

    const handleSajdahVisible = useCallback((surahName: string, sNum: number, ayahNum: number) => {
        if (markerNotification.show || sajdahCardInfoRef.current.show) return;

        showMarkerNotification('sajda', `سجدة تلاوة: سورة ${surahName} - آية ${toArabic(ayahNum)}`);

        if (showSajdahCard) {
            if (!quranData) return;
            const juz = JUZ_MAP.slice().reverse().find(j => (sNum > j.s) || (sNum === j.s && ayahNum >= j.a))?.j || 1;
            const page = quranData.surahs[sNum - 1]?.ayahs.find((ay:any) => ay.numberInSurah === ayahNum)?.page || 1;

            const wasAutoscrolling = autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused;
            const wasPlaying = isPlayingRef.current || isAudioLoadingRef.current;

            if (wasAutoscrolling) {
                autoScrollPausedRef.current = true;
                const newState = { ...autoScrollStateRef.current, isPaused: true };
                autoScrollStateRef.current = newState;
                setAutoScrollState(newState);
            }
            if (wasPlaying) {
                stopAudio();
            }

            setSajdahCardInfo({
                show: true,
                surah: surahName,
                ayah: ayahNum,
                juz,
                page,
                wasAutoscrolling,
                wasPlaying
            });
        }
    }, [quranData, showMarkerNotification, stopAudio, showSajdahCard, autoScrollStateRef, autoScrollPausedRef, setAutoScrollState, isPlayingRef, isAudioLoadingRef]);

    const handleCloseSajdahCard = () => {
        if (sajdahCardInfo.wasAutoscrolling) {
            autoScrollPausedRef.current = false;
            setAutoScrollState(p => ({...p, isPaused: false }));
        }
        setSajdahCardInfo({ show: false, surah: '', ayah: 0, juz: 0, page: 0, wasAutoscrolling: false, wasPlaying: false });
    };

    const isBookmarksModalOpen = activeModals.includes('bookmarks-modal');
    const {
        bookmarks,
        setBookmarks,
        bookmarksFilter,
        setBookmarksFilter,
        saveBookmark,
        deleteBookmark,
        handleBookmarkButtonPointerDown,
        handleBookmarkButtonPointerUp,
        handleBookmarkButtonPointerLeave
    } = useBookmarks({
        currentAyah,
        isLandscapeRef,
        showToast,
        openModal,
        isBookmarksModalOpen
    });

    const [isPageInputActive, setIsPageInputActive] = useState(false);
    const [pageInput, setPageInput] = useState('');
    const isPageInputActiveRef = useRef(false);
    useEffect(() => { isPageInputActiveRef.current = isPageInputActive; }, [isPageInputActive]);
    const pageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isPageInputActive && pageInputRef.current) {
            pageInputRef.current.focus();
        }
    }, [isPageInputActive]);

    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
        setPageInput(value);
    };

    const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handlePageInputBlur();
        }
    };

    const handlePageButtonClick = () => {
        if (autoScrollState.isActive && !autoScrollState.isPaused) {
            setAutoScrollState(p => ({ ...p, isPaused: true }));
        }
        setIsPageInputActive(true);
    };

    const handleAyahClick = useCallback((s: number, a: number) => {
        setHighlightedAyahId(`ayah-${s}-${a}`);
        setCurrentAyah({ s, a });
        const key = isLandscapeRef.current ? 'last_pos_landscape' : 'last_pos';
        localStorage.setItem(key, JSON.stringify({ s, a }));
    }, []);

    const {
        visiblePages,
        setVisiblePages,
        isJumpingRef,
        lastNotifiedJuz,
        lastNotifiedQuarter,
        getPageData,
        jumpToAyah,
        jumpToPage
    } = useQuranNavigation({
        quranData,
        isLandscapeRef,
        stopAudio,
        scrollToAyah,
        handleAyahClick,
        setActiveModals,
        showToast,
        isPageInputActiveRef
    });

    const handlePageInputBlur = () => {
        if (pageInput) {
            const pageNum = parseInt(pageInput, 10);
            if (pageNum >= 1 && pageNum <= 604) {
                jumpToPage(pageNum, true);
            }
        }
        setIsPageInputActive(false);
        setPageInput(''); 
    };

    const handleAyahTextClick = useCallback((s: number, a: number) => {
        handleAyahClick(s, a);
        
        if (autoScrollStateRef.current.isActive) {
            const newPausedState = !autoScrollStateRef.current.isPaused;
            autoScrollPausedRef.current = newPausedState;
            const newState = { ...autoScrollStateRef.current, isPaused: newPausedState };
            autoScrollStateRef.current = newState;
            setAutoScrollState(newState);
            
            if (newPausedState && isLandscapeRef.current) {
                setIsLandscapeUIHidden(false);
            }
        } else if (isLandscapeRef.current) {
            setIsLandscapeUIHidden(prev => !prev);
        }
    }, [handleAyahClick, autoScrollStateRef, autoScrollPausedRef, setAutoScrollState]);

    const handleVerseClick = useCallback((s: number, a: number, event: React.MouseEvent) => {
        event.stopPropagation();
        handleAyahClick(s, a);
        if (!quranData) return;
        const surah = quranData.surahs.find((su: any) => su.number === s);
        if (surah) {
            const wasAutoscrolling = autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused;
            if (wasAutoscrolling) {
                autoScrollPausedRef.current = true;
                const newState = { ...autoScrollStateRef.current, isPaused: true };
                autoScrollStateRef.current = newState;
                setAutoScrollState(newState);
                if (isLandscapeRef.current) {
                    setIsLandscapeUIHidden(false);
                }
            }
            setIsTafseerLoading(true);
            setTafseerInfo({ isOpen: true, s, a, text: '', surahName: surah.name, wasAutoscrolling });
        }
    }, [quranData, handleAyahClick, autoScrollStateRef, autoScrollPausedRef, setAutoScrollState, setIsTafseerLoading, setTafseerInfo]);

    const handleVerseLongPress = useCallback((s: number, a: number) => {
        if (isLandscapeRef.current) return;
        const wasAutoscrolling = autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused;
        if (wasAutoscrolling) {
            autoScrollPausedRef.current = true;
            setAutoScrollState(p => ({ ...p, isPaused: true }));
            autoScrollStateRef.current = { ...autoScrollStateRef.current, isPaused: true };
        }
        setTafseerSelectionInfo({ isOpen: true, s, a, wasAutoscrolling });
    }, [autoScrollStateRef, autoScrollPausedRef, setAutoScrollState, setTafseerSelectionInfo]);

    useEffect(() => {
        const key = initialLandscape ? 'last_pos_landscape' : 'last_pos';
        const lastPos = JSON.parse(localStorage.getItem(key) || '{}');
        setTimeout(() => {
            jumpToAyah(lastPos.s || 1, lastPos.a || 1, true);
        }, 100);
    }, [jumpToAyah, initialLandscape]);

    const handleMushafTypeSelect = (type: 'uthmani' | 'tajweed') => {
        const isTajweed = type === 'tajweed';
        localStorage.setItem('use_tajweed_quran' + modeSuffix, String(isTajweed));
        setUseTajweed(isTajweed);
        setQuranData(isTajweed ? quranTajweedJson.data : quranUthmaniJson.data);
        closeModal('mushaf-selection-modal');
        showToast(isTajweed ? 'تم تفعيل المصحف المجود' : 'تم تفعيل المصحف العثماني');
        window.dispatchEvent(new Event('settings-change'));
    };

    // Keep screen awake logic
    useEffect(() => {
        let wakeLock: any = null;

        const requestWakeLock = async () => {
            try {
                await KeepAwake.keepAwake();
            } catch (e) {
            }

            if ('wakeLock' in navigator) {
                try {
                    wakeLock = await (navigator as any).wakeLock.request('screen');
                } catch (err) {
                    console.warn('Wake Lock request failed:', err);
                }
            }
        };

        requestWakeLock();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            KeepAwake.allowSleep().catch(() => {});
            if (wakeLock) {
                wakeLock.release().catch(() => {});
            }
        };
    }, []);

    useLandscapeScroll(isLandscape);

    useEffect(() => {
        const interceptor = () => {
            if (activeModals.length > 0) {
                const lastModal = activeModals[activeModals.length - 1];
                closeModal(lastModal);
                return true;
            }
            if (tafseerInfo.isOpen) {
                if (tafseerInfo.wasAutoscrolling) {
                    autoScrollPausedRef.current = false;
                    setAutoScrollState(p => ({ ...p, isPaused: false }));
                }
                setTafseerInfo(p => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                return true;
            }
            if (tafseerSelectionInfo.isOpen) {
                if (tafseerSelectionInfo.wasAutoscrolling) {
                    autoScrollPausedRef.current = false;
                    setAutoScrollState(p => ({ ...p, isPaused: false }));
                }
                setTafseerSelectionInfo(p => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                return true;
            }
            if (sajdahCardInfo.show) {
                handleCloseSajdahCard();
                return true;
            }
            if (isFloatingMenuOpen) {
                setIsFloatingMenuOpen(false);
                return true;
            }
            if (isPageInputActive) {
                setIsPageInputActive(false);
                setPageInput('');
                return true;
            }
            return false;
        };

        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [activeModals, tafseerInfo, tafseerSelectionInfo, sajdahCardInfo, isFloatingMenuOpen, isPageInputActive, closeModal, handleCloseSajdahCard, autoScrollPausedRef, setAutoScrollState, setTafseerInfo, setTafseerSelectionInfo]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (isFloatingMenuOpen && 
                floatingMenuRef.current && 
                !floatingMenuRef.current.contains(event.target as Node) &&
                menuButtonRef.current &&
                !menuButtonRef.current.contains(event.target as Node)) {
                setIsFloatingMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isFloatingMenuOpen]);

    const {
        handleTouchStartPinch,
        handleTouchMovePinch,
        handleTouchEndPinch
    } = usePinchZoom({ settings, setSettings, settingsRef, modeSuffix });

    useQuranScrollObserver({
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
    });

    const handleInteractionStart = useCallback(() => {
        if (autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused) {
            autoScrollPausedRef.current = true;
        }
    }, [autoScrollStateRef, autoScrollPausedRef]);

    const handleInteractionEnd = useCallback(() => {
        setTimeout(() => {
             const isAnyModalOpen = activeModals.length > 0 || tafseerInfo.isOpen || tafseerSelectionInfo.isOpen;
             if (!isAnyModalOpen && autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused) {
                 autoScrollPausedRef.current = false;
             }
        }, 100);
    }, [activeModals, tafseerInfo.isOpen, tafseerSelectionInfo.isOpen, autoScrollStateRef, autoScrollPausedRef]);

    if (isLoading) { return <div id="loader" className="fixed inset-0 bg-[#1f2937] text-white z-[9999] flex flex-col items-center justify-center"><div className="text-2xl font-bold mb-4">جاري تحميل المصحف...</div><div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden"><div id="progress-bar" className="h-full bg-green-500 transition-all duration-300" style={{width: `${loadingProgress}%`}}></div></div><div id="loader-status" className="mt-2 text-sm text-gray-400">{loadingStatus}</div></div> }
    
    const surahName = quranData?.surahs[currentAyah.s - 1]?.name.replace('سورة', '').trim() || '';
    const juz = JUZ_MAP.slice().reverse().find(j => (currentAyah.s > j.s) || (currentAyah.s === j.s && currentAyah.a >= j.a))?.j || 1;
    const page = quranData?.surahs[currentAyah.s - 1]?.ayahs.find((ay:any) => ay.numberInSurah === currentAyah.a)?.page || 1;

    const renderPlayButtonIcon = () => {
        if (isAudioLoading) return <span className="text-emerald-500 font-bold animate-pulse text-xs">جاري..</span>;
        if (isPlaying) return <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>;
        return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>;
    };

    return (
        <div className={`quran-reader-container ${isPageInputActive ? 'force-ui-visible' : ''} ${isLandscape ? 'landscape-mode' : ''} ${isLandscapeUIHidden ? 'landscape-ui-hidden' : ''} ${autoScrollState.isActive && !autoScrollState.isPaused && settings.hideUIOnAutoScroll ? 'fullscreen-active' : ''}`} id="app-container" style={{ backgroundColor: settings.bgColor, color: settings.textColor, fontFamily: settings.fontFamily, position: 'relative', height: '100dvh', overflow: 'hidden' } as React.CSSProperties}>
            <QuranHeader 
                autoScrollState={autoScrollState}
                settings={settings}
                isAutoScrollSettingsOpen={isAutoScrollSettingsOpen}
                getToolbarStyle={getToolbarStyle}
                currentTheme={currentTheme}
                openModal={openModal}
                surahName={surahName}
                currentAyah={currentAyah}
                juz={juz}
                isPageInputActive={isPageInputActive}
                pageInputRef={pageInputRef}
                pageInput={pageInput}
                handlePageInputChange={handlePageInputChange}
                handlePageInputBlur={handlePageInputBlur}
                handlePageInputKeyDown={handlePageInputKeyDown}
                handlePageButtonClick={handlePageButtonClick}
                page={page}
                handlePlayButtonPointerDown={handlePlayButtonPointerDown}
                handlePlayButtonPointerUp={handlePlayButtonPointerUp}
                handlePlayButtonPointerLeave={handlePlayButtonPointerLeave}
                renderPlayButtonIcon={renderPlayButtonIcon}
                reciterToast={reciterToast}
            />
            <ReadingTimer isVisible={autoScrollState.isPaused || (!autoScrollState.isActive && autoScrollState.elapsedTime > 0)} elapsedTime={autoScrollState.elapsedTime} />
            <div id="mushaf-content" ref={mushafContentRef} onClick={handleScreenTap} onTouchStart={handleTouchStartPinch} onTouchMove={handleTouchMovePinch} onTouchEnd={handleTouchEndPinch} className="flex-grow overflow-y-auto w-full relative touch-pan-y" style={isTransparentMode ? { position: 'absolute', top: 0, bottom: 0, height: '100%', zIndex: 0, paddingTop: '80px', paddingBottom: '80px' } : {}}>
                <div id="pages-container" className="full-mushaf-container">
                   {[...new Set(visiblePages)].sort((a: number, b: number) => a - b).map(pageNum => (<MushafPage key={pageNum} pageNum={pageNum} pageData={getPageData(pageNum)} highlightedAyahId={highlightedAyahId} onAyahClick={handleAyahTextClick} onVerseClick={handleVerseClick} onVerseLongPress={handleVerseLongPress} onInteractionStart={handleInteractionStart} onInteractionEnd={handleInteractionEnd} settings={settings} />))}
                </div>
            </div>
            <MarkerNotification isVisible={markerNotification.show} type={markerNotification.type} text={markerNotification.text} />
            <FloatingMenu 
                isFloatingMenuOpen={isFloatingMenuOpen}
                floatingMenuRef={floatingMenuRef}
                setBookmarksFilter={setBookmarksFilter}
                openModal={openModal}
                setIsFloatingMenuOpen={setIsFloatingMenuOpen}
                getToolbarStyle={getToolbarStyle}
                currentTheme={currentTheme}
                isLandscape={isLandscape}
            />
            <QuranFooter 
                autoScrollState={autoScrollState}
                settings={settings}
                isAutoScrollSettingsOpen={isAutoScrollSettingsOpen}
                getToolbarStyle={getToolbarStyle}
                currentTheme={currentTheme}
                menuButtonRef={menuButtonRef}
                setIsFloatingMenuOpen={setIsFloatingMenuOpen}
                handleBookmarkButtonPointerDown={handleBookmarkButtonPointerDown}
                handleBookmarkButtonPointerUp={handleBookmarkButtonPointerUp}
                handleBookmarkButtonPointerLeave={handleBookmarkButtonPointerLeave}
                handleAutoScrollButtonPointerDown={handleAutoScrollButtonPointerDown}
                handleAutoScrollButtonPointerUp={handleAutoScrollButtonPointerUp}
                handleAutoScrollButtonPointerLeave={handleAutoScrollButtonPointerLeave}
                onBack={onBack}
            />
            <QuranModalsContainer
                activeModals={activeModals}
                closeModal={closeModal}
                isLandscape={isLandscape}
                settings={settings}
                setSettings={setSettings}
                modeSuffix={modeSuffix}
                quranData={quranData}
                jumpToAyah={jumpToAyah}
                showToast={showToast}
                currentTheme={currentTheme}
                toolbarColors={toolbarColors}
                openModal={openModal}
                tafseerInfo={tafseerInfo}
                setTafseerInfo={setTafseerInfo}
                isTafseerLoading={isTafseerLoading}
                autoScrollPausedRef={autoScrollPausedRef}
                setAutoScrollState={setAutoScrollState}
                tafseerSelectionInfo={tafseerSelectionInfo}
                setTafseerSelectionInfo={setTafseerSelectionInfo}
                handleTafseerSelect={handleTafseerSelect}
                useTajweed={useTajweed}
                handleMushafTypeSelect={handleMushafTypeSelect}
                sajdahCardInfo={sajdahCardInfo}
                handleCloseSajdahCard={handleCloseSajdahCard}
                bookmarks={bookmarks}
                bookmarksFilter={bookmarksFilter}
                setBookmarksFilter={setBookmarksFilter}
                deleteBookmark={deleteBookmark}
                setIsLandscape={setIsLandscape}
                isLandscapeRef={isLandscapeRef}
                isAutoScrollSettingsOpen={isAutoScrollSettingsOpen}
                setIsAutoScrollSettingsOpen={setIsAutoScrollSettingsOpen}
            />
            <Toast message={toast.message} show={toast.show} onClose={handleToastClose} />
        </div>
    );
};

export default QuranReader;
