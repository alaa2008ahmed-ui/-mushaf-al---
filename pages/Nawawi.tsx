import React, { useState } from 'react';
import { NAWAWI_DATA } from '../data/nawawiData';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';

const HadithModal = ({ hadith, onClose }) => {
    const { theme, themeKey } = useTheme();
    const [fontSize, setFontSize] = useState(18);
    const isBlackAndWhite = themeKey === 'black_and_white';
    const primaryColor = isBlackAndWhite ? '#FFFFFF' : theme.palette[0];

    const increaseFontSize = () => {
        setFontSize(prev => (prev >= 32 ? 18 : prev + 4));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="themed-card rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: theme.cardBorder }}>
                    <div className="w-10"></div> {/* Spacer for centering */}
                    <h3 className="text-xl font-bold font-kufi text-center flex-1" style={{ color: primaryColor }}>{hadith.title}</h3>
                    <button 
                        onClick={increaseFontSize}
                        className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center transition hover:bg-gray-200 dark:hover:bg-gray-600"
                        title="تكبير النص"
                    >
                        <i className="fas fa-search-plus text-lg" style={{ color: primaryColor }}></i>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto leading-loose text-right font-amiri" style={{ fontSize: `${fontSize}px` }}>
                    <p>{hadith.hadith}</p>
                </div>
                <div className="p-3 border-t" style={{ borderColor: theme.cardBorder }}>
                    <button onClick={onClose} className="w-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 py-2.5 rounded-lg font-bold transition hover:opacity-90">
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

const Nawawi = ({ onBack }) => {
    const { theme, themeKey } = useTheme();
    const [selectedHadith, setSelectedHadith] = useState(null);
    const isBlackAndWhite = themeKey === 'black_and_white';
    const primaryColor = isBlackAndWhite ? '#FFFFFF' : theme.palette[0];

    return (
        <div className="h-screen flex flex-col font-cairo overflow-hidden" style={{ backgroundColor: theme.bg, color: theme.textColor }}>
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <h1 className="app-top-bar__title text-2xl font-kufi">الأربعون النووية</h1>
                    <p className="app-top-bar__subtitle">متن الأربعين حديثًا في مباني الإسلام وقواعد الأحكام</p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
                {NAWAWI_DATA.map(hadith => (
                    <div key={hadith.id} onClick={() => setSelectedHadith(hadith)} className="themed-card p-4 rounded-xl shadow-md cursor-pointer transition-transform transform hover:scale-105">
                        <p className="font-bold text-base" style={{ color: primaryColor }}>{hadith.title}</p>
                    </div>
                ))}
            </main>

            {selectedHadith && <HadithModal hadith={selectedHadith} onClose={() => setSelectedHadith(null)} />}

            <BottomBar onHomeClick={onBack} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
};

export default Nawawi;
