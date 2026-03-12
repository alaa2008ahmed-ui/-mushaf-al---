import React, { useState, useEffect, useRef, useCallback, FC } from 'react';
import './QuranReaderHorizontal.css'; 
import { JUZ_MAP, toArabic, THEMES, TAFSEERS, READERS } from '../components/QuranReader/constants';
import SearchModal from '../components/QuranReader/SearchModal';
import ThemesModal from '../components/QuranReader/ThemesModal';
import SettingsModal from '../components/QuranReader/SettingsModal';
import ToolbarColorPickerModal from '../components/QuranReader/ToolbarColorPickerModal';
import { QuranDownloadModal, TafsirDownloadModal } from '../components/QuranReader/DownloadModals';
import SurahJuzModal from '../components/QuranReader/SurahJuzModal';
import { useKeepAwake } from '../hooks/useKeepAwake';
import { useQuranAudio } from '../hooks/useQuranAudio';
import { useTafseer } from '../hooks/useTafseer';
import { usePinchZoom } from '../hooks/usePinchZoom';
import { useBookmarks } from '../hooks/useBookmarks';
import { useAutoScroll } from '../hooks/useAutoScroll';
import BookmarksModal from '../components/QuranReader/BookmarksModal';
import MushafPage from '../components/QuranReader/MushafPageHorizontal';
import Toast from '../components/QuranReader/Toast';
import TafseerModal from '../components/QuranReader/TafseerModal';
import SajdahCardModal from '../components/QuranReader/SajdahCardModal';
import TafseerSelectionModal from '../components/QuranReader/TafseerSelectionModal';
import ReciterSelectModal from '../components/QuranReader/ReciterSelectModal';
import { ReadingTimer, SajdahNotification } from '../components/QuranReader/SharedUI';
import quranDataJson from '../data/quran-uthmani.json';

declare var window: any;







