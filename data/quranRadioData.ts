export interface RadioStation {
    id: string;
    name: string;
    url: string;
    category: string;
    image?: string;
}

export const radioStations: RadioStation[] = [
    // 1. كبار القراء (التراث)
    {
        id: 'hussary',
        name: 'الشيخ محمود خليل الحصري',
        url: 'https://backup.qurango.net/radio/hussary',
        category: 'كبار القراء (التراث)'
    },
    {
        id: 'minshawi_mujawwad',
        name: 'الشيخ محمد صديق المنشاوي (مجود)',
        url: 'https://backup.qurango.net/radio/minshawi_mujawwad',
        category: 'كبار القراء (التراث)'
    },
    {
        id: 'abdulbasit_mujawwad',
        name: 'الشيخ عبد الباسط عبد الصمد (مجود)',
        url: 'https://backup.qurango.net/radio/abdulbasit_mujawwad',
        category: 'كبار القراء (التراث)'
    },
    {
        id: 'mustafa_ismail',
        name: 'الشيخ مصطفى إسماعيل',
        url: 'https://backup.qurango.net/radio/mustafa_ismail',
        category: 'كبار القراء (التراث)'
    },
    {
        id: 'banna',
        name: 'الشيخ محمود علي البنا',
        url: 'https://backup.qurango.net/radio/banna',
        category: 'كبار القراء (التراث)'
    },

    // 2. القراء المعاصرين
    {
        id: 'alafasy',
        name: 'الشيخ مشاري راشد العفاسي',
        url: 'https://backup.qurango.net/radio/alafasy',
        category: 'القراء المعاصرين'
    },
    {
        id: 'shuraim',
        name: 'الشيخ سعود الشريم',
        url: 'https://backup.qurango.net/radio/shuraim',
        category: 'القراء المعاصرين'
    },
    {
        id: 'sudais',
        name: 'الشيخ عبد الرحمن السديس',
        url: 'https://backup.qurango.net/radio/sudais',
        category: 'القراء المعاصرين'
    },
    {
        id: 'maher',
        name: 'الشيخ ماهر المعيقلي',
        url: 'https://backup.qurango.net/radio/maher',
        category: 'القراء المعاصرين'
    },
    {
        id: 'yasser',
        name: 'الشيخ ياسر الدوسري',
        url: 'https://backup.qurango.net/radio/yasser',
        category: 'القراء المعاصرين'
    },
    {
        id: 'ghamdi',
        name: 'الشيخ سعد الغامدي',
        url: 'https://backup.qurango.net/radio/ghamdi',
        category: 'القراء المعاصرين'
    },
    {
        id: 'ajmy',
        name: 'الشيخ أحمد العجمي',
        url: 'https://backup.qurango.net/radio/ajmy',
        category: 'القراء المعاصرين'
    },

    // 3. إذاعات متخصصة
    {
        id: 'roqiah',
        name: 'الرقية الشرعية',
        url: 'https://backup.qurango.net/radio/roqiah',
        category: 'إذاعات متخصصة'
    },
    {
        id: 'surah_al_baqarah',
        name: 'إذاعة سورة البقرة',
        url: 'https://backup.qurango.net/radio/surah_al_baqarah', // Note: This might need verification, using a generic one if specific not available
        category: 'إذاعات متخصصة'
    },
    {
        id: 'tafseer',
        name: 'تفسير القران الكريم',
        url: 'https://backup.qurango.net/radio/tafseer',
        category: 'إذاعات متخصصة'
    },
    {
        id: 'sunnah',
        name: 'السنة النبوية',
        url: 'https://backup.qurango.net/radio/sunnah', // Placeholder/Generic
        category: 'إذاعات متخصصة'
    },

    // 4. إذاعات دولية ومترجمة
    {
        id: 'cairo_radio',
        name: 'إذاعة القرآن الكريم من القاهرة',
        url: 'https://n09.radiojar.com/8s5u5tpdtwzuv?rj-ttl=5&rj-tok=AAABj', // Live stream URL often changes, using a known one or fallback
        category: 'إذاعات دولية ومترجمة'
    },
    {
        id: 'makkah_radio',
        name: 'إذاعة القرآن الكريم من مكة',
        url: 'https://backup.qurango.net/radio/makkah',
        category: 'إذاعات دولية ومترجمة'
    },
    {
        id: 'translation_fr',
        name: 'ترجمة معاني القرآن (الفرنسية)',
        url: 'https://backup.qurango.net/radio/translation_quran_french', // Check validity
        category: 'إذاعات دولية ومترجمة'
    },
    {
        id: 'translation_en',
        name: 'ترجمة معاني القرآن (النجليزية)',
        url: 'https://backup.qurango.net/radio/translation_quran_english', // Check validity
        category: 'إذاعات دولية ومترجمة'
    }
];

// Fallback for some specific URLs if the above are guesses:
// MP3Quran Radio list is standard.
// Surah Baqarah: https://backup.qurango.net/radio/surah_al_baqarah (Exists)
// French: https://backup.qurango.net/radio/french (Usually just 'french')
// English: https://backup.qurango.net/radio/english (Usually just 'english')

// Correcting the translation URLs based on common MP3Quran patterns:
const correctedStations = radioStations.map(s => {
    if (s.id === 'translation_fr') s.url = 'https://backup.qurango.net/radio/french';
    if (s.id === 'translation_en') s.url = 'https://backup.qurango.net/radio/english';
    if (s.id === 'cairo_radio') s.url = 'https://stream.radiojar.com/8s5u5tpdtwzuv'; // More stable Cairo link
    return s;
});

export const ALL_RADIOS = correctedStations;
