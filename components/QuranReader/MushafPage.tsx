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
}

const MushafPage: React.FC<MushafPageProps> = React.memo(({ pageNum, pageData, highlightedAyahId, onAyahClick, onVerseClick, onVerseLongPress, settings }) => {
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
            <div className="page-footer">
                <span className="page-number-bracket">﴿</span>
                <span className="page-number-text">{toArabic(pageNum)}</span>
                <span className="page-number-bracket">﴾</span>
            </div>
        </div>
    );
});

export default MushafPage;