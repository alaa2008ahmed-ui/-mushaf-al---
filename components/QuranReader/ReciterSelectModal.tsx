import React, { useState } from 'react';
import { READERS } from './constants';

interface ReciterSelectModalProps {
    onClose: () => void;
    currentReader: string;
    onSelect: (readerId: string) => void;
}

const ReciterSelectModal: React.FC<ReciterSelectModalProps> = ({ onClose, currentReader, onSelect }) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleSelect = (id: string) => {
        onSelect(id);
        handleClose();
    };

    return (
        <div className={`fixed inset-0 bg-gray-900 bg-opacity-75 z-[200] flex items-center justify-center p-4 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`} onClick={handleClose}>
            <div className={`modal-skinned w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] bg-white dark:bg-gray-800 text-gray-800 dark:text-white ${isClosing ? 'animate-modal-exit' : 'animate-modal-enter'}`} onClick={e => e.stopPropagation()}>
                <div className="p-4 flex justify-between items-center h-14 flex-none theme-header-bg">
                    <h2 className="text-lg font-bold">اختر القارئ</h2>
                    <button onClick={handleClose} className="hover:opacity-80 rounded-full bg-white/20 w-8 h-8 flex items-center justify-center">✕</button>
                </div>
                <div className="p-3 overflow-y-auto flex-grow space-y-2">
                    {READERS.map(r => (
                        <button 
                            key={r.id} 
                            onClick={() => handleSelect(r.id)}
                            className={`w-full text-right p-3 rounded-xl border-2 transition-all font-bold ${currentReader === r.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            <div className="flex justify-between items-center">
                                <span>{r.name}</span>
                                {currentReader === r.id && <i className="fa-solid fa-check text-emerald-500"></i>}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReciterSelectModal;
