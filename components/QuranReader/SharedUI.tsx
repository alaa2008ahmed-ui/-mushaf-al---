import React, { FC } from 'react';
import { toArabic } from './constants';

export const ReadingTimer: FC<{isVisible: boolean, elapsedTime: number}> = ({isVisible, elapsedTime}) => {
    const minutes = Math.floor(Number(elapsedTime) / 60).toString().padStart(2, '0');
    const seconds = (Number(elapsedTime) % 60).toString().padStart(2, '0');
    return (
        <div className={`reading-timer ${isVisible ? 'show' : ''}`} style={{ backgroundColor: 'var(--qr-modal-bg)', color: 'var(--qr-modal-text)', border: '1px solid var(--qr-card-border)' }}>
            {toArabic(`${minutes}:${seconds}`)}
        </div>
    );
};

export const SajdahNotification: FC<{isVisible: boolean, surah?: string, ayah?: number}> = ({isVisible, surah, ayah}) => (
    <div className={`sajdah-notification ${isVisible ? 'show' : ''}`} style={{ backgroundColor: 'var(--qr-modal-bg)', color: 'var(--qr-modal-text)', border: '2px solid var(--qr-card-border)' }}>
        <div className="p-2 rounded-full theme-header-bg"><i className="fa-solid fa-mosque"></i></div>
        <div>
            <div className="font-bold text-sm">سجدة تلاوة</div>
            <div className="text-xs mt-0.5 opacity-80">سورة {surah} - آية {toArabic(ayah || '')}</div>
        </div>
    </div>
);
