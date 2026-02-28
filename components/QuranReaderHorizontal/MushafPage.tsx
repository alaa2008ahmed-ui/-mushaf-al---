import React, { useEffect, useRef } from 'react';
import { SAJDAH_LOCATIONS, toArabic, SURAH_INFO } from './constants';

interface MushafPageProps {
    pageNum: number;
    pageData: any[];
    highlightedAyahId: string | null;
    onAyahClick: (surah: number, ayah: number) => void;
    onVerseClick: (surah: number, ayah: number, event: React.MouseEvent) => void;
    onVerseLongPress?: (surah: number, ayah: number) => void;
    settings?: {
        fontSize: number;
        fontFamily: string;
        textColor: string;
        theme: string;
    };
    isHorizontal?: boolean;
}

const MushafPage: React.FC<MushafPageProps> = React.memo(({ pageNum, pageData, highlightedAyahId, onAyahClick, onVerseClick, onVerseLongPress, settings, isHorizontal }) => {
    const pageRef = useRef<HTMLDivElement | null>(null);
    const longPressTimer = useRef<number | null>(null);
    const isLongPressTriggered = useRef(false);

    const handlePointerDown = (s: number, a: number) => {
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
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handlePointerLeave = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    if (!pageData || !pageData.length) return <div className={`mushaf-page ${isHorizontal ? 'horizontal-mushaf-page' : ''}`} style={isHorizontal ? {} : {height: '1000px'}}></div>; // Placeholder for height calculation
    
    let currentSurah = -1;

    // Calculate text density to adjust font size
    const totalCharacters = pageData.reduce((acc, ayah) => acc + ayah.text.length, 0);
    
    // Base sizing for "normal" pages (approx 600-800 chars)
    let fontScale = 4.2; // Increased base scale to fill more space
    let lineVal = 2.0;
    
    // Fine-tuned thresholds for dense pages
    // The goal is to maximize size without overflow
    if (totalCharacters > 2500) { // Extremely dense (rare)
        fontScale = 2.2;
        lineVal = 1.4;
    } else if (totalCharacters > 2000) {
        fontScale = 2.4;
        lineVal = 1.45;
    } else if (totalCharacters > 1800) {
        fontScale = 2.6;
        lineVal = 1.5;
    } else if (totalCharacters > 1600) {
        fontScale = 2.8;
        lineVal = 1.55;
    } else if (totalCharacters > 1400) {
        fontScale = 3.0;
        lineVal = 1.6;
    } else if (totalCharacters > 1200) {
        fontScale = 3.2;
        lineVal = 1.65;
    } else if (totalCharacters > 1000) {
        fontScale = 3.5;
        lineVal = 1.75;
    } else if (totalCharacters > 800) {
        fontScale = 3.8;
        lineVal = 1.85;
    }
    
    // For very sparse pages (e.g. end of surah), we might want to cap the size so it doesn't look comically large,
    // or let it be large. The user said "fill the page".
    // However, if it's just 3 lines, filling the page height would look wrong.
    // We'll stick to a reasonable max (4.2cqh is quite large).

    const pageStyle = {
        fontSize: `clamp(1rem, min(${fontScale}cqh, ${fontScale * 1.5}cqw), 5rem)`, 
        lineHeight: `${lineVal}`, 
        fontFamily: settings?.fontFamily || 'var(--font-amiri)',
        color: settings?.theme === 'dark' ? '#fff' : (settings?.textColor || '#000'),
        height: '100%',
        paddingTop: '2px',
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: totalCharacters < 300 ? 'flex-start' : 'space-between' // Distribute lines for full pages, top for sparse
    };

    const headerStyle = {
        fontSize: `clamp(0.8rem, min(${fontScale * 0.7}cqh, ${fontScale * 1.1}cqw), 1.8rem)`,
        fontFamily: settings?.fontFamily || 'var(--font-amiri)'
    };

    return (
        <div className={`mushaf-page ${isHorizontal ? 'horizontal-mushaf-page' : ''}`} data-page={pageNum} ref={pageRef} style={{ backgroundColor: 'transparent' }}>
            <div className="page-content" style={pageStyle}>
                <div style={{ width: '100%' }}>
                    {pageData.map(ayah => {
                    const isSajdah = SAJDAH_LOCATIONS.some(sl => sl.s === ayah.sNum && sl.a === ayah.numberInSurah);
                    const showHeader = currentSurah !== ayah.sNum && ayah.numberInSurah === 1;
                    if (showHeader) currentSurah = ayah.sNum;
                    
                    const text = (ayah.numberInSurah === 1 && ayah.sNum !== 1 && ayah.sNum !== 9) 
                        ? ayah.text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '')
                                   .replace('بِّسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '')
                                   .trim() 
                        : ayah.text;
                    
                    const id = `ayah-${ayah.sNum}-${ayah.numberInSurah}`;

                    return (
                        <React.Fragment key={id}>
                            {showHeader && ( 
                                <> 
                                    <div className="surah-header">
                                        <span className="surah-info-right">{SURAH_INFO[ayah.sNum]?.type}</span>
                                        <span className="surah-name">{ayah.sName.replace('سورة', '').trim()}</span>
                                        <span className="surah-info-left">آياتها {toArabic(SURAH_INFO[ayah.sNum]?.ayahs || 0)}</span>
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
            </div>
        </div>
    );
});

export default MushafPage;