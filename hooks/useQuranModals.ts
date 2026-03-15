import React, { useState, useRef, useCallback, useEffect } from 'react';

interface UseQuranModalsProps {
    autoScrollStateRef: React.MutableRefObject<{ isActive: boolean; isPaused: boolean; elapsedTime: number }>;
    autoScrollPausedRef: React.MutableRefObject<boolean>;
    setAutoScrollState: React.Dispatch<React.SetStateAction<{ isActive: boolean; isPaused: boolean; elapsedTime: number }>>;
    setTafseerSelectionInfo: React.Dispatch<React.SetStateAction<{ isOpen: boolean; s: number; a: number; wasAutoscrolling: boolean }>>;
    stopAudio: () => void;
}

export function useQuranModals({
    autoScrollStateRef,
    autoScrollPausedRef,
    setAutoScrollState,
    setTafseerSelectionInfo,
    stopAudio
}: UseQuranModalsProps) {
    const [activeModals, setActiveModals] = useState<string[]>([]);
    const wasAutoscrollingBeforeModal = useRef(false);

    const closeModal = useCallback((modalName: string) => {
        setActiveModals(p => p.filter(m => m !== modalName));
        if (wasAutoscrollingBeforeModal.current) {
            const anyOtherOpen = activeModals.some(m => m !== modalName);
            if (!anyOtherOpen) {
                autoScrollPausedRef.current = false;
                setAutoScrollState(p => ({ ...p, isPaused: false }));
                wasAutoscrollingBeforeModal.current = false;
            }
        }
    }, [activeModals, autoScrollPausedRef, setAutoScrollState]);

    const openModal = useCallback((modalName: string) => { 
        stopAudio(); 
        let wasScrolling = false;
        if (autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused) {
            autoScrollPausedRef.current = true;
            const newState = { ...autoScrollStateRef.current, isPaused: true };
            autoScrollStateRef.current = newState;
            setAutoScrollState(newState);
            wasAutoscrollingBeforeModal.current = true;
            wasScrolling = true;
        }
        if (modalName === 'tafseer-selection-modal') {
            setTafseerSelectionInfo(p => ({ ...p, isOpen: true, wasAutoscrolling: wasScrolling }));
        } else {
            setActiveModals(p => [...p.filter(m => m !== modalName), modalName]); 
        }
    }, [stopAudio, autoScrollStateRef, autoScrollPausedRef, setAutoScrollState, setTafseerSelectionInfo]);

    return {
        activeModals,
        setActiveModals,
        closeModal,
        openModal,
        wasAutoscrollingBeforeModal
    };
}
