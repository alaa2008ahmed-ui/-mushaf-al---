import React, { useState } from 'react';
import { JUZ_MAP, toArabic } from './constants';

interface SurahJuzModalProps {
    type: 'surah' | 'juz';
    quranData: any;
    onSelect: (surahOrJuz: number, ayah?: number) => void;
    onClose: () => void;
}

const SurahJuzModal: React.FC<SurahJuzModalProps> = ({ type, quranData, onSelect, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const removeDiacritics = (text: string) => {
        if (!text) return "";
        return text
            .replace(/[\u064B-\u0652\u0670\u0653-\u065F\u0640]/g, "") // Remove all diacritics and small characters
            .replace(/[أإآٱ]/g, "ا") // Normalize all types of Alef
            .replace(/ة/g, "ه")
            .replace(/ى/g, "ي")
            .replace(/\s+/g, " ") // Normalize spaces
            .trim();
    };

    const normalizedSearch = removeDiacritics(searchTerm)
        .replace(/^صوره/, "سوره") // Handle common typo 'صورة' instead of 'سورة'
        .replace(/\sصوره/, " سوره");

    const filteredSurahs = quranData?.surahs.filter((s: any) => {
        const name = s.name;
        const nameWithoutSurah = s.name.replace('سورة', '').trim();
        
        const normalizedName = removeDiacritics(name);
        const normalizedNameWithoutSurah = removeDiacritics(nameWithoutSurah);
        
        return normalizedName.includes(normalizedSearch) || 
               normalizedNameWithoutSurah.includes(normalizedSearch) ||
               normalizedSearch.includes(normalizedNameWithoutSurah); // Handle searching for "سورة الفاتحة" when name is just "الفاتحة"
    });

    return (
        <div className="fixed inset-0 z-[100] bg-black/30 flex justify-center items-center px-4 animate-fadeIn backdrop-blur-sm" onClick={onClose}>
            <div className="modal-skinned w-full max-w-4xl rounded-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 theme-header-bg rounded-t-2xl flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg">{type === 'surah' ? 'اختر السورة' : 'اختر الجزء'}</h3>
                        <button onClick={onClose} className="text-2xl">&times;</button>
                    </div>
                    
                    {type === 'surah' && (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="ابحث عن سورة..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-2 pr-10 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                            />
                            <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 opacity-50"></i>
                        </div>
                    )}
                </div>
                <div className="overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {type === 'surah' ? (
                        filteredSurahs?.length > 0 ? (
                            filteredSurahs.map((s: any) => (
                                <button 
                                    key={s.number} 
                                    onClick={() => onSelect(s.number, 1)} 
                                    className="p-3 rounded-lg transition text-right font-bold border-2 flex justify-between items-center group theme-btn-bg"
                                >
                                    <span>
                                        <span className="opacity-80">{toArabic(s.number)}.</span> 
                                        <span style={{ fontFamily: 'var(--font-amiri)' }}> {s.name.replace('سورة', '').trim()}</span>
                                    </span>
                                    <span className="text-xs font-normal opacity-80">
                                        {s.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} - {toArabic(s.ayahs.length)} آية
                                    </span>
                                </button>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10 opacity-60">لا توجد نتائج للبحث</div>
                        )
                    ) : (
                        JUZ_MAP.map((j: any) => (
                            <button 
                                key={j.j} 
                                onClick={() => onSelect(j.j)} 
                                className="p-3 rounded-lg transition font-bold border-2 flex flex-col items-center justify-center text-center theme-btn-bg"
                            >
                                <span className="text-lg mb-1">الجزء {toArabic(j.j)}</span>
                                <span className="text-xs font-normal opacity-80" style={{ fontFamily: 'var(--font-amiri)' }}>
                                    {quranData?.surahs[j.s-1]?.name.replace('سورة','').trim()} آية {toArabic(j.a)} - صفحة {toArabic(quranData?.surahs[j.s-1]?.ayahs[j.a-1]?.page || '')}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SurahJuzModal;
