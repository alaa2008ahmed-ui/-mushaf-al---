import React, { FC } from 'react';
import { toArabic } from './constants';

const ReadingTimer: FC<{isVisible: boolean, elapsedTime: number}> = ({isVisible, elapsedTime}) => {
    const minutes = Math.floor(Number(elapsedTime) / 60).toString().padStart(2, '0');
    const seconds = (Number(elapsedTime) % 60).toString().padStart(2, '0');
    return (<div className={`reading-timer ${isVisible ? 'show' : ''}`} style={{ backgroundColor: 'var(--qr-modal-bg)', color: 'var(--qr-modal-text)', border: '1px solid var(--qr-card-border)' }}>{toArabic(`${minutes}:${seconds}`)}</div>);
};

export default ReadingTimer;
