import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes } from 'adhan';
import { prayerNamesAr } from '../data/prayerTimesData';

// --- Types ---
interface PrayerConfig {
    iqamaOffsets: Record<string, number>;
    prayerOffsets: Record<string, number>;
    tones: Record<string, { name: string; data: string }>;
    mutedPrayers: Record<string, boolean>;
    location: {
        cityGov: string;
        fullCountry: string;
        combinedCode: string;
        lat: number;
        lng: number;
    };
}

interface PrayerTimesContextType {
    times: Record<string, string>;
    dates: { hijri: string; gregorian: string };
    nextPrayer: { key: string; date: Date; name: string } | null;
    countdown: string;
    config: PrayerConfig;
    setConfig: React.Dispatch<React.SetStateAction<PrayerConfig>>;
    refreshLocation: () => void;
    manualSearch: (query: string) => Promise<void>;
    updateConfig: (newConfig: Partial<PrayerConfig>) => void;
}

// --- Default Configuration ---
const DEFAULT_CONFIG: PrayerConfig = {
    iqamaOffsets: { Fajr: 20, Dhuhr: 15, Asr: 15, Maghrib: 10, Isha: 15 },
    prayerOffsets: { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 },
    tones: {},
    mutedPrayers: { Sunrise: true },
    location: { cityGov: "الدمام - الشرقية", fullCountry: "المملكة العربية السعودية", combinedCode: "+966013", lat: 26.4207, lng: 50.0888 }
};

const defaultTones = [
    { name: "أذان كامل", path: "/assets/audio/adhan full.mp3" },
];

