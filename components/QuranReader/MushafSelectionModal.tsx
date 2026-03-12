import React, { FC } from 'react';

const MushafSelectionModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSelect: (type: 'uthmani' | 'tajweed') => void,
    currentType: 'uthmani' | 'tajweed'
}> = ({ isOpen, onClose, onSelect, currentType }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[300] bg-black/30 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div className="modal-skinned w-full max-w-sm rounded-2xl shadow-2xl flex flex-col max-h-[95vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 theme-header-bg rounded-t-2xl text-center flex-none">
                    <h3 className="font-bold text-lg">اختر نوع المصحف</h3>
                </div>
                <div className="p-2 overflow-y-auto space-y-2 flex-grow">
                    <button onClick={() => onSelect('uthmani')} className={`w-full p-3 rounded-xl text-right font-bold transition flex justify-between items-center ${currentType === 'uthmani' ? 'theme-accent-btn' : 'hover:opacity-80'}`} style={currentType !== 'uthmani' ? { backgroundColor: 'var(--qr-card-bg)', color: 'var(--qr-card-text)', border: '1px solid var(--qr-card-border)' } : {}}>
                        <span>المصحف العثماني</span>
                        {currentType === 'uthmani' && <i className="fa-solid fa-check"></i>}
                    </button>
                    <button onClick={() => onSelect('tajweed')} className={`w-full p-3 rounded-xl text-right font-bold transition flex justify-between items-center ${currentType === 'tajweed' ? 'theme-accent-btn' : 'hover:opacity-80'}`} style={currentType !== 'tajweed' ? { backgroundColor: 'var(--qr-card-bg)', color: 'var(--qr-card-text)', border: '1px solid var(--qr-card-border)' } : {}}>
                        <span>المصحف المجود</span>
                        {currentType === 'tajweed' && <i className="fa-solid fa-check"></i>}
                    </button>
                </div>
                <div className="p-3 border-t themed-card-bg rounded-b-2xl">
                    <button onClick={onClose} className="w-full py-2 rounded-xl font-bold theme-btn-bg">إلغاء</button>
                </div>
            </div>
        </div>
    );
};

export default MushafSelectionModal;
