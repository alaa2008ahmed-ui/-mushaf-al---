import React, { FC } from 'react';

const MarkerNotification: FC<{isVisible: boolean, type: string, text: string}> = ({isVisible, type, text}) => {
    const getIcon = () => {
        switch(type) {
            case 'juz': return 'fa-book-open';
            case 'quarter': return 'fa-star';
            case 'sajda': return 'fa-mosque';
            case 'surah': return 'fa-scroll';
            default: return 'fa-info-circle';
        }
    };

    return (
        <div className={`marker-notification ${isVisible ? 'show' : ''}`} style={{ backgroundColor: 'var(--qr-modal-bg)', color: 'var(--qr-modal-text)', border: '1px solid var(--qr-card-border)' }}>
            <div className="marker-icon theme-header-bg"><i className={`fa-solid ${getIcon()}`}></i></div>
            <div className="marker-text">{text}</div>
        </div>
    );
};

export default MarkerNotification;
