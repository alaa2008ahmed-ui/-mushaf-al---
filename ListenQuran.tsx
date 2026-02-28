import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Pause, Volume2, Search, User } from 'lucide-react';

const RECITERS = [
    { id: 'islam_sobhi', name: 'إسلام صبحي', url: 'https://server14.mp3quran.net/islam/Rewayat-Hafs-A-n-Assem/' },
    { id: 'mishary_alafasy', name: 'مشاري راشد العفاسي', url: 'https://server8.mp3quran.net/afs/' },
    { id: 'abdul_basit_murattal', name: 'عبد الباسط عبد الصمد (مرتل)', url: 'https://server7.mp3quran.net/basit/' },
    { id: 'maher_al_muaiqly', name: 'ماهر المعيقلي', url: 'https://server12.mp3quran.net/maher/' },
    { id: 'saad_al_ghamdi', name: 'سعد الغامدي', url: 'https://server7.mp3quran.net/s_gmd/' },
    { id: 'ahmed_al_ajmi', name: 'أحمد بن علي العجمي', url: 'https://server10.mp3quran.net/ajm/' },
    { id: 'yasser_al_dosari', name: 'ياسر الدوسري', url: 'https://server11.mp3quran.net/yasser/' },
    { id: 'mohamed_siddiq_minshawi', name: 'محمد صديق المنشاوي (مرتل)', url: 'https://server10.mp3quran.net/minsh/' },
    { id: 'mahmoud_khalil_hussary', name: 'محمود خليل الحصري (مرتل)', url: 'https://server13.mp3quran.net/husr/' },
    { id: 'abdul_rahman_sudais', name: 'عبد الرحمن السديس', url: 'https://server11.mp3quran.net/sds/' },
];

const SURAH_NAMES = [
    "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
    "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه",
    "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم",
    "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر",
    "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
    "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة",
    "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج",
    "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس",
    "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد",
    "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات",
    "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر",
    "المسد", "الإخلاص", "الفلق", "الناس"
];

const ListenQuran: React.FC = () => {
    const navigate = useNavigate();
    const [selectedReciter, setSelectedReciter] = useState<typeof RECITERS[0] | null>(null);
    const [currentSurahIndex, setCurrentSurahIndex] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const filteredReciters = RECITERS.filter(r => r.name.includes(searchQuery));
    const filteredSurahs = SURAH_NAMES.map((name, index) => ({ name, index })).filter(item => item.name.includes(searchQuery));

    const handleReciterClick = (reciter: typeof RECITERS[0]) => {
        setSelectedReciter(reciter);
        setSearchQuery("");
    };

    const handleSurahClick = (index: number) => {
        if (currentSurahIndex === index && isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
        } else {
            setCurrentSurahIndex(index);
            setIsPlaying(true);
        }
    };

    useEffect(() => {
        if (selectedReciter && currentSurahIndex !== null) {
            if (!audioRef.current) {
                audioRef.current = new Audio();
            }
            
            const surahId = (currentSurahIndex + 1).toString().padStart(3, '0');
            const url = `${selectedReciter.url}${surahId}.mp3`;
            
            if (audioRef.current.src !== url) {
                audioRef.current.src = url;
                audioRef.current.play().catch(e => console.error("Error playing audio:", e));
                setIsPlaying(true);
            } else {
                 if (isPlaying) audioRef.current.play();
                 else audioRef.current.pause();
            }
            
            audioRef.current.onended = () => setIsPlaying(false);
            audioRef.current.onpause = () => setIsPlaying(false);
            audioRef.current.onplay = () => setIsPlaying(true);
        }
    }, [selectedReciter, currentSurahIndex, isPlaying]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col font-[var(--font-ui)]">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow p-4 flex items-center sticky top-0 z-10">
                {selectedReciter ? (
                    <button onClick={() => setSelectedReciter(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ml-2">
                        <ArrowRight size={24} />
                    </button>
                ) : (
                    <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ml-2">
                        <ArrowRight size={24} />
                    </button>
                )}
                <h1 className="text-xl font-bold flex-1 text-center">
                    {selectedReciter ? selectedReciter.name : "الاستماع للقرآن الكريم"}
                </h1>
                <div className="w-10"></div>
            </div>

            {/* Search */}
            <div className="p-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder={selectedReciter ? "ابحث عن سورة..." : "ابحث عن قارئ..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-3 pr-10 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <Search className="absolute right-3 top-3.5 text-gray-400" size={20} />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 pb-24">
                {!selectedReciter ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredReciters.map((reciter) => (
                            <div
                                key={reciter.id}
                                onClick={() => handleReciterClick(reciter)}
                                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4 border border-gray-100 dark:border-gray-700"
                            >
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <User size={24} />
                                </div>
                                <span className="font-semibold text-lg">{reciter.name}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredSurahs.map(({ name, index }) => (
                            <div
                                key={index}
                                onClick={() => handleSurahClick(index)}
                                className={`p-4 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                                    currentSurahIndex === index
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 border'
                                        : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-100 dark:border-gray-700'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                        currentSurahIndex === index 
                                        ? 'bg-emerald-500 text-white' 
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <span className={`font-semibold text-lg ${currentSurahIndex === index ? 'text-emerald-700 dark:text-emerald-400' : ''}`}>
                                        سورة {name}
                                    </span>
                                </div>
                                {currentSurahIndex === index && (
                                    <div className="text-emerald-500">
                                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Player Bar */}
            {selectedReciter && currentSurahIndex !== null && (
                <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg z-50">
                    <div className="max-w-3xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                            <button 
                                onClick={togglePlay}
                                className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
                            >
                                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                            </button>
                            <div className="flex flex-col">
                                <span className="font-bold text-sm md:text-base text-gray-900 dark:text-white">
                                    سورة {SURAH_NAMES[currentSurahIndex]}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {selectedReciter.name}
                                </span>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-gray-400">
                            <Volume2 size={20} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListenQuran;