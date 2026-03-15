import React from 'react';
import { toArabic } from './constants';

interface QuranHeaderProps {
    autoScrollState: { isActive: boolean; isPaused: boolean; elapsedTime: number };
    settings: any;
    isAutoScrollSettingsOpen: boolean;
    getToolbarStyle: (type: string, bg: string, text: string, border: string) => React.CSSProperties;
    currentTheme: any;
    openModal: (modalName: string) => void;
    surahName: string;
    currentAyah: { s: number; a: number };
    juz: number;
    isPageInputActive: boolean;
    pageInputRef: React.RefObject<HTMLInputElement>;
    pageInput: string;
    handlePageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handlePageInputBlur: () => void;
    handlePageInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    handlePageButtonClick: () => void;
    page: number;
    handlePlayButtonPointerDown: () => void;
    handlePlayButtonPointerUp: () => void;
    handlePlayButtonPointerLeave: () => void;
    renderPlayButtonIcon: () => React.ReactNode;
    reciterToast: { show: boolean; name: string };
}

const QuranHeader: React.FC<QuranHeaderProps> = ({
    autoScrollState,
    settings,
    isAutoScrollSettingsOpen,
    getToolbarStyle,
    currentTheme,
    openModal,
    surahName,
    currentAyah,
    juz,
    isPageInputActive,
    pageInputRef,
    pageInput,
    handlePageInputChange,
    handlePageInputBlur,
    handlePageInputKeyDown,
    handlePageButtonClick,
    page,
    handlePlayButtonPointerDown,
    handlePlayButtonPointerUp,
    handlePlayButtonPointerLeave,
    renderPlayButtonIcon,
    reciterToast
}) => {
    return (
        <header id="header" className={`header-default flex-none z-50 flex items-center px-4 justify-between border-b shadow-xl w-full gap-2 ${autoScrollState.isActive && !autoScrollState.isPaused && settings.hideUIOnAutoScroll && !isAutoScrollSettingsOpen ? 'hidden' : ''}`} style={getToolbarStyle('top-toolbar', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}>
            <button 
                id="surah-name-header" 
                onClick={() => openModal('surah-modal')}
                className="top-bar-text-button" 
                style={getToolbarStyle('surah', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}
            >
                <span>{surahName} - آية {toArabic(currentAyah.a)}</span>
            </button>
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
    );
};

export default QuranHeader;
