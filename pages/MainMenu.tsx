
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import WhatsAppButton from '../components/WhatsAppButton';
import InteractiveBackground from '../components/InteractiveBackground';
import { verses } from '../data/mainMenuData';
import MenuCustomizationModal from '../components/MenuCustomizationModal';

const DEFAULT_MENU_ITEMS = [
    { id: 'quran', label: "📖 القرآن الكريم", className: "col-span-2 h-12", colorIndex: 0 },
    { id: 'listen', label: "🎧 الاستماع للقرآن", className: "col-span-2 h-10", colorIndex: 0 },
    { id: 'salah-adhkar', label: "🕌 أذكار الصلاة", className: "col-span-2 h-10", colorIndex: 0 },
    { id: 'adia', label: "🤲 الأدعية", className: "h-10", colorIndex: 1 },
    { id: 'sabah-masaa', label: "☀️ الأذكار", className: "h-10", colorIndex: 1 },
    { id: 'tasbeeh', label: "📿 السبحة", className: "h-10", colorIndex: 1 },
    { id: 'calculators', label: "🧮 حاسبات إسلامية", className: "h-10", colorIndex: 1 },
    { id: 'hisn-muslim', label: "🛡️ حصن المسلم", className: "h-10", colorIndex: 1 },
    { id: 'calendar', label: "📅 التقويم", className: "h-10", colorIndex: 1 },
    { id: 'hajj-umrah', label: "🕋 الحج والعمرة", className: "h-10", colorIndex: 1 },
    { id: 'prayer-times', label: "⏱️ مواقيت الصلاة", className: "h-10", colorIndex: 1 },
    { id: 'qibla', label: "🧭 القبلة", className: "h-10", colorIndex: 1 },
    { id: 'nawawi', label: "📚 الأربعون النووية", className: "h-10", colorIndex: 1 },
];

interface NavButtonProps {
    label: string;
    onClick: () => void;
    className?: string;
    color?: string;
    border?: string;
    isEditMode?: boolean;
    onResize?: (e: React.MouseEvent) => void;
}

const NavButton: React.FC<NavButtonProps> = ({ label, onClick, className, color, border, isEditMode, onResize }) => (
    <div className={`h-full ${className} relative group`}>
        <button 
            onClick={onClick} 
            className={`btn-3d-effect w-full rounded-2xl py-3 px-1 font-bold text-white relative text-sm h-full ${isEditMode ? 'cursor-move animate-pulse' : ''}`}
            style={{ background: color, border: border || 'none' }}
            disabled={isEditMode}
        >
            {label}
        </button>
        {isEditMode && (
            <button 
                onClick={onResize}
                className="absolute top-1 left-1 bg-white/20 hover:bg-white/40 rounded-full p-1.5 z-20 transition-colors"
                title="تغيير الحجم"
            >
                <i className="fa-solid fa-expand text-white text-xs"></i>
            </button>
        )}
    </div>
);

