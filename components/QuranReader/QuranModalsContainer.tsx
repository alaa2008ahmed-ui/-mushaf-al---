import React from 'react';
import SearchModal from './SearchModal';
import ThemesModal from './ThemesModal';
import SettingsModal from './SettingsModal';
import ToolbarColorPickerModal from './ToolbarColorPickerModal';
import { QuranDownloadModal, TafsirDownloadModal } from './DownloadModals';
import SurahJuzModal from './SurahJuzModal';
import BookmarksModal from './BookmarksModal';
import TafseerModal from './TafseerModal';
import ReciterSelectModal from './ReciterSelectModal';
import SajdahCardModal from './SajdahCardModal';
import TafseerSelectionModal from './TafseerSelectionModal';
import MushafSelectionModal from './MushafSelectionModal';
import FontSelectModal from './FontSelectModal';
import ScrollSpeedModal from './ScrollSpeedModal';
import AutoScrollSettingsModal from './AutoScrollSettingsModal';
import { JUZ_MAP, toArabic, TAFSEERS } from './constants';

interface QuranModalsContainerProps {
    activeModals: string[];
    closeModal: (modalName: string) => void;
    isLandscape: boolean;
    settings: any;
    setSettings: React.Dispatch<React.SetStateAction<any>>;
    modeSuffix: string;
    quranData: any;
    jumpToAyah: (s: number, a: number, instant?: boolean) => void;
    showToast: (msg: string) => void;
    currentTheme: any;
    toolbarColors: any;
    openModal: (modalName: string) => void;
    tafseerInfo: any;
    setTafseerInfo: React.Dispatch<React.SetStateAction<any>>;
    isTafseerLoading: boolean;
    autoScrollPausedRef: React.MutableRefObject<boolean>;
    setAutoScrollState: React.Dispatch<React.SetStateAction<any>>;
    tafseerSelectionInfo: any;
    setTafseerSelectionInfo: React.Dispatch<React.SetStateAction<any>>;
    handleTafseerSelect: (id: string) => void;
    useTajweed: boolean;
    handleMushafTypeSelect: (type: 'uthmani' | 'tajweed') => void;
    sajdahCardInfo: any;
    handleCloseSajdahCard: () => void;
    bookmarks: any[];
    bookmarksFilter: boolean | null;
    setBookmarksFilter: (filter: boolean | null) => void;
    deleteBookmark: (id: number) => void;
    setIsLandscape: React.Dispatch<React.SetStateAction<boolean>>;
    isLandscapeRef: React.MutableRefObject<boolean>;
    isAutoScrollSettingsOpen: boolean;
    setIsAutoScrollSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const QuranModalsContainer: React.FC<QuranModalsContainerProps> = ({
    activeModals, closeModal, isLandscape, settings, setSettings, modeSuffix,
    quranData, jumpToAyah, showToast, currentTheme, toolbarColors, openModal,
    tafseerInfo, setTafseerInfo, isTafseerLoading, autoScrollPausedRef, setAutoScrollState,
    tafseerSelectionInfo, setTafseerSelectionInfo, handleTafseerSelect, useTajweed,
    handleMushafTypeSelect, sajdahCardInfo, handleCloseSajdahCard, bookmarks,
    bookmarksFilter, setBookmarksFilter, deleteBookmark, setIsLandscape, isLandscapeRef,
    isAutoScrollSettingsOpen, setIsAutoScrollSettingsOpen
}) => {
    const tafseerName = TAFSEERS.find(t => t.id === settings.tafseer)?.name || 'التفسير';

    return (
        <>
            {isAutoScrollSettingsOpen && (
                <AutoScrollSettingsModal
                    isOpen={isAutoScrollSettingsOpen}
                    onClose={() => setIsAutoScrollSettingsOpen(false)}
                    onSelectTime={(minutes) => {
                        setSettings((p: any) => ({...p, scrollMinutes: minutes}));
                        localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify({...settings, scrollMinutes: minutes}));
                    }}
                    currentMinutes={settings.scrollMinutes}
                    isLandscape={isLandscape}
                />
            )}
            {activeModals.includes('surah-modal') && <SurahJuzModal type="surah" quranData={quranData} onSelect={(s, a) => { closeModal('surah-modal'); setTimeout(() => jumpToAyah(s, a, true), 0); }} onClose={() => closeModal('surah-modal')} isLandscape={isLandscape} />}
            {activeModals.includes('juz-modal') && <SurahJuzModal type="juz" quranData={quranData} onSelect={(j: number) => { closeModal('juz-modal'); setTimeout(() => jumpToAyah(JUZ_MAP[j - 1].s, JUZ_MAP[j - 1].a, true), 0); }} onClose={() => closeModal('juz-modal')} isLandscape={isLandscape} />}
            {activeModals.includes('bookmarks-modal') && (
                <BookmarksModal 
                    bookmarks={bookmarks} 
                    quranData={quranData} 
                    filterLandscape={bookmarksFilter}
                    isLandscape={isLandscape}
                    onSelect={(s, a, isL) => {
                        if (isL !== isLandscapeRef.current) {
                            setIsLandscape(isL);
                        }
                        jumpToAyah(s, a, true);
                    }} 
                    onDelete={deleteBookmark} 
                    onClose={() => {
                        closeModal('bookmarks-modal');
                        setBookmarksFilter(null);
                    }} 
                />
            )}
            {activeModals.includes('search-modal') && <SearchModal quranData={quranData} onSelect={(s,a) => jumpToAyah(s,a, true)} onClose={() => closeModal('search-modal')} isLandscape={isLandscape} />}
            {activeModals.includes('themes-modal') && <ThemesModal onClose={() => closeModal('themes-modal')} showToast={showToast} isLandscape={isLandscape} />}
            {activeModals.includes('settings-modal') && <SettingsModal onClose={() => closeModal('settings-modal')} onOpenModal={openModal} showToast={showToast} isLandscape={isLandscape} />}
            {activeModals.includes('font-modal') && <FontSelectModal isOpen={true} onClose={() => closeModal('font-modal')} isLandscape={isLandscape} currentFontId={settings.fontFamily} onSelect={(id) => {
                const newSettings = { ...settings, fontFamily: id };
                setSettings(newSettings);
                localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(newSettings));
                window.dispatchEvent(new Event('settings-change'));
                showToast('تم تغيير الخط بنجاح');
                closeModal('font-modal');
            }} />}
            {activeModals.includes('scroll-speed-modal') && <ScrollSpeedModal isOpen={true} onClose={() => closeModal('scroll-speed-modal')} isLandscape={isLandscape} currentMinutes={settings.scrollMinutes} onSelect={(m) => {
                const newSettings = { ...settings, scrollMinutes: m };
                setSettings(newSettings);
                localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(newSettings));
                window.dispatchEvent(new Event('settings-change'));
                showToast('تم تغيير سرعة التمرير');
                closeModal('scroll-speed-modal');
            }} />}
            {activeModals.includes('reciter-modal') && <ReciterSelectModal onClose={() => closeModal('reciter-modal')} currentReader={settings.reader} isLandscape={isLandscape} onSelect={(id) => {
                const newSettings = { ...settings, reader: id };
                setSettings(newSettings);
                localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(newSettings));
                window.dispatchEvent(new Event('settings-change'));
                showToast('تم تغيير القارئ بنجاح');
            }} />}
            {activeModals.includes('toolbar-color-picker-modal') && <ToolbarColorPickerModal onClose={() => closeModal('toolbar-color-picker-modal')} onOpenModal={openModal} showToast={showToast} currentTheme={currentTheme} toolbarColors={toolbarColors} isLandscape={isLandscape} />}
            {activeModals.includes('quran-download-modal') && <QuranDownloadModal onClose={() => closeModal('quran-download-modal')} quranData={quranData} showToast={showToast} isLandscape={isLandscape} />}
            {activeModals.includes('tafsir-download-modal') && <TafsirDownloadModal onClose={() => closeModal('tafsir-download-modal')} quranData={quranData} showToast={showToast} isLandscape={isLandscape} />}
            <TafseerModal 
                isOpen={tafseerInfo.isOpen} 
                isLoading={isTafseerLoading} 
                isLandscape={isLandscape}
                title={`${tafseerName} - ${tafseerInfo.surahName.replace('سورة','').trim()} - آية ${toArabic(tafseerInfo.a)}`} 
                text={tafseerInfo.text} 
                onClose={() => {
                    if (tafseerInfo.wasAutoscrolling) {
                        autoScrollPausedRef.current = false;
                        setAutoScrollState((p: any) => ({ ...p, isPaused: false }));
                    }
                    setTafseerInfo((p: any) => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                }} 
            />
            <TafseerSelectionModal 
                isOpen={tafseerSelectionInfo.isOpen} 
                isLandscape={isLandscape}
                onClose={() => {
                    if (tafseerSelectionInfo.wasAutoscrolling) {
                        autoScrollPausedRef.current = false;
                        setAutoScrollState((p: any) => ({ ...p, isPaused: false }));
                    }
                    setTafseerSelectionInfo((p: any) => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                }} 
                onSelect={handleTafseerSelect} 
                currentTafseerId={settings.tafseer} 
            />
            <MushafSelectionModal
                isOpen={activeModals.includes('mushaf-selection-modal')}
                isLandscape={isLandscape}
                onClose={() => closeModal('mushaf-selection-modal')}
                onSelect={handleMushafTypeSelect}
                currentType={useTajweed ? 'tajweed' : 'uthmani'}
            />
            <SajdahCardModal info={sajdahCardInfo} onClose={handleCloseSajdahCard} isLandscape={isLandscape} />
        </>
    );
};

export default QuranModalsContainer;
