import React, { useState, useRef, useCallback, useEffect } from 'react';

interface UseBookmarksProps {
    currentAyah: { s: number; a: number };
    isLandscapeRef: React.MutableRefObject<boolean>;
    showToast: (msg: string) => void;
    openModal: (modalName: string) => void;
    isBookmarksModalOpen: boolean;
}

export function useBookmarks({
    currentAyah,
    isLandscapeRef,
    showToast,
    openModal,
    isBookmarksModalOpen
}: UseBookmarksProps) {
    const [bookmarks, setBookmarks] = useState([]);
    const [bookmarksFilter, setBookmarksFilter] = useState<boolean | null>(null);
    const bookmarkButtonTimerRef = useRef<number | null>(null);

    useEffect(() => {
        if (isBookmarksModalOpen) {
            setBookmarks(JSON.parse(localStorage.getItem('quran_bookmarks_list') || '[]'));
        }
    }, [isBookmarksModalOpen]);

    const saveBookmark = useCallback(() => { 
        if (!currentAyah) { showToast('اختر آية أولاً'); return; } 
        const stored = JSON.parse(localStorage.getItem('quran_bookmarks_list') || '[]'); 
        const date = new Date(); 
        const newBookmark = { 
            id: Date.now(), 
            s: currentAyah.s, 
            a: currentAyah.a, 
            isLandscape: isLandscapeRef.current,
            date: date.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }), 
            time: date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) 
        }; 
        const newBookmarks = [newBookmark, ...stored]; 
        localStorage.setItem('quran_bookmarks_list', JSON.stringify(newBookmarks)); 
        setBookmarks(newBookmarks as any); 
        showToast(`تم حفظ الإشارة (${isLandscapeRef.current ? 'أفقي' : 'رأسي'})`); 
    }, [currentAyah, isLandscapeRef, showToast]);

    const deleteBookmark = useCallback((id: number) => { 
        const newBookmarks = bookmarks.filter((b: any) => b.id !== id); 
        localStorage.setItem('quran_bookmarks_list', JSON.stringify(newBookmarks)); 
        setBookmarks(newBookmarks); 
    }, [bookmarks]);

    const handleBookmarkButtonPointerDown = useCallback(() => {
        bookmarkButtonTimerRef.current = window.setTimeout(() => {
            bookmarkButtonTimerRef.current = null;
            setBookmarksFilter(isLandscapeRef.current);
            openModal('bookmarks-modal');
        }, 500);
    }, [isLandscapeRef, openModal]);

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
        setBookmarks,
        bookmarksFilter,
        setBookmarksFilter,
        saveBookmark,
        deleteBookmark,
        handleBookmarkButtonPointerDown,
        handleBookmarkButtonPointerUp,
        handleBookmarkButtonPointerLeave
    };
}
