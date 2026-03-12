import { useState, useRef, useCallback, useEffect } from 'react';

declare var window: any;

interface UseQuranAudioProps {
    quranData: any;
    reader: string;
    currentAyah: { s: number; a: number };
    setCurrentAyah: (ayah: { s: number; a: number }) => void;
    setHighlightedAyahId: (id: string | null) => void;
    scrollToAyah: (s: number, a: number, instant?: boolean) => void;
    showToast: (msg: string) => void;
    readersList: any[];
}

export const useQuranAudio = ({
    quranData,
    reader,
    currentAyah,
    setCurrentAyah,
    setHighlightedAyahId,
    scrollToAyah,
    showToast,
    readersList
}: UseQuranAudioProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [playingAyah, setPlayingAyah] = useState<{s: number; a: number} | null>(null);
    const [reciterToast, setReciterToast] = useState({ show: false, name: '' });
    
    const audioCacheRef = useRef<Record<string, HTMLAudioElement>>({});
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);
    const isPlayingRef = useRef(isPlaying);
    useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
    const isAudioLoadingRef = useRef(isAudioLoading);
    useEffect(() => { isAudioLoadingRef.current = isAudioLoading; }, [isAudioLoading]);

    const stopAudio = useCallback(() => {
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.onended = null;
        }
        setIsPlaying(false);
        setIsAudioLoading(false);
        setPlayingAyah(null);
    }, []);

    useEffect(() => {
        return () => {
            stopAudio();
        };
    }, [stopAudio]);

    const playNextAyahRef = useRef<() => void>(() => {});

    const manageAudioCache = useCallback((currentS: number, currentA: number) => {
        const keys = Object.keys(audioCacheRef.current);
        if (keys.length <= 20) return;
        for (const key of keys) {
            const [s, a] = key.split(':').map(Number);
            if (Math.abs(currentA - a) > 10 || currentS !== s) {
                delete audioCacheRef.current[key];
            }
        }
    }, []);

    const preloadAudioQueue = useCallback(async (s: number, startAyah: number) => {
        if (!quranData) return;
        const surah = quranData.surahs[s - 1];
        if (!surah) return;

        for (let i = 0; i < 10; i++) {
            const ayahNum = startAyah + i;
            if (ayahNum > surah.ayahs.length) break;
            const cacheKey = `${s}:${ayahNum}`;
            if (!audioCacheRef.current[cacheKey]) {
                const surahStr = String(s).padStart(3, '0');
                const ayahStr = String(ayahNum).padStart(3, '0');
                const audioUrl = `https://everyayah.com/data/${reader}/${surahStr}${ayahStr}.mp3`;
                
                try {
                    if ('caches' in window) {
                        const cache = await caches.open('quran-audio-cache');
                        const cachedResponse = await cache.match(audioUrl);
                        if (!cachedResponse) {
                            const audio = new Audio(audioUrl);
                            audio.preload = 'auto';
                            audioCacheRef.current[cacheKey] = audio;
                        }
                    } else {
                         const audio = new Audio(audioUrl);
                         audio.preload = 'auto';
                         audioCacheRef.current[cacheKey] = audio;
                    }
                } catch (e) { console.warn("Preloading failed", e); }
            }
        }
    }, [reader, quranData]);

    const playAudio = useCallback(async (s: number, a: number) => {
        stopAudio();
        setIsAudioLoading(true);
        setPlayingAyah({ s, a });
        setCurrentAyah({ s, a });
        setHighlightedAyahId(`ayah-${s}-${a}`);
        scrollToAyah(s, a, false);
    
        const cacheKey = `${s}:${a}`;
        let audio: HTMLAudioElement;
    
        if (audioCacheRef.current[cacheKey]) {
            audio = audioCacheRef.current[cacheKey];
            audio.currentTime = 0;
        } else {
            const surahStr = String(s).padStart(3, '0');
            const ayahStr = String(a).padStart(3, '0');
            const audioUrl = `https://everyayah.com/data/${reader}/${surahStr}${ayahStr}.mp3`;
            let audioSrc = audioUrl;

            try {
                if ('caches' in window) {
                    const cache = await caches.open('quran-audio-cache');
                    const cachedResponse = await cache.match(audioUrl);
                    if (cachedResponse) {
                        const blob = await cachedResponse.blob();
                        audioSrc = URL.createObjectURL(blob);
                        showToast(`تشغيل من المحفوظات`);
                    }
                }
            } catch (e) { console.warn("Cache API check failed", e); }
    
            audio = new Audio(audioSrc);
            audio.preload = 'auto';
            audioCacheRef.current[cacheKey] = audio;
        }
    
        currentAudioRef.current = audio;
    
        audio.onplaying = () => { setIsPlaying(true); setIsAudioLoading(false); };
        audio.onpause = () => setIsPlaying(false);
        audio.onwaiting = () => setIsAudioLoading(true);
        audio.onended = () => playNextAyahRef.current();
        audio.onerror = () => {
            showToast('خطأ في تحميل المقطع الصوتي.');
            stopAudio();
            delete audioCacheRef.current[cacheKey];
        };
    
        try {
            await audio.play();
            preloadAudioQueue(s, a + 1);
            manageAudioCache(s, a);
        } catch (error) {
            showToast('فشل تشغيل الصوت.');
            stopAudio();
            delete audioCacheRef.current[cacheKey];
        }
    }, [reader, stopAudio, preloadAudioQueue, manageAudioCache, showToast, scrollToAyah, setCurrentAyah, setHighlightedAyahId]);

    const playNextAyah = useCallback(() => {
        if (!quranData || !playingAyah) return stopAudio();
        const { s, a } = playingAyah;
        const surah = quranData.surahs[s - 1];
        if (!surah) return stopAudio();
    
        if (a < surah.ayahs.length) {
            const nextAyah = { s, a: a + 1 };
            playAudio(nextAyah.s, nextAyah.a);
        } else {
            stopAudio();
            showToast('انتهت السورة');
        }
    }, [quranData, playingAyah, stopAudio, showToast, playAudio]);

    useEffect(() => { playNextAyahRef.current = playNextAyah; }, [playNextAyah]);

    useEffect(() => {
        audioCacheRef.current = {};
        if (isPlaying || isAudioLoading) {
            const target = playingAyah || currentAyah;
            playAudio(target.s, target.a);
        }
    }, [reader]);

    const toggleAudio = useCallback(() => {
        if (isPlaying || isAudioLoading) stopAudio();
        else if (currentAyah) {
            playAudio(currentAyah.s, currentAyah.a);
            const reciterName = readersList.find(r => r.id === reader)?.name || 'القارئ';
            setReciterToast({ show: true, name: reciterName });
            setTimeout(() => setReciterToast(prev => ({ ...prev, show: false })), 2000);
        }
        else showToast('الرجاء اختيار آية للبدء');
    }, [isPlaying, isAudioLoading, currentAyah, playAudio, stopAudio, reader, readersList, showToast]);

    return {
        isPlaying,
        isAudioLoading,
        playingAyah,
        reciterToast,
        playAudio,
        stopAudio,
        toggleAudio,
        isPlayingRef,
        isAudioLoadingRef
    };
};
