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
        onClose();
    };

    const handleSelect = (id: string) => {
        onSelect(id);
        handleClose();
    };

    return (
        <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn`} onClick={handleClose}>
            <div className={`modal-skinned w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-modal-enter`} onClick={e => e.stopPropagation()}>
                <div className="p-4 flex justify-between items-center h-14 flex-none theme-header-bg">
                    <h2 className="text-lg font-bold">اختر القارئ</h2>
                    <button onClick={handleClose} className="hover:opacity-80 rounded-full bg-white/20 w-8 h-8 flex items-center justify-center">✕</button>
                </div>
                <div className="p-3 overflow-y-auto flex-grow space-y-2">
                    {READERS.map(r => (
                        <button 
                            key={r.id} 
                            onClick={() => handleSelect(r.id)}
                            className={`w-full text-right p-3 rounded-xl border-2 transition-all font-bold ${currentReader === r.id ? 'theme-accent-btn' : 'border-transparent hover:opacity-80'}`}
                            style={currentReader !== r.id ? { backgroundColor: 'var(--qr-card-bg)', color: 'var(--qr-card-text)', borderColor: 'var(--qr-card-border)' } : {}}
                        >
                            <div className="flex justify-between items-center">
                                <span>{r.name}</span>
                                {currentReader === r.id && <i className="fa-solid fa-check"></i>}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReciterSelectModal;
