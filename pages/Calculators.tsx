import React, { useState, useMemo } from 'react';
import { calculateMawarith, HeirResult } from '@/utils/mawarithCalculator';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';

interface CalculatorsProps {
    onBack: () => void;
}

const Calculators: React.FC<CalculatorsProps> = ({ onBack }) => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'zakat' | 'mawarith' | 'kaffarat'>('zakat');

    // --- Zakat State ---
    const [gold24Weight, setGold24Weight] = useState('');
    const [gold24Price, setGold24Price] = useState('');
    const [gold21Weight, setGold21Weight] = useState('');
    const [gold21Price, setGold21Price] = useState('');
    const [gold18Weight, setGold18Weight] = useState('');
    const [gold18Price, setGold18Price] = useState('');
    const [silverWeight, setSilverWeight] = useState('');
    const [silverPrice, setSilverPrice] = useState('');
    const [cashAmount, setCashAmount] = useState('');

    // --- Mawarith State ---
    const [estateValue, setEstateValue] = useState('');
    const [hasFather, setHasFather] = useState(false);
    const [hasMother, setHasMother] = useState(false);
    const [spouseType, setSpouseType] = useState<'none' | 'husband' | 'wife'>('none');
    const [wivesCount, setWivesCount] = useState(1);
    const [sonsCount, setSonsCount] = useState(0);
    const [daughtersCount, setDaughtersCount] = useState(0);
    const [hasPaternalGrandfather, setHasPaternalGrandfather] = useState(false);
    const [hasMaternalGrandmother, setHasMaternalGrandmother] = useState(false);
    const [brothersCount, setBrothersCount] = useState(0);
    const [sistersCount, setSistersCount] = useState(0);
    const [paternalUnclesCount, setPaternalUnclesCount] = useState(0);
    const [paternalAuntsCount, setPaternalAuntsCount] = useState(0);
    const [maternalUnclesCount, setMaternalUnclesCount] = useState(0);
    const [maternalAuntsCount, setMaternalAuntsCount] = useState(0);

    // --- Kaffarat State ---
    const [missedFastingDays, setMissedFastingDays] = useState('');
    const [feedingCost, setFeedingCost] = useState('');
    const [oathCount, setOathCount] = useState('');

    const inputStyle = {
        backgroundColor: theme.isOriginal ? '#fff' : 'rgba(255,255,255,0.05)',
        borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.2)',
        color: theme.textColor,
        fontFamily: 'Cairo, sans-serif'
    };

    // --- Zakat Calculation ---
    const calculateZakat = () => {
        const w24 = parseFloat(gold24Weight) || 0;
        const p24 = parseFloat(gold24Price) || 0;
        const w21 = parseFloat(gold21Weight) || 0;
        const p21 = parseFloat(gold21Price) || 0;
        const w18 = parseFloat(gold18Weight) || 0;
        const p18 = parseFloat(gold18Price) || 0;
        
        const goldValue = (w24 * p24) + (w21 * p21) + (w18 * p18);
        const silverValue = (parseFloat(silverWeight) || 0) * (parseFloat(silverPrice) || 0);
        const cash = parseFloat(cashAmount) || 0;
        
        const totalWealth = goldValue + silverValue + cash;
        
        // Nisab is 85g of 24k gold.
        let price24k = p24;
        if (price24k === 0 && p21 > 0) price24k = p21 * (24 / 21);
        if (price24k === 0 && p18 > 0) price24k = p18 * (24 / 18);
        
        const goldNisabValue = price24k > 0 ? 85 * price24k : 0;
        
        if (goldNisabValue > 0 && totalWealth >= goldNisabValue) {
            return (totalWealth * 0.025).toFixed(2);
        } else if (goldNisabValue === 0 && totalWealth > 0) {
             return (totalWealth * 0.025).toFixed(2); // If price not provided, just calculate 2.5%
        }
        return '0.00';
    };

    // --- Mawarith Calculation ---
    /*
        شرح مبسط لمعادلة الميراث المطبقة هنا:
        1. يتم تحديد أصحاب الفروض أولاً (الزوج/الزوجة، الأب، الأم).
        2. الزوج: يأخذ النصف إذا لم يكن هناك فرع وارث (أبناء/بنات)، والربع إذا وجد.
        3. الزوجة: تأخذ الربع إذا لم يكن هناك فرع وارث، والثمن إذا وجد (يوزع بالتساوي إذا كن أكثر من واحدة).
        4. الأب: يأخذ السدس لوجود فرع وارث. (في حال عدم وجود فرع وارث يأخذ الباقي تعصيباً، تم تبسيطها هنا).
        5. الأم: تأخذ السدس لوجود فرع وارث، والثلث إذا لم يوجد.
        6. الأبناء والبنات: يأخذون الباقي (التعصيب) للذكر مثل حظ الأنثيين.
           إذا كان هناك بنات فقط: البنت الواحدة تأخذ النصف، والبنتان فأكثر يأخذن الثلثين.
        ملاحظة: هذه الحاسبة استرشادية للحالات الأساسية فقط، ولا تشمل حالات الحجب المعقدة والعول والرد. يُفضل مراجعة أهل العلم والمحاكم الشرعية في المسائل المعقدة لضمان التوزيع الشرعي الدقيق.
    */



    const mawarithResults: HeirResult[] = useMemo(() => calculateMawarith({
        estateValue,
        hasFather,
        hasMother,
        spouseType,
        wivesCount,
        sonsCount,
        daughtersCount,
        hasPaternalGrandfather,
        hasMaternalGrandmother,
        brothersCount,
        sistersCount,
        paternalUnclesCount,
        paternalAuntsCount,
        maternalUnclesCount,
        maternalAuntsCount,
    }), [
        estateValue, hasFather, hasMother, spouseType, wivesCount, sonsCount,
        daughtersCount, hasPaternalGrandfather, hasMaternalGrandmother, brothersCount,
        sistersCount, paternalUnclesCount, paternalAuntsCount, maternalUnclesCount, maternalAuntsCount,
    ]);

    return (
        <div className="h-screen flex flex-col bg-transparent">
            {/* Header */}
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <h1 className="app-top-bar__title text-2xl font-kufi text-center">حاسبات إسلامية</h1>
                    <p className="app-top-bar__subtitle text-center">زكاة، ميراث، كفارات</p>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex px-4 pt-4 gap-2 font-cairo">
                <button 
                    onClick={() => setActiveTab('zakat')}
                    className={`flex-1 py-2 rounded-t-xl font-bold transition-colors ${activeTab === 'zakat' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                >
                    الزكاة
                </button>
                <button 
                    onClick={() => setActiveTab('mawarith')}
                    className={`flex-1 py-2 rounded-t-xl font-bold transition-colors ${activeTab === 'mawarith' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                >
                    الميراث
                </button>
                <button 
                    onClick={() => setActiveTab('kaffarat')}
                    className={`flex-1 py-2 rounded-t-xl font-bold transition-colors ${activeTab === 'kaffarat' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                >
                    الكفارات
                </button>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 pb-24 hide-scrollbar font-cairo">
                
                {/* Zakat Tab */}
                {activeTab === 'zakat' && (
                    <div className="themed-card p-5 rounded-xl space-y-4 animate-fade-in">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: theme.textColor }}>
                            <i className="fa-solid fa-coins text-primary"></i> حاسبة الزكاة
                        </h2>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>النقود والمدخرات</label>
                                <input type="number" placeholder="المبلغ" value={cashAmount} onChange={e => setCashAmount(e.target.value)} className="w-full p-3 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>الذهب</label>
                                <div className="grid grid-cols-[auto_1fr_1fr] gap-3 items-center">
                                    <span className="text-sm font-bold w-12" style={{ color: theme.textColor }}>عيار 24</span>
                                    <input type="number" placeholder="الوزن (جرام)" value={gold24Weight} onChange={e => setGold24Weight(e.target.value)} className="w-full p-2 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                                    <input type="number" placeholder="سعر الجرام" value={gold24Price} onChange={e => setGold24Price(e.target.value)} className="w-full p-2 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                                </div>
                                <div className="grid grid-cols-[auto_1fr_1fr] gap-3 items-center">
                                    <span className="text-sm font-bold w-12" style={{ color: theme.textColor }}>عيار 21</span>
                                    <input type="number" placeholder="الوزن (جرام)" value={gold21Weight} onChange={e => setGold21Weight(e.target.value)} className="w-full p-2 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                                    <input type="number" placeholder="سعر الجرام" value={gold21Price} onChange={e => setGold21Price(e.target.value)} className="w-full p-2 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                                </div>
                                <div className="grid grid-cols-[auto_1fr_1fr] gap-3 items-center">
                                    <span className="text-sm font-bold w-12" style={{ color: theme.textColor }}>عيار 18</span>
                                    <input type="number" placeholder="الوزن (جرام)" value={gold18Weight} onChange={e => setGold18Weight(e.target.value)} className="w-full p-2 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                                    <input type="number" placeholder="سعر الجرام" value={gold18Price} onChange={e => setGold18Price(e.target.value)} className="w-full p-2 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>وزن الفضة (جرام)</label>
                                    <input type="number" placeholder="الوزن" value={silverWeight} onChange={e => setSilverWeight(e.target.value)} className="w-full p-3 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>سعر جرام الفضة</label>
                                    <input type="number" placeholder="السعر" value={silverPrice} onChange={e => setSilverPrice(e.target.value)} className="w-full p-3 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
                            <p className="text-sm font-bold opacity-80 mb-1" style={{ color: theme.textColor }}>مقدار الزكاة الواجب إخراجها</p>
                            <p className="text-3xl font-bold text-primary">{calculateZakat()}</p>
                        </div>
                    </div>
                )}

                {/* Mawarith Tab */}
                {activeTab === 'mawarith' && (
                    <div className="themed-card p-5 rounded-xl space-y-4 animate-fade-in">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: theme.textColor }}>
                            <i className="fa-solid fa-scale-balanced text-primary"></i> توزيع الميراث
                        </h2>

                        <div>
                            <label className="block text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>قيمة التركة الإجمالية</label>
                            <input type="number" placeholder="المبلغ" value={estateValue} onChange={e => setEstateValue(e.target.value)} className="w-full p-3 rounded-lg border focus:ring-2 focus:outline-none text-lg font-bold" style={inputStyle} />
                        </div>

                        <div className="space-y-3 mt-4">
                            <h3 className="font-bold border-b pb-2" style={{ color: theme.textColor, borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }}>الورثة</h3>
                            
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={hasFather} onChange={e => setHasFather(e.target.checked)} className="w-5 h-5 accent-primary" />
                                    <span style={{ color: theme.textColor }}>الأب</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={hasMother} onChange={e => setHasMother(e.target.checked)} className="w-5 h-5 accent-primary" />
                                    <span style={{ color: theme.textColor }}>الأم</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={hasPaternalGrandfather} onChange={e => setHasPaternalGrandfather(e.target.checked)} className="w-5 h-5 accent-primary" />
                                    <span style={{ color: theme.textColor }}>الجد لأب</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={hasMaternalGrandmother} onChange={e => setHasMaternalGrandmother(e.target.checked)} className="w-5 h-5 accent-primary" />
                                    <span style={{ color: theme.textColor }}>الجدة لأم</span>
                                </label>
                            </div>

                            <div className="flex items-center gap-4 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="spouse" checked={spouseType === 'none'} onChange={() => setSpouseType('none')} className="w-5 h-5 accent-primary" />
                                    <span style={{ color: theme.textColor }}>لا يوجد زوج/زوجة</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="spouse" checked={spouseType === 'husband'} onChange={() => setSpouseType('husband')} className="w-5 h-5 accent-primary" />
                                    <span style={{ color: theme.textColor }}>زوج</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="spouse" checked={spouseType === 'wife'} onChange={() => setSpouseType('wife')} className="w-5 h-5 accent-primary" />
                                    <span style={{ color: theme.textColor }}>زوجة</span>
                                </label>
                            </div>
                            
                            {spouseType === 'wife' && (
                                <div className="flex items-center gap-2 mt-2">
                                    <label style={{ color: theme.textColor }}>عدد الزوجات:</label>
                                    <input type="number" min="1" max="4" value={wivesCount} onChange={e => setWivesCount(parseInt(e.target.value) || 1)} className="w-20 p-2 rounded-lg border text-center" style={inputStyle} />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>عدد الأبناء (ذكور)</label>
                                    <input type="text" inputMode="numeric" pattern="[0-9]*" min="0" value={sonsCount} onChange={e => setSonsCount(parseInt(e.target.value) || 0)} className="w-full p-3 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>عدد البنات (إناث)</label>
                                    <input type="text" inputMode="numeric" pattern="[0-9]*" min="0" value={daughtersCount} onChange={e => setDaughtersCount(parseInt(e.target.value) || 0)} className="w-full p-3 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>عدد الإخوة</label>
                                    <input type="text" inputMode="numeric" pattern="[0-9]*" min="0" value={brothersCount} onChange={e => setBrothersCount(parseInt(e.target.value) || 0)} className="w-full p-3 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>عدد الأخوات</label>
                                    <input type="text" inputMode="numeric" pattern="[0-9]*" min="0" value={sistersCount} onChange={e => setSistersCount(parseInt(e.target.value) || 0)} className="w-full p-3 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>عدد الأعمام</label>
                                    <input type="text" inputMode="numeric" pattern="[0-9]*" min="0" value={paternalUnclesCount} onChange={e => setPaternalUnclesCount(parseInt(e.target.value) || 0)} className="w-full p-3 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>عدد العمات</label>
                                    <input type="text" inputMode="numeric" pattern="[0-9]*" min="0" value={paternalAuntsCount} onChange={e => setPaternalAuntsCount(parseInt(e.target.value) || 0)} className="w-full p-3 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>عدد الأخوال</label>
                                    <input type="text" inputMode="numeric" pattern="[0-9]*" min="0" value={maternalUnclesCount} onChange={e => setMaternalUnclesCount(parseInt(e.target.value) || 0)} className="w-full p-3 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>عدد الخالات</label>
                                    <input type="text" inputMode="numeric" pattern="[0-9]*" min="0" value={maternalAuntsCount} onChange={e => setMaternalAuntsCount(parseInt(e.target.value) || 0)} className="w-full p-3 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                                </div>
                            </div>
                        </div>

                        {mawarithResults.length > 0 && (
                            <div className="mt-6">
                                <h3 className="font-bold mb-3" style={{ color: theme.textColor }}>النتيجة:</h3>
                                <div className="rounded-xl overflow-hidden border" style={{ borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }}>
                                    <table className="w-full text-right">
                                        <thead className="bg-primary/10">
                                            <tr>
                                                <th className="p-3 font-bold" style={{ color: theme.textColor }}>الوارث</th>
                                                <th className="p-3 font-bold" style={{ color: theme.textColor }}>النسبة</th>
                                                <th className="p-3 font-bold" style={{ color: theme.textColor }}>المبلغ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mawarithResults.map((result, idx) => (
                                                <tr key={idx} className="border-t" style={{ borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.05)' }}>
                                                    <td className="p-3 font-semibold" style={{ color: theme.textColor }}>{result.name}</td>
                                                    <td className="p-3 opacity-80" style={{ color: theme.textColor }}>{(result.share * 100).toFixed(1)}%</td>
                                                    <td className="p-3 font-bold text-primary">{result.amount.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                            <p className="text-xs leading-relaxed text-center opacity-80" style={{ color: theme.textColor }}>
                                ⚠️ ملاحظة هامة: هذه الحاسبة استرشادية للحالات الأساسية فقط، ولا تشمل حالات الحجب والعول والرد والإخوة والأجداد. يُفضل مراجعة أهل العلم والمحاكم الشرعية في المسائل المعقدة لضمان التوزيع الشرعي الدقيق.
                            </p>
                        </div>
                    </div>
                )}

                {/* Kaffarat Tab */}
                {activeTab === 'kaffarat' && (
                    <div className="themed-card p-5 rounded-xl space-y-6 animate-fade-in">
                        <div>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: theme.textColor }}>
                                <i className="fa-solid fa-bowl-food text-primary"></i> فدية الصيام
                            </h2>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>عدد الأيام</label>
                                    <input type="number" placeholder="الأيام" value={missedFastingDays} onChange={e => setMissedFastingDays(e.target.value)} className="w-full p-3 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>تكلفة إطعام مسكين</label>
                                    <input type="number" placeholder="التكلفة" value={feedingCost} onChange={e => setFeedingCost(e.target.value)} className="w-full p-3 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                                </div>
                            </div>
                            <div className="mt-3 p-3 rounded-lg bg-primary/10 text-center">
                                <span className="font-bold opacity-80" style={{ color: theme.textColor }}>الإجمالي: </span>
                                <span className="text-xl font-bold text-primary">
                                    {((parseFloat(missedFastingDays) || 0) * (parseFloat(feedingCost) || 0)).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="border-t pt-6" style={{ borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }}>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: theme.textColor }}>
                                <i className="fa-solid fa-hand-holding-heart text-primary"></i> كفارة اليمين
                            </h2>
                            <p className="text-sm mb-3 opacity-80" style={{ color: theme.textColor }}>إطعام عشرة مساكين من أوسط ما تطعمون أهليكم</p>
                            <div>
                                <label className="block text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>تكلفة الوجبة الواحدة</label>
                                <input type="number" placeholder="التكلفة" value={feedingCost} onChange={e => setFeedingCost(e.target.value)} className="w-full p-3 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                            </div>
                            <div className="mt-3 p-3 rounded-lg bg-primary/10 text-center">
                                <span className="font-bold opacity-80" style={{ color: theme.textColor }}>الإجمالي لـ 10 مساكين: </span>
                                <span className="text-xl font-bold text-primary">
                                    {((parseFloat(feedingCost) || 0) * 10).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

            </main>

            <BottomBar onHomeClick={onBack} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
};

export default Calculators;
