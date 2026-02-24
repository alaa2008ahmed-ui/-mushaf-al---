import React, { useState, useEffect, useRef, useMemo } from 'react';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import { ALL_RADIOS, RadioStation } from '../data/quranRadioData';

interface QuranRadioProps {
    onBack: () => void;
}

const QuranRadio: React.FC<QuranRadioProps> = ({ onBack }) => {
    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize Audio Element
    useEffect(() => {
        audioRef.current = new Audio();
        
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleWaiting = () => setIsLoading(true);
        const handlePlaying = () => setIsLoading(false);
        const handleError = () => {
            setIsLoading(false);
            setIsPlaying(false);
            alert('عذراً، حدث خطأ في تشغيل هذه الإذاعة. يرجى المحاولة لاحقاً.');
        };

        audioRef.current.addEventListener('play', handlePlay);
        audioRef.current.addEventListener('pause', handlePause);
        audioRef.current.addEventListener('waiting', handleWaiting);
        audioRef.current.addEventListener('playing', handlePlaying);
        audioRef.current.addEventListener('error', handleError);

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.removeEventListener('play', handlePlay);
                audioRef.current.removeEventListener('pause', handlePause);
                audioRef.current.removeEventListener('waiting', handleWaiting);
                audioRef.current.removeEventListener('playing', handlePlaying);
                audioRef.current.removeEventListener('error', handleError);
            }
        };
    }, []);

    // Media Session API (Lock Screen Controls)
    useEffect(() => {
        if ('mediaSession' in navigator && currentStation) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentStation.name,
                artist: 'إذاعة القرآن الكريم',
                album: 'مصحف أحمد وليلى',
                artwork: [
                    { src: 'https://cdn-icons-png.flaticon.com/512/3023/3023571.png', sizes: '512x512', type: 'image/png' }
                ]
            });

            navigator.mediaSession.setActionHandler('play', () => {
                audioRef.current?.play();
            });
            navigator.mediaSession.setActionHandler('pause', () => {
                audioRef.current?.pause();
            });
            navigator.mediaSession.setActionHandler('stop', () => {
                audioRef.current?.pause();
                setIsPlaying(false);
            });
        }
    }, [currentStation]);

    const handleStationClick = (station: RadioStation) => {
        if (currentStation?.id === station.id) {
            togglePlay();
        } else {
            playStation(station);
        }
    };

    const playStation = (station: RadioStation) => {
        if (audioRef.current) {
            setIsLoading(true);
            audioRef.current.src = station.url;
            audioRef.current.play().catch(e => {
                console.error("Playback failed", e);
                setIsLoading(false);
            });
            setCurrentStation(station);
        }
    };

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
        }
    };

    const filteredStations = useMemo(() => {
        if (!searchQuery) return ALL_RADIOS;
        return ALL_RADIOS.filter(station => 
            station.name.includes(searchQuery) || 
            station.category.includes(searchQuery)
        );
    }, [searchQuery]);

    // Group by category
    const groupedStations = useMemo(() => {
        const groups: { [key: string]: RadioStation[] } = {};
        filteredStations.forEach(station => {
            if (!groups[station.category]) {
                groups[station.category] = [];
            }
            groups[station.category].push(station);
        });
        return groups;
    }, [filteredStations]);

    return (
        <div className="h-screen flex flex-col bg-transparent">
            {/* Header */}
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <h1 className="app-top-bar__title text-2xl font-kufi text-center">إذاعة القرآن الكريم</h1>
                    <p className="app-top-bar__subtitle text-center">بث مباشر لأعذب التلاوات</p>
                </div>
            </header>

            {/* Search Bar */}
            <div className="p-4 pb-2 sticky top-[calc(env(safe-area-inset-top)+60px)] z-30 backdrop-blur-md bg-opacity-90 transition-colors duration-300" style={{ backgroundColor: theme.isOriginal ? 'rgba(255,255,255,0.8)' : 'transparent' }}>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="ابحث عن قارئ أو إذاعة..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-3 pr-10 rounded-xl border focus:outline-none focus:ring-2 transition-all shadow-sm"
                        style={{
                            backgroundColor: theme.isOriginal ? '#fff' : 'rgba(255,255,255,0.1)',
                            borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.2)',
                            color: theme.textColor,
                            fontFamily: theme.font
                        }}
                    />
                    <i className="fa-solid fa-search absolute right-3 top-1/2 transform -translate-y-1/2 opacity-50" style={{ color: theme.textColor }}></i>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 pb-32 hide-scrollbar">
                {Object.keys(groupedStations).length === 0 ? (
                    <div className="text-center mt-10 opacity-60">
                        <p>لا توجد نتائج مطابقة لبحثك</p>
                    </div>
                ) : (
                    Object.entries(groupedStations).map(([category, stations]) => (
                        <div key={category} className="mb-6">
                            <h2 className="text-lg font-bold mb-3 px-2 flex items-center gap-2" style={{ color: theme.textColor }}>
                                <span className="w-1 h-6 rounded-full bg-primary block"></span>
                                {category}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {(stations as RadioStation[]).map(station => (
                                    <div 
                                        key={station.id}
                                        onClick={() => handleStationClick(station)}
                                        className={`
                                            p-3 rounded-xl flex items-center gap-4 cursor-pointer transition-all duration-200
                                            ${currentStation?.id === station.id ? 'ring-2 ring-primary transform scale-[1.02]' : 'hover:bg-black/5 dark:hover:bg-white/5'}
                                        `}
                                        style={{
                                            backgroundColor: currentStation?.id === station.id 
                                                ? (theme.isOriginal ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.15)') 
                                                : (theme.isOriginal ? '#fff' : 'rgba(255,255,255,0.05)'),
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                            border: `1px solid ${theme.isOriginal ? '#f3f4f6' : 'rgba(255,255,255,0.1)'}`
                                        }}
                                    >
                                        <div className={`
                                            w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors
                                            ${currentStation?.id === station.id ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}
                                        `}>
                                            {currentStation?.id === station.id && isLoading ? (
                                                <i className="fa-solid fa-circle-notch fa-spin"></i>
                                            ) : currentStation?.id === station.id && isPlaying ? (
                                                <div className="flex gap-0.5 items-end h-4">
                                                    <div className="w-1 bg-white animate-[bounce_1s_infinite] h-2"></div>
                                                    <div className="w-1 bg-white animate-[bounce_1.2s_infinite] h-4"></div>
                                                    <div className="w-1 bg-white animate-[bounce_0.8s_infinite] h-3"></div>
                                                </div>
                                            ) : (
                                                <i className="fa-solid fa-play ml-0.5"></i>
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-sm truncate" style={{ color: theme.textColor }}>
                                                {station.name}
                                            </h3>
                                            <p className="text-xs opacity-60 truncate" style={{ color: theme.textColor }}>
                                                {station.category}
                                            </p>
                                        </div>

                                        {currentStation?.id === station.id && (
                                            <div className="text-primary text-xs font-bold px-2 py-1 rounded-md bg-primary/10">
                                                {isPlaying ? 'جاري التشغيل' : 'متوقف مؤقتاً'}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </main>

            {/* Player Control Bar (Floating) */}
            {currentStation && (
                <div className="fixed bottom-[70px] left-4 right-4 z-40">
                    <div 
                        className="rounded-2xl p-3 shadow-xl backdrop-blur-xl flex items-center gap-4 border border-white/10"
                        style={{ 
                            backgroundColor: theme.isOriginal ? 'rgba(255,255,255,0.95)' : 'rgba(30, 41, 59, 0.95)',
                            color: theme.textColor
                        }}
                    >
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                            {isLoading ? (
                                <i className="fa-solid fa-circle-notch fa-spin text-xl"></i>
                            ) : (
                                <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play ml-1'} text-xl`}></i>
                            )}
                        </div>

                        <div className="flex-1 min-w-0" onClick={togglePlay}>
                            <p className="font-bold text-sm truncate">{currentStation.name}</p>
                            <p className="text-xs opacity-70 truncate">إذاعة القرآن الكريم</p>
                        </div>

                        <button 
                            onClick={togglePlay}
                            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        >
                            <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play ml-1'} text-lg`}></i>
                        </button>
                    </div>
                </div>
            )}

            <BottomBar onHomeClick={onBack} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
};

export default QuranRadio;