// --- Helper Functions ---
const applyOffset = (timeStr: string, offsetMins: number) => {
    if (!timeStr || timeStr.includes('--')) return "--:--";
    let [h, m] = timeStr.split(':');
    let date = new Date();
    date.setHours(parseInt(h), parseInt(m), 0);
    date.setMinutes(date.getMinutes() + (offsetMins || 0));
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const PrayerTimesContext = createContext<PrayerTimesContextType | undefined>(undefined);

export const PrayerTimesProvider = ({ children }: { children: ReactNode }) => {
    const [config, setConfig] = useState<PrayerConfig>(() => {
        try {
            const saved = localStorage.getItem('prayerFinal_v33');
            return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
        } catch (e) {
            return DEFAULT_CONFIG;
        }
    });

    const [times, setTimes] = useState<Record<string, string>>({});
    const [dates, setDates] = useState({ hijri: "-- -- --", gregorian: "-- -- --" });
    const [nextPrayer, setNextPrayer] = useState<{ key: string; date: Date; name: string } | null>(null);
    const [countdown, setCountdown] = useState("00:00:00");

    // --- Save Config ---
    useEffect(() => {
        localStorage.setItem('prayerFinal_v33', JSON.stringify(config));
        // Re-calculate times when config changes (e.g. location)
        fetchTimesForLocation(config.location);
    }, [config]);

    // --- Calculation Logic ---
    const fetchTimesForLocation = useCallback(async (locationData: any) => {
        const { lat, lng } = locationData;
        try {
            const coordinates = new Coordinates(lat, lng);
            const params = CalculationMethod.UmmAlQura();
            const date = new Date();
            const prayerTimes = new AdhanPrayerTimes(coordinates, date, params);

            const formatTime = (d: Date) => {
                return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
            };

            const timings = {
                Fajr: formatTime(prayerTimes.fajr),
                Sunrise: formatTime(prayerTimes.sunrise),
                Dhuhr: formatTime(prayerTimes.dhuhr),
                Asr: formatTime(prayerTimes.asr),
                Maghrib: formatTime(prayerTimes.maghrib),
                Isha: formatTime(prayerTimes.isha),
            };

            const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
            const hijriDate = hijriFormatter.format(date);
            
            const gregorianFormatter = new Intl.DateTimeFormat('ar-EG', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
            const gregorianDate = gregorianFormatter.format(date);

            const datesData = { hijri: hijriDate, gregorian: gregorianDate };

            setTimes(timings);
            setDates(datesData);
            
            // Cache for offline use
            localStorage.setItem('grandPrayersCache', JSON.stringify({ timings, dates: datesData }));
            
        } catch(e) { console.error("Failed to calculate prayer times:", e); }
    }, []);

    // --- Location Logic ---
    const fetchByIP = async () => {
        await fetchTimesForLocation(config.location);
    };
    
    const refreshLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    let newLoc = {
                        lat: latitude, lng: longitude,
                        cityGov: 'موقعي الحالي', fullCountry: '', combinedCode: ''
                    };
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ar`);
                        const data = await res.json();
                        const addr = data.address;
                        const city = addr.village || addr.town || addr.city || "موقعي";
                        newLoc = {
                            ...newLoc,
                            cityGov: `${city} - ${addr.state || ""}`,
                            fullCountry: addr.country,
                            combinedCode: "+966"
                        };
                    } catch(e) {
                        newLoc.cityGov = "موقعي الحالي (بدون اتصال)";
                    }
                    setConfig(prev => ({ ...prev, location: newLoc }));
                },
                () => fetchByIP(),
                { enableHighAccuracy: true, timeout: 6000 }
            );
        } else {
            fetchByIP();
        }
    }, []);

    const manualSearch = useCallback(async (query: string) => {
        if(!query) return;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&accept-language=ar&limit=1`);
            const data = await res.json();
            if(data && data.length > 0) {
                const addr = data[0].address;
                const name = addr.city || addr.town || addr.village || query;
                const province = addr.state || "";
                const newLocation = {
                    cityGov: `${name} - ${province}`,
                    fullCountry: addr.country,
                    combinedCode: "+966",
                    lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon)
                };
                setConfig(prev => ({ ...prev, location: newLocation }));
            } else {
                throw new Error("لم يتم العثور على نتائج");
            }
        } catch(e) { 
            throw e;
        } 
    }, []);

    const updateConfig = useCallback((newConfig: Partial<PrayerConfig>) => {
        setConfig(prev => ({ ...prev, ...newConfig }));
    }, []);

    // --- Notification Scheduling ---
    const scheduleNotifications = useCallback(() => {
        const w = window as any;
        if (w.cordova && w.cordova.plugins && w.cordova.plugins.notification && w.cordova.plugins.notification.local) {
            const localNotifier = w.cordova.plugins.notification.local;

            // Create Notification Channel for Android 8+
            if (w.cordova.platformId === 'android') {
                localNotifier.addActions('adhan_actions', [
                    { id: 'dismiss', title: 'إيقاف' }
                ]);
                
                // We need to ensure the channel exists before scheduling
                // The plugin might create a default channel, but it's better to be explicit
            }

            // Request permission first
            localNotifier.hasPermission((granted: boolean) => {
                const proceed = () => {
                    localNotifier.cancelAll(() => {
                        const prayerKeys = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
                        const notificationsToSchedule: any[] = [];
                        
                        // Schedule for today and next 6 days (total 7 days)
                        for (let day = 0; day < 7; day++) {
                            const date = new Date();
                            date.setDate(date.getDate() + day);
                            
                            // Recalculate times for that specific day
                            const coordinates = new Coordinates(config.location.lat, config.location.lng);
                            const params = CalculationMethod.UmmAlQura();
                            const prayerTimes = new AdhanPrayerTimes(coordinates, date, params);
                            
                            const dayTimings: any = {
                                Fajr: prayerTimes.fajr,
                                Dhuhr: prayerTimes.dhuhr,
                                Asr: prayerTimes.asr,
                                Maghrib: prayerTimes.maghrib,
                                Isha: prayerTimes.isha,
                            };

                            prayerKeys.forEach((key) => {
                                if (!config.mutedPrayers[key]) {
                                    let prayerDate = dayTimings[key];
                                    // Apply offset
                                    prayerDate.setMinutes(prayerDate.getMinutes() + (config.prayerOffsets[key] || 0));

                                    // Skip if time passed
                                    if (prayerDate < new Date()) return;

                                    const toneConfig = config.tones[key];
                                    let soundPath = defaultTones[0].path;
                                    
                                    if (toneConfig && toneConfig.data && toneConfig.data !== 'none' && !toneConfig.data.startsWith('data:')) {
                                        soundPath = toneConfig.data;
                                    }

                                    // Fix sound path for Android
                                    if (w.cordova.platformId === 'android' && soundPath.startsWith('/')) {
                                        soundPath = 'file:///android_asset/www' + soundPath;
                                    }

                                    // Unique ID: day index * 10 + prayer index
                                    const id = (day * 10) + prayerKeys.indexOf(key) + 1;

                                    notificationsToSchedule.push({
                                        id: id,
                                        title: `حان الآن موعد أذان ${prayerNamesAr[key]}`,
                                        text: 'لا تنس ذكر الله. قال رسول الله ﷺ: "أرحنا بها يا بلال"',
                                        trigger: { at: prayerDate },
                                        foreground: true,
                                        sound: soundPath,
                                        channel: 'adhan_channel', // Important for Android 8+
                                        priority: 2, // High priority
                                        lockscreen: true,
                                        vibrate: true,
                                        launch: true
                                    });
                                }
                            });
                        }

                        if (notificationsToSchedule.length > 0) {
                            localNotifier.schedule(notificationsToSchedule);
                            console.log(`Scheduled ${notificationsToSchedule.length} notifications.`);
                        }
                    });
                };

                if (granted) {
                    proceed();
                } else {
                    localNotifier.requestPermission((newlyGranted: boolean) => {
                        if (newlyGranted) proceed();
                    });
                }
            });
        }
    }, [config]);

    // Schedule whenever config changes (location, offsets, muted prayers)
    useEffect(() => {
        scheduleNotifications();
    }, [scheduleNotifications]);

    // --- Next Prayer & Countdown Logic ---
    useEffect(() => {
        const findNext = () => {
            if (!Object.keys(times).length) return null;
            const now = new Date();
            const keys = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
            let found = null;

            for (const key of keys) {
                const adjustedTime = applyOffset(times[key], config.prayerOffsets[key]);
                if (adjustedTime && !adjustedTime.includes('--')) {
                    const [h, m] = adjustedTime.split(':');
                    const pDate = new Date();
                    pDate.setHours(parseInt(h), parseInt(m), 0, 0);
                    if (pDate > now) {
                        found = { key, date: pDate, name: prayerNamesAr[key] };
                        break;
                    }
                }
            }

            if (!found && times.Fajr) {
                const fajrTime = applyOffset(times.Fajr, config.prayerOffsets.Fajr);
                if (fajrTime && !fajrTime.includes('--')) {
                    const [h, m] = fajrTime.split(':');
                    const pDate = new Date();
                    pDate.setDate(pDate.getDate() + 1);
                    pDate.setHours(parseInt(h), parseInt(m), 0, 0);
                    found = { key: 'Fajr', date: pDate, name: prayerNamesAr['Fajr'] };
                }
            }
            return found;
        };

        const timer = setInterval(() => {
            const next = findNext();
            setNextPrayer(next);
            
            if (next) {
                const diff = next.date.getTime() - new Date().getTime();
                if (diff > 0) {
                    const h = Math.floor(diff / 3600000);
                    const m = Math.floor((diff % 3600000) / 60000);
                    const s = Math.floor((diff % 60000) / 1000);
                    setCountdown(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
                } else {
                    setCountdown("00:00:00");
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [times, config.prayerOffsets]);

    // Initial load
    useEffect(() => {
        const cached = localStorage.getItem('grandPrayersCache');
        if (cached) {
            try {
                const prayerData = JSON.parse(cached);
                setTimes(prayerData.timings);
                setDates(prayerData.dates);
            } catch(e) {}
        }
        refreshLocation();
    }, [refreshLocation]);

    return (
        <PrayerTimesContext.Provider value={{ 
            times, dates, nextPrayer, countdown, config, setConfig, 
            refreshLocation, manualSearch, updateConfig 
        }}>
            {children}
        </PrayerTimesContext.Provider>
    );
};

export const usePrayerTimes = () => {
    const context = useContext(PrayerTimesContext);
    if (!context) {
        throw new Error('usePrayerTimes must be used within a PrayerTimesProvider');
    }
    return context;
};
