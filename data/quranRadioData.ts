export interface RadioStation {
    id: string;
    name: string;
    url: string;
    category: string;
    image?: string;
}

export const radioStations: RadioStation[] = [
    // 1. إذاعات القرآن الكريم العامة
    {
        id: 'main_radio',
        name: 'إذاعة القرآن الكريم العامة',
        url: 'https://qurango.net/radio/main_radio',
        category: 'إذاعات عامة'
    },
    {
        id: 'cairo_radio',
        name: 'إذاعة القرآن الكريم من القاهرة',
        url: 'https://stream.radiojar.com/8s5u5tpdtwzuv',
        category: 'إذاعات عامة'
    },
    {
        id: 'makkah_radio',
        name: 'إذاعة القرآن الكريم من مكة المكرمة',
        url: 'https://qurango.net/radio/makkah',
        category: 'إذاعات عامة'
    },
    {
        id: 'saudi_quran',
        name: 'إذاعة السنة النبوية',
        url: 'https://qurango.net/radio/sunnah',
        category: 'إذاعات عامة'
    },

    // 2. كبار القراء (التراث)
    {
        id: 'hussary',
        name: 'الشيخ محمود خليل الحصري',
        url: 'https://qurango.net/radio/hussary',
        category: 'كبار القراء (التراث)'
    },
    {
        id: 'minshawi_mujawwad',
        name: 'الشيخ محمد صديق المنشاوي (مجود)',
        url: 'https://qurango.net/radio/minshawi_mujawwad',
        category: 'كبار القراء (التراث)'
    },
    {
        id: 'minshawi_murattal',
        name: 'الشيخ محمد صديق المنشاوي (مرتل)',
        url: 'https://qurango.net/radio/minshawi',
        category: 'كبار القراء (التراث)'
    },
    {
        id: 'abdulbasit_mujawwad',
        name: 'الشيخ عبد الباسط عبد الصمد (مجود)',
        url: 'https://qurango.net/radio/abdulbasit_mujawwad',
        category: 'كبار القراء (التراث)'
    },
    {
        id: 'abdulbasit_murattal',
        name: 'الشيخ عبد الباسط عبد الصمد (مرتل)',
        url: 'https://qurango.net/radio/abdulbasit',
        category: 'كبار القراء (التراث)'
    },
    {
        id: 'mustafa_ismail',
        name: 'الشيخ مصطفى إسماعيل',
        url: 'https://qurango.net/radio/mustafa_ismail',
        category: 'كبار القراء (التراث)'
    },
    {
        id: 'banna',
        name: 'الشيخ محمود علي البنا',
        url: 'https://qurango.net/radio/banna',
        category: 'كبار القراء (التراث)'
    },
    {
        id: 'tablawi',
        name: 'الشيخ محمد محمود الطبلاوي',
        url: 'https://qurango.net/radio/tablawi',
        category: 'كبار القراء (التراث)'
    },

    // 3. القراء المعاصرين
    {
        id: 'alafasy',
        name: 'الشيخ مشاري راشد العفاسي',
        url: 'https://qurango.net/radio/alafasy',
        category: 'القراء المعاصرين'
    },
    {
        id: 'shuraim',
        name: 'الشيخ سعود الشريم',
        url: 'https://qurango.net/radio/shuraim',
        category: 'القراء المعاصرين'
    },
    {
        id: 'sudais',
        name: 'الشيخ عبد الرحمن السديس',
        url: 'https://qurango.net/radio/sudais',
        category: 'القراء المعاصرين'
    },
    {
        id: 'maher',
        name: 'الشيخ ماهر المعيقلي',
        url: 'https://qurango.net/radio/maher',
        category: 'القراء المعاصرين'
    },
    {
        id: 'yasser',
        name: 'الشيخ ياسر الدوسري',
        url: 'https://qurango.net/radio/yasser',
        category: 'القراء المعاصرين'
    },
    {
        id: 'ghamdi',
        name: 'الشيخ سعد الغامدي',
        url: 'https://qurango.net/radio/ghamdi',
        category: 'القراء المعاصرين'
    },
    {
        id: 'ajmy',
        name: 'الشيخ أحمد العجمي',
        url: 'https://qurango.net/radio/ajmy',
        category: 'القراء المعاصرين'
    },
    {
        id: 'nasser_qatami',
        name: 'الشيخ ناصر القطامي',
        url: 'https://qurango.net/radio/nasser_alqjtami',
        category: 'القراء المعاصرين'
    },
    {
        id: 'idrees_abkar',
        name: 'الشيخ إدريس أبكر',
        url: 'https://qurango.net/radio/idrees_abkar',
        category: 'القراء المعاصرين'
    },

    // 4. إذاعات متخصصة
    {
        id: 'roqiah',
        name: 'الرقية الشرعية',
        url: 'https://qurango.net/radio/roqiah',
        category: 'إذاعات متخصصة'
    },
    {
        id: 'surah_al_baqarah',
        name: 'إذاعة سورة البقرة - لعدة قراء',
        url: 'https://qurango.net/radio/surah_al_baqarah',
        category: 'إذاعات متخصصة'
    },
    {
        id: 'tafseer',
        name: 'تفسير القران الكريم',
        url: 'https://qurango.net/radio/tafseer',
        category: 'إذاعات متخصصة'
    },
    {
        id: 'fatwa',
        name: 'الفتاوى',
        url: 'https://qurango.net/radio/fatwa',
        category: 'إذاعات متخصصة'
    },

    // 5. ترجمات معاني القرآن
    {
        id: 'translation_en',
        name: 'ترجمة معاني القرآن (الإنجليزية)',
        url: 'https://qurango.net/radio/english',
        category: 'ترجمات معاني القرآن'
    },
    {
        id: 'translation_fr',
        name: 'ترجمة معاني القرآن (الفرنسية)',
        url: 'https://qurango.net/radio/french',
        category: 'ترجمات معاني القرآن'
    }
];

export const ALL_RADIOS = radioStations;
