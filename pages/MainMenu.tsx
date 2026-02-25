
import React, { useState, useEffect, useRef } from 'react';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import WhatsAppButton from '../components/WhatsAppButton';
import InteractiveBackground from '../components/InteractiveBackground';
import { verses } from '../data/mainMenuData';
import MenuCustomizationModal from '../components/MenuCustomizationModal';

const MENU_ITEMS = [
    { id: 'quran', label: "📖 القرآن الكريم", className: "col-span-2 h-12", colorIndex: 0 },
    { id: 'listen', label: "🎧 الاستماع للقرآن", className: "col-span-2 h-10", colorIndex: 1 },
    { id: 'salah-adhkar', label: "🕌 أذكار الصلاة", className: "col-span-2 h-10", colorIndex: 1 },
    { id: 'adia', label: "🤲 الأدعية", className: "h-10", colorIndex: 1 },
    { id: 'sabah-masaa', label: "☀️ الأذكار", className: "h-10", colorIndex: 1 },
    { id: 'tasbeeh', label: "📿 السبحة", className: "h-10", colorIndex: 1 },
    { id: 'radio', label: "📻 إذاعة القرآن", className: "h-10", colorIndex: 1 },
    { id: 'calculators', label: "🧮 حاسبات إسلامية", className: "h-10", colorIndex: 1 },
    { id: 'hisn-muslim', label: "🛡️ حصن المسلم", className: "h-10", colorIndex: 1 },
    { id: 'calendar', label: "📅 التقويم", className: "h-10", colorIndex: 1 },
    { id: 'hajj-umrah', label: "🕋 الحج والعمرة", className: "h-10", colorIndex: 1 },
    { id: 'prayer-times', label: "⏱️ مواقيت الصلاة", className: "h-10", colorIndex: 1 },
    { id: 'qibla', label: "🧭 القبلة", className: "h-10", colorIndex: 1 },
    { id: 'nawawi', label: "📚 الأربعون النووية", className: "h-10", colorIndex: 1 },
];

const NavButton = ({ label, onClick, className, color, border }) => (
    <div className={`h-full ${className}`}>
        <button 
            onClick={onClick} 
            className="btn-3d-effect w-full rounded-2xl py-3 px-1 font-bold text-white relative text-sm h-full" 
            style={{ background: color, border: border || 'none' }}
        >
            {label}
        </button>
    </div>
);

function MainMenu({ onNavigate, onOpenThemes }) {
  const [currentVerse, setCurrentVerse] = useState(verses[0]);
  const { theme } = useTheme();
  const [visibleItems, setVisibleItems] = useState<string[]>([]);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * verses.length);
    setCurrentVerse(verses[randomIndex]);

    // Load saved preferences
    const savedItems = localStorage.getItem('visibleMenuItems');
    if (savedItems) {
        setVisibleItems(JSON.parse(savedItems));
    } else {
        setVisibleItems(MENU_ITEMS.map(i => i.id));
    }
  }, []);

  const handleSaveCustomization = (selectedIds: string[]) => {
      setVisibleItems(selectedIds);
      localStorage.setItem('visibleMenuItems', JSON.stringify(selectedIds));
  };

  const startPress = (e: React.SyntheticEvent) => {
      // Prevent default to avoid text selection or other native behaviors
      // e.preventDefault(); // CAREFUL: This might block scrolling if called on touchstart globally, but here we are on a specific element.
      // However, blocking touchstart default prevents scrolling, which is bad if the user just wants to scroll past this element.
      // So we don't preventDefault on start.
      
      isLongPressRef.current = false;
      longPressTimerRef.current = setTimeout(() => {
          isLongPressRef.current = true;
          setIsCustomizationOpen(true);
          // Haptic feedback
          if (navigator.vibrate) navigator.vibrate(50);
      }, 600); // 600ms
  };

  const cancelPress = () => {
      if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
      }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      // If it wasn't triggered by our long press logic (e.g. right click on desktop), open it
      if (!isLongPressRef.current) {
          setIsCustomizationOpen(true);
      }
  };

  return (
    <>
      <InteractiveBackground />
      <div className="h-screen w-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden pb-32 fade-in">
          <div className="main-layout px-4 h-full flex flex-col" style={{ fontFamily: theme.font }}>
              <div 
                className="text-center pt-12 select-none cursor-pointer active:scale-95 transition-transform touch-manipulation"
                onTouchStart={startPress}
                onTouchEnd={cancelPress}
                onTouchMove={cancelPress}
                onMouseDown={startPress}
                onMouseUp={cancelPress}
                onMouseLeave={cancelPress}
                onContextMenu={handleContextMenu}
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
              >
                  <p className="font-bold leading-tight mb-0.5 pointer-events-none" style={{ color: theme.textColor, fontSize: '1.1rem', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                      {currentVerse.text}
                  </p>
                  <p className="text-[10px] opacity-70 text-left pl-6 pointer-events-none" style={{ color: theme.textColor }}>
                      {`(${currentVerse.surah}: ${currentVerse.number})`}
                  </p>
              </div>

              <div className="text-center mt-4">
                  <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: theme.textColor, textShadow: '0 2px 5px rgba(0,0,0,0.4)' }}>
                      مُصْحَفُ أَحْمَدَ وَلَيْلَى
                  </h1>
                  <p className="text-[14px] font-semibold mt-2" style={{ color: theme.textColor, opacity: 0.9 }}>
                      نرجوا الدعاء لهم بالرحمة والمغفرة
                  </p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto flex-grow content-center">
                  {MENU_ITEMS.filter(item => visibleItems.includes(item.id)).map(item => (
                      <NavButton 
                        key={item.id}
                        label={item.label} 
                        onClick={() => onNavigate(item.id)} 
                        className={item.className} 
                        color={theme.palette[item.colorIndex]} 
                        border={theme.btnBorder} 
                      />
                  ))}
              </div>

              <div className="themed-card p-2.5 rounded-2xl text-center w-full max-w-sm mx-auto mt-4 mb-4">
                  <p className="text-[14px] font-bold" style={{ color: theme.textColor }}>
                      اللهم ارحمهما واغفر لهما واجعل مثواهما الجنة
                  </p>
              </div>
          </div>
        </div>
      </div>

      <BottomBar onHomeClick={() => {}} onThemesClick={onOpenThemes} showHome={false} showThemes={true} />
      <WhatsAppButton />
      
      <MenuCustomizationModal 
        isOpen={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
        allItems={MENU_ITEMS}
        visibleIds={visibleItems}
        onSave={handleSaveCustomization}
      />
    </>
  );
}

export default MainMenu;
