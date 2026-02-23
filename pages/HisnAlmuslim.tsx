
import React, { useState } from 'react';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import { HISN_ALMUSLIM_CATEGORIES, HISN_ALMUSLIM_DATA } from '../data/hisnAlmuslimData';

function HisnAlmuslim({ onBack }) {
    const { theme } = useTheme();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [zoomedItem, setZoomedItem] = useState(null);

    const openZoomModal = (item) => {
        setZoomedItem(item);
    };

    const closeZoomModal = () => {
        setZoomedItem(null);
    };

    const CategoriesScreen = () => (
        <div className="p-4 space-y-3">
            {HISN_ALMUSLIM_CATEGORIES.map((category, index) => {
                const colorType = index % 2 === 0 ? 'primary' : 'secondary';
                return (
                    <div key={category.id} onClick={() => setSelectedCategory(category)}
                          className={`themed-card p-4 rounded-xl shadow-sm border-r-4 flex items-center justify-between cursor-pointer active:scale-95 transition`}
                          style={{ borderRightColor: colorType === 'primary' ? theme.palette[0] : theme.palette[1] }}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center`} style={{backgroundColor: colorType === 'primary' ? theme.palette[0]+'20' : theme.palette[1]+'20', color: colorType === 'primary' ? theme.palette[0] : theme.palette[1]}}>
                                <i className={`fa-solid ${category.icon} text-xl`}></i>
                            </div>
                            <div>
                                <h2 className="font-bold text-base">{category.title}</h2>
                            </div>
                        </div>
                        <i className="fa-solid fa-angle-left themed-text-muted"></i>
                    </div>
                )
            })}
        </div>
    );

    const CategoryDetailScreen = () => {
        if (!selectedCategory) return null;
        const items = HISN_ALMUSLIM_DATA[selectedCategory.id] || [];

        return (
            <div className="space-y-4 fade-in">
                {items.map((item, index) => (
                    <div key={index} className="themed-card p-5 rounded-2xl border relative overflow-hidden group mb-4 transition-all duration-300">
                        <p className="text-xl leading-relaxed text-center font-amiri select-none">{item.text}</p>
                        {item.source && <p className="text-xs mt-2 text-center themed-text-muted opacity-80">المصدر: {item.source}</p>}
                        <div className="flex justify-center mt-3">
                            <button onClick={() => openZoomModal(item)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                <i className="fa-solid fa-magnifying-glass-plus text-lg"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const handleHomeClick = () => {
        if (selectedCategory) {
            setSelectedCategory(null);
        } else {
            onBack();
        }
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center">
                        <h1 className="app-top-bar__title text-xl sm:text-2xl font-kufi flex items-center gap-2 justify-center">
                            {selectedCategory ? selectedCategory.title : 'حصن المسلم'}
                        </h1>
                    </div>
                    <p className="app-top-bar__subtitle">
                        {selectedCategory ? `أذكار ${selectedCategory.title}` : 'استعرض أبواب وأذكار حصن المسلم بسهولة.'}
                    </p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto hide-scrollbar relative max-w-md mx-auto w-full p-4 pb-24">
                {selectedCategory ? <CategoryDetailScreen /> : <CategoriesScreen />}
            </main>

            <BottomBar onHomeClick={handleHomeClick} onThemesClick={() => {}} showThemes={false} />

            {zoomedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4" onClick={closeZoomModal}>
                    <div className="themed-card p-6 rounded-2xl w-full max-w-2xl text-center relative" onClick={e => e.stopPropagation()}>
                        <p className="text-4xl md:text-5xl leading-relaxed font-amiri">
                            {zoomedItem.text}
                        </p>
                        {zoomedItem.source && <p className="text-lg mt-4 themed-text-muted opacity-80">المصدر: {zoomedItem.source}</p>}
                        <button onClick={closeZoomModal} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <i className="fa-solid fa-times text-2xl"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HisnAlmuslim;
