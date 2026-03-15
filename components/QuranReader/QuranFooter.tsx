import React from 'react';

interface QuranFooterProps {
    autoScrollState: { isActive: boolean; isPaused: boolean; elapsedTime: number };
    settings: any;
    isAutoScrollSettingsOpen: boolean;
    getToolbarStyle: (type: string, bg: string, text: string, border: string) => React.CSSProperties;
    currentTheme: any;
    menuButtonRef: React.RefObject<HTMLButtonElement>;
    setIsFloatingMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleBookmarkButtonPointerDown: () => void;
    handleBookmarkButtonPointerUp: () => void;
    handleBookmarkButtonPointerLeave: () => void;
    handleAutoScrollButtonPointerDown: (e: React.PointerEvent) => void;
    handleAutoScrollButtonPointerUp: (e: React.PointerEvent) => void;
    handleAutoScrollButtonPointerLeave: (e: React.PointerEvent) => void;
    onBack: () => void;
}

const QuranFooter: React.FC<QuranFooterProps> = ({
    autoScrollState,
    settings,
    isAutoScrollSettingsOpen,
    getToolbarStyle,
    currentTheme,
    menuButtonRef,
    setIsFloatingMenuOpen,
    handleBookmarkButtonPointerDown,
    handleBookmarkButtonPointerUp,
    handleBookmarkButtonPointerLeave,
    handleAutoScrollButtonPointerDown,
    handleAutoScrollButtonPointerUp,
    handleAutoScrollButtonPointerLeave,
    onBack
}) => {
    return (
        <footer id="bottom-bar" className={`footer-default flex-none border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10 flex justify-around items-center px-1 py-1 w-full ${autoScrollState.isActive && !autoScrollState.isPaused && settings.hideUIOnAutoScroll && !isAutoScrollSettingsOpen ? 'hidden' : ''}`} style={getToolbarStyle('bottom-toolbar', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}>
            <button ref={menuButtonRef} id="btn-menu" onClick={() => setIsFloatingMenuOpen(p => !p)} className="bottom-bar-button btn-purple flex-1 mx-1" style={getToolbarStyle('btn-menu', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}><i className="fa-solid fa-bars"></i><span className="hidden sm:inline">القائمة</span></button>
            <button 
                id="btn-bookmark" 
                onPointerDown={handleBookmarkButtonPointerDown}
                onPointerUp={handleBookmarkButtonPointerUp}
                onPointerLeave={handleBookmarkButtonPointerLeave}
                className="bottom-bar-button btn-green flex-1 mx-1" 
                style={{...getToolbarStyle('btn-bookmark', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg), touchAction: 'none'}}
            >
                <i className="fa-solid fa-bookmark"></i>
                <span className="hidden sm:inline">حفظ</span>
            </button>
            <button 
                id="btn-autoscroll" 
                onPointerDown={handleAutoScrollButtonPointerDown}
                onPointerUp={handleAutoScrollButtonPointerUp}
                onPointerLeave={handleAutoScrollButtonPointerLeave}
                className="bottom-bar-button btn-purple flex-1 mx-1" 
                style={{...getToolbarStyle('btn-autoscroll', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg), touchAction: 'none'}}
            >
                {autoScrollState.isActive ? <i className="fa-solid fa-pause icon-autoscroll-active"></i> : <i className="fa-solid fa-arrow-down"></i>}
                <span className="hidden sm:inline">{autoScrollState.isActive ? "إيقاف" : "تمرير"}</span>
            </button>
            <button id="btn-home" onClick={onBack} className="bottom-bar-button btn-green flex-1 mx-1" style={getToolbarStyle('btn-home', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}><i className="fa-solid fa-home"></i><span className="hidden sm:inline">الرئيسية</span></button>
        </footer>
    );
};

export default QuranFooter;
