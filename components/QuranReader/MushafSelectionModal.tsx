import React, { FC } from 'react';

const MushafSelectionModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSelect: (type: 'uthmani' | 'tajweed') => void,
    currentType: 'uthmani' | 'tajweed',
    isLandscape?: boolean
}> = ({ isOpen, onClose, onSelect, currentType, isLandscape }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[300] bg-black/30 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-2xl' : 'max-w-sm sm:max-w-2xl'} rounded-2xl shadow-2xl flex flex-col max-h-[80vh]`} onClick={e => e.stopPropagation()}>
                <div className="p-4 theme-header-bg rounded-t-2xl text-center">
                    <h3 className="font-bold text-lg">اختر نوع المصحف</h3>
                </div>
                <div className={`p-4 flex-1 ${isLandscape ? 'flex overflow-x-auto gap-4 no-scrollbar items-center justify-center' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}`}>
                    <button onClick={() => onSelect('uthmani')} className={`${isLandscape ? 'min-w-[180px] h-32' : 'w-full'} p-4 rounded-xl text-center font-bold transition flex flex-col justify-center items-center gap-2 ${currentType === 'uthmani' ? 'theme-accent-btn' : 'hover:opacity-80'}`} style={currentType !== 'uthmani' ? { backgroundColor: 'var(--qr-card-bg)', color: 'var(--qr-card-text)', border: '1px solid var(--qr-card-border)' } : {}}>
                        <i className="fa-solid fa-book-open text-2xl"></i>
                        <span>المصحف العثماني</span>
                        {currentType === 'uthmani' && <i className="fa-solid fa-check text-sm"></i>}
                    </button>
                    <button onClick={() => onSelect('tajweed')} className={`${isLandscape ? 'min-w-[180px] h-32' : 'w-full'} p-4 rounded-xl text-center font-bold transition flex flex-col justify-center items-center gap-2 ${currentType === 'tajweed' ? 'theme-accent-btn' : 'hover:opacity-80'}`} style={currentType !== 'tajweed' ? { backgroundColor: 'var(--qr-card-bg)', color: 'var(--qr-card-text)', border: '1px solid var(--qr-card-border)' } : {}}>
                        <i className="fa-solid fa-palette text-2xl"></i>
                        <span>المصحف المجود</span>
                        {currentType === 'tajweed' && <i className="fa-solid fa-check text-sm"></i>}
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
