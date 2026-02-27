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
    
    const pageStyle = {
        fontSize: 'clamp(1rem, min(3.6cqh, 6cqw), 3.8rem)', // Increased to fill space
        lineHeight: '1.8', // Increased line height
        fontFamily: settings?.fontFamily || 'var(--font-amiri)',
        color: settings?.theme === 'dark' ? '#fff' : (settings?.textColor || '#000'),
        height: '100%',
        paddingTop: '2px' // Minimal padding
    };

    const headerStyle = {
        fontSize: 'clamp(0.9rem, min(2.5cqh, 4cqw), 2rem)',
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
                        ? ayah.text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').trim() 
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