import React, { FC } from 'react';
import { TAFSEERS } from './constants';

const TafseerSelectionModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSelect: (tafseerId: string) => void,
    currentTafseerId: string
}> = ({ isOpen, onClose, onSelect, currentTafseerId }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[300] bg-black/30 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div className="modal-skinned w-full max-w-sm rounded-2xl shadow-2xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 theme-header-bg rounded-t-2xl text-center">
                    <h3 className="font-bold text-lg">اختر التفسير</h3>
                </div>
                <div className="p-2 overflow-y-auto space-y-2 flex-1">
                    {TAFSEERS.map(t => (
                        <button key={t.id} onClick={() => onSelect(t.id)} className={`w-full p-3 rounded-xl text-right font-bold transition flex justify-between items-center ${currentTafseerId === t.id ? 'theme-accent-btn' : 'hover:opacity-80'}`} style={currentTafseerId !== t.id ? { backgroundColor: 'var(--qr-card-bg)', color: 'var(--qr-card-text)', border: '1px solid var(--qr-card-border)' } : {}}>
                            <span>{t.name}</span>
                            {currentTafseerId === t.id && <i className="fa-solid fa-check"></i>}
                        </button>
                    ))}
                </div>
                <div className="p-3 border-t themed-card-bg rounded-b-2xl">
                    <button onClick={onClose} className="w-full py-2 rounded-xl font-bold theme-btn-bg">إلغاء</button>
                </div>
            </div>
        </div>
    );
};

export default TafseerSelectionModal;
