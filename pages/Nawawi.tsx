import React, { useState } from 'react';
import { NAWAWI_DATA } from '../data/nawawiData';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';

const HadithModal = ({ hadith, onClose }) => {
    const { theme } = useTheme();
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="themed-card rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b" style={{ borderColor: theme.cardBorder }}>
                    <h3 className="text-xl font-bold font-kufi text-center" style={{ color: theme.palette[0] }}>{hadith.title}</h3>
                </div>
                <div className="p-6 overflow-y-auto text-lg leading-loose text-right font-amiri">
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
    const { theme } = useTheme();
    const [selectedHadith, setSelectedHadith] = useState(null);

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
                        <p className="font-bold text-lg" style={{ color: theme.palette[0] }}>{hadith.title}</p>
                    </div>
                ))}
            </main>

            {selectedHadith && <HadithModal hadith={selectedHadith} onClose={() => setSelectedHadith(null)} />}

            <BottomBar onHomeClick={onBack} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
};

export default Nawawi;
