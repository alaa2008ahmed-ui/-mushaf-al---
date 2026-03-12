import { useState, useRef, useCallback, useEffect } from 'react';

interface UseBookmarksProps {
    currentAyah: { s: number; a: number } | null;
    showToast: (message: string) => void;
    storageKey: string;
    openModal: (modalName: string) => void;
}

export const useBookmarks = ({ currentAyah, showToast, storageKey, openModal }: UseBookmarksProps) => {
    const [bookmarks, setBookmarks] = useState<any[]>([]);
    const bookmarkButtonTimerRef = useRef<number | null>(null);

    const loadBookmarks = useCallback(() => {
        setBookmarks(JSON.parse(localStorage.getItem(storageKey) || '[]'));
    }, [storageKey]);

    useEffect(() => {
        loadBookmarks();
    }, [loadBookmarks]);

    const saveBookmark = useCallback(() => {
        if (!currentAyah) { 
            showToast('اختر آية أولاً'); 
            return; 
        } 
        const stored = JSON.parse(localStorage.getItem(storageKey) || '[]'); 
        const date = new Date(); 
        const newBookmark = { 
            id: Date.now(), 
            s: currentAyah.s, 
            a: currentAyah.a, 
            date: date.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }), 
            time: date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) 
        }; 
        const newBookmarks = [newBookmark, ...stored]; 
        localStorage.setItem(storageKey, JSON.stringify(newBookmarks)); 
        setBookmarks(newBookmarks); 
        showToast('تم حفظ الإشارة المرجعية'); 
    }, [currentAyah, showToast, storageKey]);

    const deleteBookmark = useCallback((id: number) => { 
        const newBookmarks = bookmarks.filter((b: any) => b.id !== id); 
        localStorage.setItem(storageKey, JSON.stringify(newBookmarks)); 
        setBookmarks(newBookmarks); 
    }, [bookmarks, storageKey]);

    const handleBookmarkButtonPointerDown = useCallback(() => {
        bookmarkButtonTimerRef.current = window.setTimeout(() => {
            bookmarkButtonTimerRef.current = null;
            openModal('bookmarks-modal');
        }, 500);
    }, [openModal]);

    const handleBookmarkButtonPointerUp = useCallback(() => {
        if (bookmarkButtonTimerRef.current) {
            clearTimeout(bookmarkButtonTimerRef.current);
            bookmarkButtonTimerRef.current = null;
            saveBookmark();
        }
    }, [saveBookmark]);

    const handleBookmarkButtonPointerLeave = useCallback(() => {
        if (bookmarkButtonTimerRef.current) {
            clearTimeout(bookmarkButtonTimerRef.current);
            bookmarkButtonTimerRef.current = null;
        }
    }, []);

    return {
        bookmarks,
        loadBookmarks,
        saveBookmark,
        deleteBookmark,
        handleBookmarkButtonPointerDown,
        handleBookmarkButtonPointerUp,
        handleBookmarkButtonPointerLeave
    };
};
