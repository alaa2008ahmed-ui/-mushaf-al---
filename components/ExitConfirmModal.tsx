
import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface ExitConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const { theme } = useTheme();

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-[1000] flex items-center justify-center p-4 fade-in" onClick={onClose}>
            <div className="rounded-xl p-6 max-w-sm w-full shadow-2xl border" style={{ backgroundColor: theme.bg, borderColor: theme.cardBorder || theme.palette[0] }} onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-center mb-4" style={{ color: theme.textColor }}>تأكيد الخروج</h3>
                <p className="text-center mb-6 font-semibold" style={{ color: theme.textColor, opacity: 0.9 }}>هل تريد الخروج من مصحف احمد وليلى؟</p>
                <div className="flex justify-center gap-3">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-2 rounded-lg font-bold transition active:scale-95"
                        style={{
                            backgroundColor: theme.cardBorder || '#e5e7eb',
                            color: theme.textColor,
                            border: `1px solid ${theme.palette[1] || '#d1d5db'}`
                        }}
                    >
                        لا
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="px-6 py-2 rounded-lg font-bold transition active:scale-95 shadow-md"
                        style={{
                            backgroundColor: theme.palette[0] || '#ef4444',
                            color: theme.btnText || '#ffffff',
                            boxShadow: `0 4px 10px -2px ${theme.palette[0]}50`
                        }}
                    >
                        نعم
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExitConfirmModal;
