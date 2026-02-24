import React, { useState } from 'react';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import { asmaulHusna, AsmaulHusnaItem } from '../data/asmaulHusnaData';

interface AsmaulHusnaProps {
    onBack: () => void;
}

const AsmaulHusna: React.FC<AsmaulHusnaProps> = ({ onBack }) => {
    const { theme } = useTheme();
    const [selectedName, setSelectedName] = useState<AsmaulHusnaItem | null>(null);

    const handleNameClick = (item: AsmaulHusnaItem) => {
        setSelectedName(item);
    };

    const closeModal = () => {
        setSelectedName(null);
    };

    return (
        <div className="h-screen flex flex-col bg-transparent">
            {/* Header */}
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <h1 className="app-top-bar__title text-2xl font-kufi text-center">أسماء الله الحسنى</h1>
                    <p className="app-top-bar__subtitle text-center">لِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا</p>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 pb-24 hide-scrollbar">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6" dir="rtl">
                        {asmaulHusna.map((item) => (
                            <div 
                                key={item.id}
                                onClick={() => handleNameClick(item)}
                                className="aspect-square relative flex flex-col items-center justify-center p-2 rounded-xl themed-card cursor-pointer hover:scale-105 transition-transform duration-200 shadow-sm hover:shadow-md border border-opacity-20 border-gray-400"
                                style={{
                                    background: theme.isOriginal 
                                        ? 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,240,240,0.8) 100%)' 
                                        : undefined
                                }}
                            >
                                {/* Decorative background element */}
                                <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                                    <svg viewBox="0 0 200 200" className="w-full h-full fill-current text-primary">
                                        <path d="M100 0 L120 80 L200 100 L120 120 L100 200 L80 120 L0 100 L80 80 Z" />
                                    </svg>
                                </div>

                                <span className="text-xs opacity-60 font-mono mb-1">{item.id}</span>
                                <h3 className="text-lg sm:text-xl md:text-2xl font-amiri font-bold text-center text-primary" style={{ color: 'var(--color-primary)' }}>
                                    {item.name}
                                </h3>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Bottom Bar */}
            <BottomBar onHomeClick={onBack} onThemesClick={() => {}} showThemes={false} />

            {/* Modal */}
            {selectedName && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in"
                    onClick={closeModal}
                >
                    <div 
                        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden scale-in relative border border-gold-500/30"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: theme.bgColor || (theme.isOriginal ? '#fff' : undefined),
                            color: theme.textColor
                        }}
                    >
                        {/* Modal Header with decorative pattern */}
                        <div className="h-24 bg-primary/10 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10 pattern-islamic"></div>
                            <h2 className="text-4xl font-amiri font-bold text-primary drop-shadow-sm" style={{ color: 'var(--color-primary)' }}>
                                {selectedName.name}
                            </h2>
                            <button 
                                onClick={closeModal}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors"
                            >
                                <i className="fa-solid fa-times text-lg opacity-70"></i>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6 text-center">
                            <div>
                                <h4 className="text-sm font-bold opacity-50 mb-2 uppercase tracking-wider">المعنى</h4>
                                <p className="text-lg font-cairo leading-relaxed">
                                    {selectedName.meaning}
                                </p>
                            </div>

                            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                                <h4 className="text-sm font-bold opacity-50 mb-2 uppercase tracking-wider">الدليل</h4>
                                <p className="text-base font-amiri leading-loose text-primary" style={{ color: 'var(--color-primary)' }}>
                                    {selectedName.evidence}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AsmaulHusna;