function MainMenu({ onNavigate, onOpenThemes }) {
  const [currentVerse, setCurrentVerse] = useState(verses[0]);
  const { theme } = useTheme();
  const [visibleItems, setVisibleItems] = useState<string[]>([]);
  const [menuItems, setMenuItems] = useState(DEFAULT_MENU_ITEMS);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);
  const titleLongPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * verses.length);
    setCurrentVerse(verses[randomIndex]);

    // Load saved preferences
    const savedVisible = localStorage.getItem('visibleMenuItems');
    if (savedVisible) {
        setVisibleItems(JSON.parse(savedVisible));
    } else {
        setVisibleItems(DEFAULT_MENU_ITEMS.map(i => i.id));
    }

    const savedLayout = localStorage.getItem('menuLayout');
    if (savedLayout) {
        setMenuItems(JSON.parse(savedLayout));
    }
  }, []);

  const handleSaveCustomization = (selectedIds: string[]) => {
      setVisibleItems(selectedIds);
      localStorage.setItem('visibleMenuItems', JSON.stringify(selectedIds));
  };

  const handleSaveLayout = () => {
      localStorage.setItem('menuLayout', JSON.stringify(menuItems));
      setIsEditMode(false);
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleResetLayout = () => {
      setMenuItems(DEFAULT_MENU_ITEMS);
      localStorage.removeItem('menuLayout');
      setIsEditMode(false);
      if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleCancelEdit = () => {
      const savedLayout = localStorage.getItem('menuLayout');
      if (savedLayout) {
          setMenuItems(JSON.parse(savedLayout));
      } else {
          setMenuItems(DEFAULT_MENU_ITEMS);
      }
      setIsEditMode(false);
      if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleResize = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setMenuItems(prev => prev.map(item => {
          if (item.id === id) {
              const isLarge = item.className.includes('col-span-2');
              const newClass = isLarge 
                  ? item.className.replace('col-span-2', '').trim() 
                  : `${item.className} col-span-2`.trim();
              return { ...item, className: newClass };
          }
          return item;
      }));
  };

  const handleDragStart = () => {
      if (navigator.vibrate) navigator.vibrate(20);
  };

  const handleDragEnd = (event: any, info: any, draggedId: string) => {
      // Find the item currently under the cursor using geometry
      // This is more reliable than elementFromPoint which might hit the dragged element itself
      const point = info.point;
      const items = document.querySelectorAll('[data-item-id]');
      let targetId: string | null = null;

      for (let i = 0; i < items.length; i++) {
          const el = items[i];
          const id = el.getAttribute('data-item-id');
          if (id === draggedId) continue;

          const rect = el.getBoundingClientRect();
          if (
              point.x >= rect.left &&
              point.x <= rect.right &&
              point.y >= rect.top &&
              point.y <= rect.bottom
          ) {
              targetId = id;
              break;
          }
      }

      if (targetId) {
          const fromIndex = menuItems.findIndex(i => i.id === draggedId);
          const toIndex = menuItems.findIndex(i => i.id === targetId);
          
          if (fromIndex !== -1 && toIndex !== -1) {
              const newItems = [...menuItems];
              const [movedItem] = newItems.splice(fromIndex, 1);
              newItems.splice(toIndex, 0, movedItem);
              setMenuItems(newItems);
              if (navigator.vibrate) navigator.vibrate(20);
          }
      }
  };

  // Verse Long Press Logic
  const startPress = (e: React.SyntheticEvent) => {
      isLongPressRef.current = false;
      longPressTimerRef.current = setTimeout(() => {
          isLongPressRef.current = true;
          setIsCustomizationOpen(true);
          if (navigator.vibrate) navigator.vibrate(50);
      }, 600);
  };

  const cancelPress = () => {
      if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
      }
  };

  // Title Long Press Logic (for Edit Mode)
  const startTitlePress = () => {
      titleLongPressTimerRef.current = setTimeout(() => {
          setIsEditMode(true);
          if (navigator.vibrate) navigator.vibrate(100);
      }, 800);
  };

  const cancelTitlePress = () => {
      if (titleLongPressTimerRef.current) {
          clearTimeout(titleLongPressTimerRef.current);
          titleLongPressTimerRef.current = null;
      }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
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
              
              {/* Verse Section */}
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

              {/* Title Section */}
              <div 
                  className="text-center mt-4 select-none"
                  onTouchStart={startTitlePress}
                  onTouchEnd={cancelTitlePress}
                  onMouseDown={startTitlePress}
                  onMouseUp={cancelTitlePress}
                  onMouseLeave={cancelTitlePress}
              >
                  <h1 className={`text-4xl font-extrabold tracking-tight transition-transform ${isEditMode ? 'scale-110 text-yellow-400' : ''}`} style={{ color: isEditMode ? undefined : theme.textColor, textShadow: '0 2px 5px rgba(0,0,0,0.4)' }}>
                      مُصْحَفُ أَحْمَدَ وَلَيْلَى
                  </h1>
                  <p className="text-[14px] font-semibold mt-2" style={{ color: theme.textColor, opacity: 0.9 }}>
                      {isEditMode ? 'وضع تعديل التصميم' : 'نرجوا الدعاء لهم بالرحمة والمغفرة'}
                  </p>
              </div>

              {/* Grid Section */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto flex-grow content-center relative">
                  {menuItems.filter(item => visibleItems.includes(item.id)).map(item => (
                      <motion.div
                          layout
                          key={item.id}
                          data-item-id={item.id}
                          className={item.className}
                          drag={isEditMode}
                          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                          dragElastic={0.1}
                          whileDrag={{ scale: 1.1, zIndex: 50, cursor: 'grabbing' }}
                          onDragStart={handleDragStart}
                          onDragEnd={(e, info) => handleDragEnd(e, info, item.id)}
                      >
                          <NavButton 
                            label={item.label} 
                            onClick={() => !isEditMode && onNavigate(item.id)} 
                            className="w-full h-full"
                            color={theme.palette[item.colorIndex]} 
                            border={theme.btnBorder} 
                            isEditMode={isEditMode}
                            onResize={(e) => handleResize(item.id, e)}
                          />
                      </motion.div>
                  ))}
              </div>

              {/* Footer/Save Button */}
              <div className="themed-card p-2.5 rounded-2xl text-center w-full max-w-sm mx-auto mt-4 mb-4 relative">
                  {isEditMode ? (
                      <div className="flex justify-center gap-2">
                          <button 
                              onClick={handleSaveLayout}
                              className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg text-sm"
                          >
                              حفظ
                          </button>
                          <button 
                              onClick={handleResetLayout}
                              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg text-sm"
                          >
                              الافتراضي
                          </button>
                          <button 
                              onClick={handleCancelEdit}
                              className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg text-sm"
                          >
                              إلغاء
                          </button>
                      </div>
                  ) : (
                      <p className="text-[14px] font-bold" style={{ color: theme.textColor }}>
                          اللهم ارحمهما واغفر لهما واجعل مثواهما الجنة
                      </p>
                  )}
              </div>
          </div>
        </div>
      </div>

      <BottomBar onHomeClick={() => {}} onThemesClick={onOpenThemes} showHome={false} showThemes={true} />
      <WhatsAppButton />
      
      <MenuCustomizationModal 
        isOpen={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
        allItems={DEFAULT_MENU_ITEMS}
        visibleIds={visibleItems}
        onSave={handleSaveCustomization}
      />
    </>
  );
}

export default MainMenu;
