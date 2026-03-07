import React, { useEffect, useRef } from 'react';
import { SAJDAH_LOCATIONS, toArabic, SURAH_INFO } from './constants';

interface MushafPageProps {
    pageNum: number;
    pageData: any[];
    highlightedAyahId: string | null;
    onAyahClick: (surah: number, ayah: number) => void;
    onVerseClick: (surah: number, ayah: number, event: React.MouseEvent) => void;
    onVerseLongPress?: (surah: number, ayah: number) => void;
    onInteractionStart?: () => void;
    onInteractionEnd?: () => void;
    settings?: {
        fontSize: number;
        fontFamily: string;
        textColor: string;
        theme: string;
    };
}

const MushafPage: React.FC<MushafPageProps> = React.memo(({ pageNum, pageData, highlightedAyahId, onAyahClick, onVerseClick, onVerseLongPress, onInteractionStart, onInteractionEnd, settings }) => {
    const pageRef = useRef<HTMLDivElement | null>(null);
    const longPressTimer = useRef<number | null>(null);
    const isLongPressTriggered = useRef(false);

    const handlePointerDown = (s: number, a: number) => {
        if (onInteractionStart) onInteractionStart();
        isLongPressTriggered.current = false;
        longPressTimer.current = window.setTimeout(() => {
            if (onVerseLongPress) {
                onVerseLongPress(s, a);
                isLongPressTriggered.current = true;
            }
            longPressTimer.current = null;
        }, 600);
    };

    const handlePointerUp = () => {
        if (onInteractionEnd) onInteractionEnd();
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handlePointerLeave = () => {
        if (onInteractionEnd) onInteractionEnd();
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    if (!pageData || !pageData.length) return <div className="mushaf-page" style={{height: '1000px'}}></div>; // Placeholder for height calculation
    
    let currentSurah = -1;
    
    const pageStyle = {
        fontSize: settings ? `${settings.fontSize}rem` : '1.7rem',
        fontFamily: settings?.fontFamily || 'var(--font-amiri)',
        color: settings?.theme === 'dark' ? '#fff' : (settings?.textColor || '#000')
    };

    const headerStyle = {
        fontSize: settings ? `${settings.fontSize * 0.94}rem` : '1.6rem',
        fontFamily: settings?.fontFamily || 'var(--font-amiri)'
    };

    return (
        <div className="mushaf-page" data-page={pageNum} ref={pageRef} style={{ backgroundColor: 'transparent' }}>
            <div className="page-content" style={pageStyle}>
                {pageData.map(ayah => {
                    const isSajdah = SAJDAH_LOCATIONS.some(sl => sl.s === ayah.sNum && sl.a === ayah.numberInSurah);
                    const showHeader = currentSurah !== ayah.sNum && ayah.numberInSurah === 1;
                    if (showHeader) currentSurah = ayah.sNum;
                    
                    const text = (ayah.numberInSurah === 1 && ayah.sNum !== 1 && ayah.sNum !== 9) 
                        ? ayah.text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').replace('بِّسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').trim() 
                        : ayah.text;
                    
                    const id = `ayah-${ayah.sNum}-${ayah.numberInSurah}`;

                    return (
                        <React.Fragment key={id}>
                            {showHeader && ( 
                                <> 
                                    <div className="surah-header-container">
                                        <svg className="surah-header-bg" viewBox="0 0 600 80" preserveAspectRatio="none">
                                            {/* Outer Green Box with Double Border */}
                                            <rect x="2" y="2" width="596" height="76" fill="#22c55e" stroke="#14532d" strokeWidth="2" />
                                            <rect x="6" y="6" width="588" height="68" fill="none" stroke="#dcfce7" strokeWidth="1" opacity="0.5" />
                                            
                                            {/* Floral/Geometric Decoration Left & Right */}
                                            <path d="M 40 40 m -20 0 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0" fill="none" stroke="#dcfce7" strokeWidth="1.5" opacity="0.6" />
                                            <path d="M 40 40 m -12 0 a 12 12 0 1 0 24 0 a 12 12 0 1 0 -24 0" fill="#dcfce7" opacity="0.3" />
                                            
                                            <path d="M 560 40 m -20 0 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0" fill="none" stroke="#dcfce7" strokeWidth="1.5" opacity="0.6" />
                                            <path d="M 560 40 m -12 0 a 12 12 0 1 0 24 0 a 12 12 0 1 0 -24 0" fill="#dcfce7" opacity="0.3" />

                                            {/* Center Cartouche Background (Light) */}
                                            {/* Shape: Rounded rectangle with decorative notches */}
                                            <path d="M 120 10 L 480 10 Q 500 10 505 25 L 510 40 L 505 55 Q 500 70 480 70 L 120 70 Q 100 70 95 55 L 90 40 L 95 25 Q 100 10 120 10 Z" fill="#dcfce7" stroke="#14532d" strokeWidth="2" />
                                            
                                            {/* Inner decorative line for cartouche */}
                                            <path d="M 125 15 L 475 15 Q 490 15 494 25 L 498 40 L 494 55 Q 490 65 475 65 L 125 65 Q 110 65 106 55 L 102 40 L 106 25 Q 110 15 125 15 Z" fill="none" stroke="#14532d" strokeWidth="1" opacity="0.5" />
                                        </svg>
                                        
                                        <div className="surah-header-content">
                                            <div className="surah-header-right-text">{SURAH_INFO[ayah.sNum]?.type}</div>
                                            <div className="surah-header-center-text">{ayah.sName.replace('سورة', '').trim()}</div>
                                            <div className="surah-header-left-text">{toArabic(SURAH_INFO[ayah.sNum]?.ayahs || 0)} آيات</div>
                                        </div>
                                    </div> 
                                    {ayah.sNum !== 1 && ayah.sNum !== 9 && (
                                        <div className="bismillah" style={headerStyle}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
                                    )} 
                                </> 
                            )}
                            <span 
                                id={id} 
                                className={`ayah-text-block ${highlightedAyahId === id ? 'highlighted' : ''} ${isSajdah ? 'ayah-sajdah' : ''}`} 
                                onClick={() => onAyahClick(ayah.sNum, ayah.numberInSurah)} 
                                data-sajdah={isSajdah} 
                                data-snum={ayah.sNum}
                                data-surah={ayah.sName.replace('سورة','').trim()} 
                                data-ayah={ayah.numberInSurah}
                            >
                                {text.replace(/[\s\u200B-\u200D\uFEFF]+/g, ' ').trim()}
                                <span className="verse-container" 
                                    onClick={(e) => {
                                        if (!isLongPressTriggered.current) {
                                            onVerseClick(ayah.sNum, ayah.numberInSurah, e);
                                        }
                                    }}
                                    onPointerDown={() => handlePointerDown(ayah.sNum, ayah.numberInSurah)}
                                    onPointerUp={handlePointerUp}
                                    onPointerLeave={handlePointerLeave}
                                    onContextMenu={(e) => e.preventDefault()}
                                >
                                    <span className="verse-bracket">﴿</span>
                                    <span className="verse-num-inner">{toArabic(ayah.numberInSurah)}</span>
                                    <span className="verse-bracket">﴾</span>
                                </span>
                            </span>
                        </React.Fragment>
                    );
                })}
            </div>
            <div className="page-footer">
                <span className="page-number-bracket">﴿</span>
                <span className="page-number-text">{toArabic(pageNum)}</span>
                <span className="page-number-bracket">﴾</span>
            </div>
        </div>
    );
});

export default MushafPage;