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
    
    // Base sizing for "normal" pages
    // The goal is to maximize size without overflow, filling the page height.
    let fontScale = 5.0; 
    let lineVal = 2.0;
    
    // Fine-tuned thresholds for different text densities
    if (totalCharacters > 2400) { fontScale = 2.1; lineVal = 1.25; }
    else if (totalCharacters > 2100) { fontScale = 2.3; lineVal = 1.3; }
    else if (totalCharacters > 1900) { fontScale = 2.5; lineVal = 1.35; }
    else if (totalCharacters > 1700) { fontScale = 2.7; lineVal = 1.4; }
    else if (totalCharacters > 1500) { fontScale = 3.0; lineVal = 1.45; }
    else if (totalCharacters > 1300) { fontScale = 3.3; lineVal = 1.55; }
    else if (totalCharacters > 1100) { fontScale = 3.7; lineVal = 1.65; }
    else if (totalCharacters > 900) { fontScale = 4.1; lineVal = 1.75; }
    else if (totalCharacters > 700) { fontScale = 4.7; lineVal = 1.9; }
    else if (totalCharacters > 500) { fontScale = 5.4; lineVal = 2.1; }
    else if (totalCharacters > 300) { fontScale = 6.4; lineVal = 2.3; }
    else if (totalCharacters > 150) { fontScale = 7.8; lineVal = 2.6; }
    else { fontScale = 9.5; lineVal = 3.0; }
    
    const pageStyle = {
        fontSize: `clamp(1.2rem, min(${fontScale}cqh, ${fontScale * 1.8}cqw), 7rem)`, 
        lineHeight: `${lineVal}`, 
        fontFamily: settings?.fontFamily || 'var(--font-amiri)',
        color: settings?.theme === 'dark' ? '#fff' : (settings?.textColor || '#000'),
        height: '100%',
        paddingTop: '5px',
        paddingBottom: '10px', 
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center', 
        overflow: 'hidden'
    };

    const headerStyle = {
        fontSize: `clamp(0.9rem, min(${fontScale * 0.75}cqh, ${fontScale * 1.2}cqw), 2rem)`,
        fontFamily: settings?.fontFamily || 'var(--font-amiri)'
    };

    return (
        <div className={`mushaf-page ${isHorizontal ? 'horizontal-mushaf-page' : ''}`} data-page={pageNum} ref={pageRef} style={{ backgroundColor: 'transparent' }}>
            <div className="page-content" style={pageStyle}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1 }}>
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
                                    <div className="surah-header my-4 flex items-center justify-between w-full px-2">
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