const QuranReaderHorizontal: FC<{ onBack: () => void }> = ({ onBack }) => {
    const [quranData, setQuranData] = useState<any>(quranDataJson.data);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('');
    const [loadingProgress, setLoadingProgress] = useState(100);

    const [visiblePages, setVisiblePages] = useState<number[]>([1, 2, 3]);
    const [currentAyah, setCurrentAyah] = useState<{ s: number; a: number }>({ s: 1, a: 1 });
    const [highlightedAyahId, setHighlightedAyahId] = useState<string | null>(null);

    const [activeModals, setActiveModals] = useState<Record<string, boolean>>({});
    const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);
    
    const [toast, setToast] = useState({ show: false, message: '' });

    const [sajdahInfo, setSajdahInfo] = useState<{ show: boolean; surah?: string; ayah?: number }>({ show: false });
    const [sajdahCardInfo, setSajdahCardInfo] = useState({ show: false, surah: '', ayah: 0, juz: 0, page: 0, wasAutoscrolling: false, wasPlaying: false });

    const [autoScrollState, setAutoScrollState] = useState({ isActive: false, isPaused: false, elapsedTime: 0 });
    const autoScrollStateRef = useRef(autoScrollState);
    useEffect(() => { autoScrollStateRef.current = autoScrollState; }, [autoScrollState]);
    const autoScrollPausedRef = useRef(false);

    const [showSajdahCard, setShowSajdahCard] = useState(() => {
        const saved = localStorage.getItem('show_sajdah_card_horizontal');
        return saved !== null ? saved === 'true' : true;
    });
    
    const [isPageInputActive, setIsPageInputActive] = useState(false);
    const [pageInput, setPageInput] = useState('');
    const isPageInputActiveRef = useRef(false);
    useEffect(() => { isPageInputActiveRef.current = isPageInputActive; }, [isPageInputActive]);
    const isJumpingRef = useRef(false);

    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('quran_settings_horizontal');
        return saved ? JSON.parse(saved) : {
            fontSize: 1.7, fontFamily: "var(--font-noto)", textColor: '#1f2937', bgColor: '#ffffff',
            reader: 'Alafasy_128kbps', theme: 'light', scrollMinutes: 20, tafseer: 'ar.muyassar'
        };
    });

    const [currentTheme, setCurrentTheme] = useState(() => {
        const themeId = localStorage.getItem('current_theme_id_horizontal') || 'default';
        return THEMES[themeId as keyof typeof THEMES] || THEMES['default'];
    });

    // Keep screen awake logic
    useKeepAwake();

    const [toolbarColors, setToolbarColors] = useState(() => JSON.parse(localStorage.getItem('toolbar_colors_horizontal') || '{}'));
    const [isTransparentMode, setIsTransparentMode] = useState(() => localStorage.getItem('transparent_mode_horizontal') === 'true');

    const mushafContentRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef(settings);
    useEffect(() => { settingsRef.current = settings; }, [settings]);
    const floatingMenuRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const currentAyahRef = useRef(currentAyah);
    const lastScrollUpdateTime = useRef(0);
    const pageInputRef = useRef<HTMLInputElement>(null);

    const sajdahInfoRef = useRef(sajdahInfo);
    useEffect(() => { sajdahInfoRef.current = sajdahInfo; }, [sajdahInfo]);
    const sajdahCardInfoRef = useRef(sajdahCardInfo);
    useEffect(() => { sajdahCardInfoRef.current = sajdahCardInfo; }, [sajdahCardInfo]);

    useEffect(() => { currentAyahRef.current = currentAyah; }, [currentAyah]);
    
    useEffect(() => {
        if (isPageInputActive && pageInputRef.current) {
            pageInputRef.current.focus();
        }
    }, [isPageInputActive]);

    const showToast = useCallback((message: string) => setToast({ show: true, message }), []);

    const scrollToAyah = useCallback((s: number, a: number, instant: boolean = false) => {
        const el = document.getElementById(`ayah-${s}-${a}`);
        if (el) {
            const pageEl = el.closest('.horizontal-mushaf-page');
            const container = mushafContentRef.current;
            if (pageEl && container) {
                pageEl.scrollIntoView({ behavior: instant ? 'auto' : 'smooth', inline: 'center' });
                
                const pageRect = pageEl.getBoundingClientRect();
                const elRect = el.getBoundingClientRect();
                const scrollTop = pageEl.scrollTop + elRect.top - pageRect.top - (pageRect.height / 2) + (elRect.height / 2);
                pageEl.scrollTo({ top: scrollTop, behavior: instant ? 'auto' : 'smooth' });
            } else if (container) {
                const containerRect = container.getBoundingClientRect();
                const elRect = el.getBoundingClientRect();
                const scrollTop = container.scrollTop + elRect.top - containerRect.top - (containerRect.height / 2) + (elRect.height / 2);
                container.scrollTo({ top: scrollTop, behavior: instant ? 'auto' : 'smooth' });
            } else {
                el.scrollIntoView({ block: 'center', behavior: instant ? 'auto' : 'smooth' });
            }
        }
    }, []);

    const {
        isPlaying,
        isAudioLoading,
        playingAyah,
        reciterToast,
        playAudio,
        stopAudio,
        toggleAudio,
        isPlayingRef,
        isAudioLoadingRef
    } = useQuranAudio({
        quranData,
        reader: settings.reader,
        currentAyah,
        setCurrentAyah,
        setHighlightedAyahId,
        scrollToAyah,
        showToast,
        readersList: READERS
    });

    const closeModal = useCallback((modalName: string) => setActiveModals(p => ({ ...p, [modalName]: false })), []);
    const openModal = useCallback((modalName: string) => { stopAudio(); setActiveModals(p => ({...p, [modalName]: true})); }, [stopAudio]);

    const {
        bookmarks,
        loadBookmarks,
        deleteBookmark,
        handleBookmarkButtonPointerDown,
        handleBookmarkButtonPointerUp,
        handleBookmarkButtonPointerLeave
    } = useBookmarks({
        currentAyah,
        showToast,
        storageKey: 'quran_bookmarks_list_horizontal',
        openModal
    });

    const { handleTouchStart, handleTouchMove, handleTouchEnd } = usePinchZoom({
        settings,
        setSettings,
        storageKey: 'quran_settings_horizontal'
    });

    const showSajdahNotification = useCallback((surah: string, ayah: number) => {
        setSajdahInfo({ show: true, surah, ayah });
        const timeout = autoScrollStateRef.current.isActive ? 2000 : 4000;
        setTimeout(() => setSajdahInfo(prev => ({...prev, show: false})), timeout);
    }, []);

    const handleSajdahVisible = useCallback((surahName: string, sNum: number, ayahNum: number) => {
        if (sajdahInfoRef.current.show || sajdahCardInfoRef.current.show) return;

        showSajdahNotification(surahName, ayahNum);

        if (showSajdahCard) {
            if (!quranData) return;
            const juz = JUZ_MAP.slice().reverse().find(j => (sNum > j.s) || (sNum === j.s && ayahNum >= j.a))?.j || 1;
            const page = quranData.surahs[sNum - 1]?.ayahs.find((ay:any) => ay.numberInSurah === ayahNum)?.page || 1;

            const wasAutoscrolling = autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused;
            const wasPlaying = isPlayingRef.current || isAudioLoadingRef.current;

            if (wasAutoscrolling) {
                autoScrollPausedRef.current = true;
                setAutoScrollState(p => ({...p, isPaused: true }));
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
    }, [showSajdahCard, quranData, showSajdahNotification, stopAudio]);

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
    }, [handleSajdahVisible]);

    const {
        stopAutoScroll,
        startAutoScroll,
        toggleAutoScroll,
        pauseResumeAutoScroll
    } = useAutoScroll({
        mushafContentRef,
        settings,
        showToast,
        updateHeadersDuringAutoScroll,
        isHorizontal: true,
        autoScrollState,
        setAutoScrollState,
        autoScrollStateRef,
        autoScrollPausedRef
    });

    const {
        tafseerInfo,
        tafseerSelectionInfo,
        isTafseerLoading,
        handleVerseClick,
        handleVerseLongPress,
        handleTafseerSelect,
        closeTafseer,
        closeTafseerSelection,
        setTafseerSelectionInfo
    } = useTafseer({
        quranData,
        settings,
        setSettings,
        autoScrollStateRef,
        autoScrollPausedRef,
        setAutoScrollState,
        storageKey: 'quran_settings_horizontal'
    });

    const handleCloseSajdahCard = () => {
        if (sajdahCardInfo.wasAutoscrolling) {
            autoScrollPausedRef.current = false;
            setAutoScrollState(p => ({...p, isPaused: false }));
        }
        setSajdahCardInfo({ show: false, surah: '', ayah: 0, juz: 0, page: 0, wasAutoscrolling: false, wasPlaying: false });
    };

    const playButtonTimerRef = useRef<number | null>(null);
    const handlePlayButtonPointerDown = () => {
        playButtonTimerRef.current = window.setTimeout(() => {
            playButtonTimerRef.current = null;
            openModal('reciter-modal');
        }, 500);
    };

    const handlePlayButtonPointerUp = () => {
        if (playButtonTimerRef.current) {
            clearTimeout(playButtonTimerRef.current);
            playButtonTimerRef.current = null;
            toggleAudio();
        }
    };

    const handlePlayButtonPointerLeave = () => {
        if (playButtonTimerRef.current) {
            clearTimeout(playButtonTimerRef.current);
            playButtonTimerRef.current = null;
        }
    };

    useEffect(() => {
        const handleThemeChange = () => {
            const themeId = localStorage.getItem('current_theme_id_horizontal') || 'default';
            const newTheme = THEMES[themeId as keyof typeof THEMES] || THEMES['default'];
            setCurrentTheme(newTheme);
            
            const savedSettings = localStorage.getItem('quran_settings_horizontal');
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings));
            } else {
                setSettings(prev => ({ ...prev, bgColor: newTheme.bg, textColor: newTheme.text, fontFamily: newTheme.font }));
            }
            
            setToolbarColors(JSON.parse(localStorage.getItem('toolbar_colors_horizontal') || '{}'));
            setIsTransparentMode(localStorage.getItem('transparent_mode_horizontal') === 'true');
        };
        const handleSettingsChange = () => {
            const saved = localStorage.getItem('quran_settings_horizontal');
            if (saved) setSettings(JSON.parse(saved));
            setToolbarColors(JSON.parse(localStorage.getItem('toolbar_colors_horizontal') || '{}'));
            const savedSajdah = localStorage.getItem('show_sajdah_card_horizontal');
            setShowSajdahCard(savedSajdah !== null ? savedSajdah === 'true' : true);
            setIsTransparentMode(localStorage.getItem('transparent_mode_horizontal') === 'true');
        };
        window.addEventListener('theme-change', handleThemeChange);
        window.addEventListener('settings-change', handleSettingsChange);
        return () => {
            window.removeEventListener('theme-change', handleThemeChange);
            window.removeEventListener('settings-change', handleSettingsChange);
        };
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        const t = currentTheme;
        
        // Set Theme CSS Variables
        root.style.setProperty('--qr-bg', t.bg);
        root.style.setProperty('--qr-text', t.text);
        root.style.setProperty('--qr-bar-bg', t.barBg);
        root.style.setProperty('--qr-bar-text', t.barText);
        root.style.setProperty('--qr-bar-border', t.barBorder);
        root.style.setProperty('--qr-btn-bg', t.btnBg);
        root.style.setProperty('--qr-btn-text', t.btnText);
        root.style.setProperty('--qr-accent', t.accent);
        root.style.setProperty('--qr-accent-text', t.accentText);
        root.style.setProperty('--qr-modal-bg', t.modalBg);
        root.style.setProperty('--qr-modal-text', t.modalText);
        root.style.setProperty('--qr-header-bg', t.headerBg);
        root.style.setProperty('--qr-header-text', t.headerText);
        root.style.setProperty('--qr-card-bg', t.cardBg);
        root.style.setProperty('--qr-card-text', t.cardText);
        root.style.setProperty('--qr-card-border', t.cardBorder);
        root.style.setProperty('--qr-sajdah', t.sajdah);

        root.style.setProperty('--color-sajdah', t.sajdah);
        root.style.setProperty('--search-result-bg', t.cardBg);
        root.style.setProperty('--search-result-border', t.accent);
        root.style.setProperty('--search-result-text', t.cardText);
        
        const darkBgs = ['#000000', '#2c241b', '#101010', '#0f172a', '#2e1065', '#064e3b', '#1e293b', '#4c1d95', '#1e1b4b', '#451a03'];
        const isDark = t.bg && darkBgs.includes(t.bg.toLowerCase());
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [currentTheme]);

    useEffect(() => {
        if (activeModals['bookmarks-modal']) {
            loadBookmarks();
        }
    }, [activeModals['bookmarks-modal'], loadBookmarks]);

    useEffect(() => {
        const contentEl = mushafContentRef.current;
        if (!contentEl) return;
    
        const handleScroll = () => {
            const { scrollLeft, clientWidth } = contentEl;
            const currentPage = Math.round(Math.abs(scrollLeft) / clientWidth) + 1;
            
            setVisiblePages(prev => {
                const newVisible = [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2].filter(p => p > 0 && p <= 604);
                if (prev.length === newVisible.length && prev.every((v, i) => v === newVisible[i])) {
                    return prev;
                }
                return newVisible;
            });
    
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
    }, [visiblePages, autoScrollState.isActive, handleSajdahVisible]);

    const getPageData = useCallback((pageNum) => quranData ? quranData.surahs.flatMap((s:any) => s.ayahs.filter((a:any) => Number(a.page) === Number(pageNum)).map((a:any) => ({ ...a, sNum: s.number, sName: s.name }))) : [], [quranData]);
    
    const handleAyahClick = useCallback((s, a) => {
        setHighlightedAyahId(`ayah-${s}-${a}`);
        setCurrentAyah({ s, a });
        localStorage.setItem('last_pos_horizontal', JSON.stringify({ s, a }));
    }, []);
    
    const jumpToAyah = useCallback((s: number, a: number, instant: boolean = false) => {
        stopAudio();
        if (!quranData) return;
        
        // Find the ayah data
        const surah = quranData.surahs.find((su: any) => su.number === s);
        if (!surah) return;
        
        const ayah = surah.ayahs.find((ay: any) => ay.numberInSurah === a);
        if (!ayah) return;
        
        const p = Number(ayah.page);
        
        isJumpingRef.current = true;

        // 1. Force update visible pages to ONLY the target page and neighbors
        // This prevents rendering intermediate pages
        setVisiblePages([p - 1, p, p + 1].filter(n => n > 0 && n <= 604));

        // 2. Scroll instantly
        const container = mushafContentRef.current;
        if (container) {
            // Calculate position based on page width (assuming full width pages)
            const pageWidth = container.clientWidth;
            const targetScrollLeft = (p - 1) * pageWidth; // RTL or LTR depends on implementation, but usually page index * width

            // Temporarily disable scroll snap and smooth scrolling
            container.style.scrollBehavior = 'auto';
            container.style.scrollSnapType = 'none';
            container.style.overflowX = 'hidden'; // Hide scrollbar during jump

            // Force scroll
            container.scrollLeft = targetScrollLeft; // For RTL, this might need adjustment if using negative values or specific RTL logic

            // Check if we need to adjust for RTL (if scrollLeft is negative or starts from right)
            // In many RTL implementations with flex-row-reverse or dir="rtl", scrollLeft might behave differently.
            // Assuming standard LTR container with RTL content or standard behavior:
            // If the container uses standard scrolling, (p-1) * width is correct for LTR.
            // If RTL, it might be -(p-1)*width or (totalWidth - (p*width)).
            // Let's stick to the logic that was likely used before or standard scrollIntoView if possible, 
            // but scrollIntoView is async/animated often. Direct scrollLeft is fastest.
            
            // Let's try to find the element if it exists, otherwise calculate.
            // Since we just updated visiblePages, the element might not be in DOM yet if React hasn't committed.
            // However, we can try to scroll based on calculation which is faster.
            
            // Fallback/Refinement: Use a timeout to ensure React renders the new page before scrolling if needed,
            // BUT the user wants "instant" without seeing other pages.
            // Setting visiblePages restricts what's rendered.
            // We can also use requestAnimationFrame.

            requestAnimationFrame(() => {
                if (container) {
                     // Recalculate in case of resize or layout shift
                    const pageWidth = container.clientWidth;
                    // For RTL direction, sometimes scrollLeft is negative or inverted. 
                    // Safest is to find the page element if possible, or assume standard calculation.
                    // If we assume the pages are ordered 1..604 in the container:
                    // If dir="rtl", scrollLeft starts at 0 (rightmost) and goes negative or positive depending on browser.
                    // A safer cross-browser way for "instant" jump to a specific index in a flex container:
                    
                    // Actually, the previous code used `container.children[p-1]`. 
                    // If all 604 placeholders exist, that works. If only visible pages exist, we need to find the right one.
                    // The `visiblePages` state implies we only render SOME pages. 
                    // If we only render pages [p-1, p, p+1], then the container might not have 604 children.
                    // We need to check how `MushafPage` are rendered. 
                    // Looking at `visiblePages` usage in `render` (not shown here but assumed), 
                    // usually virtualized lists have spacers or absolute positioning.
                    // If it's a standard list where only visible pages are in DOM, we can't scroll to p-1 index of children.
                    
                    // Let's assume the previous logic `container.children[p-1]` implied all pages are rendered or placeholders exist.
                    // If `visiblePages` controls *content* but the *containers* for pages always exist (virtualization with placeholders),
                    // then `children[p-1]` is valid.
                    
                    // If the user wants "instant" without seeing others, we must ensure the scroll happens 
                    // IN THE SAME FRAME or immediately after render.
                    
                    // Let's rely on the fact that we updated `visiblePages` to include the target.
                    // We will use a slight timeout to allow render, then hard scroll.
                    
                    // CRITICAL: To avoid seeing other pages, we hide the container opacity temporarily? 
                    // Or just rely on `visiblePages` filtering out the others.
                    
                    // Let's try to scroll to the calculated position immediately.
                     const isRTL = window.getComputedStyle(container).direction === 'rtl';
                     const scrollX = isRTL ? -((p - 1) * pageWidth) : ((p - 1) * pageWidth);
                     
                     // Try scrolling to the element if it exists (best effort)
                     const targetPage = document.getElementById(`page-${p}`);
                     if (targetPage) {
                         targetPage.scrollIntoView({ behavior: 'auto', inline: 'start' });
                     } else {
                         // Fallback to calculated
                         container.scrollTo({ left: scrollX, behavior: 'auto' });
                     }
                }
                
                // Re-enable snap
                setTimeout(() => {
                    if (container) {
                        container.style.scrollSnapType = 'x mandatory';
                        container.style.overflowX = 'auto';
                        container.style.scrollBehavior = 'smooth';
                    }
                    isJumpingRef.current = false;
                }, 50);
            });
        } else {
             isJumpingRef.current = false;
        }

        // 3. Highlight the ayah
        handleAyahClick(s, a);
        
        if (!isPageInputActiveRef.current) {
            setActiveModals({});
        }
    }, [quranData, handleAyahClick, stopAudio]);

    useEffect(() => {
        const lastPos = JSON.parse(localStorage.getItem('last_pos_horizontal') || '{}');
        setTimeout(() => {
            jumpToAyah(lastPos.s || 1, lastPos.a || 1, true);
        }, 100);
    }, [jumpToAyah]);

    const jumpToPage = useCallback((pageNum: number, instant: boolean = true) => {
        if (!quranData || isNaN(pageNum) || pageNum < 1 || pageNum > 604) return;
        
        const pageData = getPageData(pageNum);
        if (pageData && pageData.length > 0) {
            // Sort by surah number then ayah number to get the absolute first ayah of the page
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

    const PAGES_PER_JUZ = 20;
    const PAGE_HEIGHT_FALLBACK = 1300;

    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
        setPageInput(value);
    };

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

    const getToolbarStyle = (type: string, defaultBg: string, defaultText: string, defaultBorder: string) => {
        const config = toolbarColors[type];
        if (isTransparentMode && (type === 'top-toolbar' || type === 'bottom-toolbar')) return { backgroundColor: 'transparent', color: config?.text || defaultText, borderColor: 'transparent', boxShadow: 'none', backdropFilter: 'none', WebkitBackdropFilter: 'none', position: 'fixed' as 'fixed', left: 0, right: 0, zIndex: 50, ...(type === 'top-toolbar' ? { top: 0 } : { bottom: 0 }) };
        if (config) return { backgroundColor: config.bg, color: config.text, borderColor: config.border, fontFamily: config.font || 'inherit' };
        return { backgroundColor: defaultBg, color: defaultText, borderColor: defaultBorder };
    };

    const handleToastClose = useCallback(() => {
        setToast(prev => ({ ...prev, show: false }));
    }, []);

    if (isLoading) { return <div id="loader" className="fixed inset-0 bg-[#1f2937] text-white z-[9999] flex flex-col items-center justify-center"><div className="text-2xl font-bold mb-4">جاري تحميل المصحف...</div><div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden"><div id="progress-bar" className="h-full bg-green-500 transition-all duration-300" style={{width: `${loadingProgress}%`}}></div></div><div id="loader-status" className="mt-2 text-sm text-gray-400">{loadingStatus}</div></div> }
    
    const surahName = quranData?.surahs[currentAyah.s - 1]?.name.replace('سورة', '').trim() || '';
    const juz = JUZ_MAP.slice().reverse().find(j => (currentAyah.s > j.s) || (currentAyah.s === j.s && currentAyah.a >= j.a))?.j || 1;
    const page = quranData?.surahs[currentAyah.s - 1]?.ayahs.find((ay:any) => ay.numberInSurah === currentAyah.a)?.page || 1;
    const tafseerName = TAFSEERS.find(t => t.id === settings.tafseer)?.name || 'التفسير';

    const renderPlayButtonIcon = () => {
        if (isAudioLoading) return <span className="text-emerald-500 font-bold animate-pulse text-xs">جاري..</span>;
        if (isPlaying) return <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>;
        return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>;
    };

    return (
        <div className={`quran-reader-container-horizontal ${isPageInputActive ? 'force-ui-visible' : ''}`} id="app-container" style={{ backgroundColor: settings.bgColor, color: settings.textColor, fontFamily: settings.fontFamily, position: 'relative', height: '100dvh', overflow: 'hidden' } as React.CSSProperties}>
            <header id="header" className="header-default flex-none z-50 flex items-center px-4 justify-between border-b shadow-xl w-full gap-2" style={getToolbarStyle('top-toolbar', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}>
                <button id="surah-name-header" onClick={() => openModal('surah-modal')} className="top-bar-text-button" style={getToolbarStyle('surah', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}><span>{surahName} - آية {toArabic(currentAyah.a)}</span></button>
                <button id="juz-number-header" onClick={() => openModal('juz-modal')} className="top-bar-text-button" style={getToolbarStyle('juz', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}>الجزء {toArabic(juz)}</button>
                {isPageInputActive ? (
                    <input
                        ref={pageInputRef}
                        id="header-page"
                        type="tel"
                        value={pageInput}
                        onChange={handlePageInputChange}
                        onBlur={handlePageInputBlur}
                        onKeyDown={handlePageInputKeyDown}
                        className="top-bar-text-button"
                        style={getToolbarStyle('page', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}
                        placeholder={`ص ${toArabic(page)}`}
                    />
                ) : (
                    <button 
                        id="header-page" 
                        onClick={handlePageButtonClick}
                        className="top-bar-text-button" 
                        style={getToolbarStyle('page', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}
                    >
                        ص {toArabic(page)}
                    </button>
                )}
                <div className="relative flex-shrink-0">
                    <button 
                        id="btn-play" 
                        onPointerDown={handlePlayButtonPointerDown}
                        onPointerUp={handlePlayButtonPointerUp}
                        onPointerLeave={handlePlayButtonPointerLeave}
                        className="top-bar-text-button" 
                        style={{...getToolbarStyle('audio', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder), touchAction: 'none'}}
                    >
                        <span id="play-icon-svg">{renderPlayButtonIcon()}</span>
                    </button>
                    {reciterToast.show && (
                        <div className="absolute top-full left-0 mt-2 px-3 py-1 text-xs rounded-lg shadow-lg whitespace-nowrap z-[100] animate-fadeIn font-bold pointer-events-none"
                             style={{ backgroundColor: currentTheme.cardBg, color: currentTheme.cardText, border: `1px solid ${currentTheme.cardBorder}` }}>
                            {reciterToast.name}
                        </div>
                    )}
                </div>
            </header>
            <ReadingTimer isVisible={autoScrollState.isPaused || (!autoScrollState.isActive && autoScrollState.elapsedTime > 0)} elapsedTime={autoScrollState.elapsedTime} />
            <div id="mushaf-content" ref={mushafContentRef} onClick={pauseResumeAutoScroll} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} className="flex-grow w-full relative touch-pan-x horizontal-mushaf-container" style={isTransparentMode ? { position: 'absolute', top: 0, bottom: 0, height: '100%', zIndex: 0, paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))', paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px))' } : {}}>
                {Array.from({ length: 604 }, (_, i) => i + 1).map(pageNum => (
                    <MushafPage 
                        key={pageNum} 
                        pageNum={pageNum} 
                        pageData={visiblePages.includes(pageNum) ? getPageData(pageNum) : []} 
                        highlightedAyahId={highlightedAyahId} 
                        onAyahClick={handleAyahClick} 
                        onVerseClick={handleVerseClick} 
                        onVerseLongPress={handleVerseLongPress} 
                        settings={settings} 
                        isHorizontal={true}
                    />
                ))}
            </div>
            <SajdahNotification isVisible={sajdahInfo.show} surah={sajdahInfo.surah} ayah={sajdahInfo.ayah} />
            <div id="floating-menu" className={isFloatingMenuOpen ? 'open' : ''} ref={floatingMenuRef}>
                 <button onClick={() => { openModal('bookmarks-modal'); setIsFloatingMenuOpen(false); }} className="bottom-bar-button btn-green w-full justify-between mb-2" style={getToolbarStyle('btn-bookmarks-list', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}><span>قائمة الإشارات</span><i className="fa-solid fa-list"></i></button>
                 <button onClick={() => { openModal('search-modal'); setIsFloatingMenuOpen(false); }} className="bottom-bar-button btn-purple w-full justify-between mb-2" style={getToolbarStyle('btn-search', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}><span>البحث</span><i className="fa-solid fa-search"></i></button>
                 <button onClick={() => { openModal('themes-modal'); setIsFloatingMenuOpen(false); }} className="bottom-bar-button btn-green w-full justify-between mb-2" style={getToolbarStyle('btn-themes', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}><span>الثيمات</span><i className="fa-solid fa-palette"></i></button>
            </div>
            <footer id="bottom-bar" className="footer-default flex-none border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10 flex justify-center items-center px-4 py-2 w-full gap-1" style={getToolbarStyle('bottom-toolbar', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}>
                <button ref={menuButtonRef} id="btn-menu" onClick={() => setIsFloatingMenuOpen(p => !p)} className="bottom-bar-button btn-purple flex-1 max-w-[100px]" style={getToolbarStyle('btn-menu', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}><i className="fa-solid fa-bars"></i><span className="hidden sm:inline">القائمة</span></button>
                <button onClick={() => openModal('settings-modal')} className="bottom-bar-button btn-purple flex-1 max-w-[100px]" style={getToolbarStyle('btn-settings', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}><i className="fa-solid fa-cog"></i><span className="hidden sm:inline">الإعدادات</span></button>
                <button 
                    id="btn-bookmark" 
                    onPointerDown={handleBookmarkButtonPointerDown}
                    onPointerUp={handleBookmarkButtonPointerUp}
                    onPointerLeave={handleBookmarkButtonPointerLeave}
                    className="bottom-bar-button btn-green flex-1 max-w-[100px]" 
                    style={{...getToolbarStyle('btn-bookmark', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg), touchAction: 'none'}}
                >
                    <i className="fa-solid fa-bookmark"></i>
                    <span className="hidden sm:inline">حفظ</span>
                </button>
                <button id="btn-home" onClick={onBack} className="bottom-bar-button btn-green flex-1 max-w-[100px]" style={getToolbarStyle('btn-home', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}><i className="fa-solid fa-home"></i><span className="hidden sm:inline">الرئيسية</span></button>
            </footer>
            {activeModals['surah-modal'] && <SurahJuzModal type="surah" quranData={quranData} onSelect={(s, a) => { closeModal('surah-modal'); setTimeout(() => jumpToAyah(s, a, true), 0); }} onClose={() => closeModal('surah-modal')} />}
            {activeModals['juz-modal'] && <SurahJuzModal type="juz" quranData={quranData} onSelect={(j: number) => { closeModal('juz-modal'); setTimeout(() => jumpToAyah(JUZ_MAP[j - 1].s, JUZ_MAP[j - 1].a, true), 0); }} onClose={() => closeModal('juz-modal')} />}
            {activeModals['bookmarks-modal'] && <BookmarksModal bookmarks={bookmarks} quranData={quranData} onSelect={(s,a) => jumpToAyah(s,a, true)} onDelete={deleteBookmark} onClose={() => closeModal('bookmarks-modal')} />}
            {activeModals['search-modal'] && <SearchModal quranData={quranData} onSelect={(s,a) => jumpToAyah(s,a, true)} onClose={() => closeModal('search-modal')} />}
            {activeModals['themes-modal'] && <ThemesModal onClose={() => closeModal('themes-modal')} showToast={showToast} storageKeys={{
    currentThemeId: 'current_theme_id_horizontal',
    toolbarColors: 'toolbar_colors_horizontal',
    transparentMode: 'transparent_mode_horizontal',
    quranSettings: 'quran_settings_horizontal'
}} />}
            {activeModals['settings-modal'] && <SettingsModal onClose={() => closeModal('settings-modal')} onOpenModal={openModal} showToast={showToast} storageKeys={{
    quranSettings: 'quran_settings_horizontal',
    showSajdahCard: 'show_sajdah_card_horizontal'
}} features={{
    hideUIOnScroll: false
}} />}
            {activeModals['reciter-modal'] && <ReciterSelectModal onClose={() => closeModal('reciter-modal')} currentReader={settings.reader} onSelect={(id) => {
                const newSettings = { ...settings, reader: id };
                setSettings(newSettings);
                localStorage.setItem('quran_settings_horizontal', JSON.stringify(newSettings));
                window.dispatchEvent(new Event('settings-change'));
                showToast('تم تغيير القارئ بنجاح');
            }} />}
            {activeModals['toolbar-color-picker-modal'] && <ToolbarColorPickerModal onClose={() => closeModal('toolbar-color-picker-modal')} onOpenModal={openModal} showToast={showToast} currentTheme={currentTheme} toolbarColors={toolbarColors} storageKeys={{
    transparentMode: 'transparent_mode_horizontal',
    toolbarColors: 'toolbar_colors_horizontal'
}} />}
            {activeModals['quran-download-modal'] && <QuranDownloadModal onClose={() => closeModal('quran-download-modal')} quranData={quranData} showToast={showToast} />}
            {activeModals['tafsir-download-modal'] && <TafsirDownloadModal onClose={() => closeModal('tafsir-download-modal')} quranData={quranData} showToast={showToast} />}
            <TafseerModal 
                isOpen={tafseerInfo.isOpen} 
                isLoading={isTafseerLoading} 
                title={`${tafseerName} - ${tafseerInfo.surahName.replace('سورة','').trim()} - آية ${toArabic(tafseerInfo.a)}`} 
                text={tafseerInfo.text} 
                onClose={closeTafseer} 
            />
            <TafseerSelectionModal isOpen={tafseerSelectionInfo.isOpen} onClose={closeTafseerSelection} onSelect={handleTafseerSelect} currentTafseerId={settings.tafseer} />
            <SajdahCardModal info={sajdahCardInfo} onClose={handleCloseSajdahCard} />
            <Toast message={toast.message} show={toast.show} onClose={handleToastClose} />
        </div>
    );
};

export default QuranReaderHorizontal;