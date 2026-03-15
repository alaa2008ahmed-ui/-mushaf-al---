import React, { FC } from 'react';
import { toArabic } from './constants';

const ReadingTimer: FC<{isVisible: boolean, elapsedTime: number, isPaused?: boolean}> = ({isVisible, elapsedTime, isPaused}) => {
    const minutes = Math.floor(Number(elapsedTime) / 60).toString().padStart(2, '0');
    const seconds = (Number(elapsedTime) % 60).toString().padStart(2, '0');
    return (
        <div className={`reading-timer ${isVisible ? 'show' : ''}`}>
            <div className="flex items-center gap-2" dir="ltr">
                <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}></div>
                <span>{toArabic(`${minutes}:${seconds}`)}</span>
                {isPaused && <span className="text-xs text-yellow-500 ml-1">متوقف</span>}
            </div>
        </div>
    );
};

export default ReadingTimer;
