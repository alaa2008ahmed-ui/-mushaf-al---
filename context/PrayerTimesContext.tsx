import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes } from 'adhan';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { prayerNamesAr } from '../data/prayerTimesData';

// --- Types ---
interface PrayerConfig {
    iqamaOffsets: Record<string, number>;
    prayerOffsets: Record<string, number>;
    tones: Record<string, { name: string; data: string; originalUrl?: string }>;
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



// --- Helper Functions ---
const applyOffset = (timeStr: string, offsetMins: number) => {
    if (!timeStr || timeStr.includes('--')) return "--:--";
    let [h, m] = timeStr.split(':');
    let date = new Date();
    date.setHours(parseInt(h), parseInt(m), 0);
    date.setMinutes(date.getMinutes() + (offsetMins || 0));
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const getCountryInfo = (countryCode: string, countryName: string, cityName: string) => {
    const code = countryCode?.toLowerCase() || '';
    
    const dialCodes: Record<string, string> = {
        'sa': '+966', 'eg': '+20', 'ae': '+971', 'kw': '+965', 'qa': '+974', 'bh': '+973', 
        'om': '+968', 'jo': '+962', 'sy': '+963', 'lb': '+961', 'ps': '+970', 'iq': '+964', 
        'ye': '+967', 'sd': '+249', 'ly': '+218', 'tn': '+216', 'dz': '+213', 'ma': '+212', 
        'mr': '+222', 'so': '+252', 'dj': '+253', 'tr': '+90', 'us': '+1', 'gb': '+44',
        'fr': '+33', 'de': '+49', 'it': '+39', 'es': '+34', 'ca': '+1', 'au': '+61'
    };

    const fullNames: Record<string, string> = {
        'sa': 'المملكة العربية السعودية', 'eg': 'جمهورية مصر العربية', 'ae': 'الإمارات العربية المتحدة',
        'kw': 'دولة الكويت', 'qa': 'دولة قطر', 'bh': 'مملكة البحرين', 'om': 'سلطنة عمان',
        'jo': 'المملكة الأردنية الهاشمية', 'sy': 'الجمهورية العربية السورية', 'lb': 'الجمهورية اللبنانية',
        'ps': 'دولة فلسطين', 'iq': 'جمهورية العراق', 'ye': 'الجمهورية اليمنية', 'sd': 'جمهورية السودان',
        'ly': 'دولة ليبيا', 'tn': 'الجمهورية التونسية', 'dz': 'الجمهورية الجزائرية الديمقراطية الشعبية',
        'ma': 'المملكة المغربية', 'mr': 'الجمهورية الإسلامية الموريتانية', 'so': 'جمهورية الصومال الفيدرالية',
        'dj': 'جمهورية جيبوتي'
    };

    const saudiCities: Record<string, string> = {
        'الرياض': '11', 'الخرج': '11', 'مكة': '12', 'مكة المكرمة': '12', 'جدة': '12', 'الطائف': '12',
        'الدمام': '13', 'الخبر': '13', 'الظهران': '13', 'الجبيل': '13', 'الأحساء': '13', 'الهفوف': '13', 'حفر الباطن': '13',
        'المدينة': '14', 'المدينة المنورة': '14', 'تبوك': '14', 'ينبع': '14', 'عرعر': '14',
        'القصيم': '16', 'بريدة': '16', 'عنيزة': '16', 'حائل': '16', 'المجمعة': '16',
        'أبها': '17', 'خميس مشيط': '17', 'نجران': '17', 'جازان': '17', 'الباحة': '17'
    };

    const egyptCities: Record<string, string> = {
        'القاهرة': '2', 'الجيزة': '2', 'الإسكندرية': '3', 'بورسعيد': '66', 'السويس': '62', 'الإسماعيلية': '64',
        'الأقصر': '95', 'أسوان': '97', 'أسيوط': '88', 'سوهاج': '93', 'المنصورة': '50', 'الدقهلية': '50',
        'الزقازيق': '55', 'الشرقية': '55', 'طنطا': '40', 'الغربية': '40', 'المنوفية': '48', 'شبين الكوم': '48',
        'البحيرة': '45', 'دمنهور': '45', 'الفيوم': '84', 'بني سويف': '82', 'المنيا': '86', 'قنا': '96',
        'دمياط': '57', 'كفر الشيخ': '47', 'البحر الأحمر': '65', 'الغردقة': '65', 'الوادي الجديد': '92',
        'مطروح': '46', 'شمال سيناء': '68', 'العريش': '68', 'جنوب سيناء': '69', 'الطور': '69', 'شرم الشيخ': '69'
    };

    let baseDialCode = dialCodes[code] || '';
    let fullName = fullNames[code] || countryName;
    let combinedCode = baseDialCode;

    if (code === 'sa') {
        for (const [key, val] of Object.entries(saudiCities)) {
            if (cityName.includes(key)) {
                combinedCode = baseDialCode + val;
                break;
            }
        }
    } else if (code === 'eg') {
        for (const [key, val] of Object.entries(egyptCities)) {
            if (cityName.includes(key)) {
                combinedCode = baseDialCode + val;
                break;
            }
        }
    }

    return { fullName, combinedCode: combinedCode || baseDialCode };
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
    const fetchByIP = useCallback(async () => {
        try {
            const res = await fetch('https://ipwho.is/');
            const data = await res.json();
            if (data && data.success) {
                const city = data.city || data.region;
                const countryInfo = getCountryInfo(data.country_code, data.country, city);
                const newLoc = {
                    lat: data.latitude,
                    lng: data.longitude,
                    cityGov: `${city} - ${data.region || ""}`,
                    fullCountry: countryInfo.fullName,
                    combinedCode: countryInfo.combinedCode
                };
                setConfig(prev => ({ ...prev, location: newLoc }));
            } else {
                throw new Error("IP fetch failed");
            }
        } catch (e) {
            console.error("Failed to fetch location by IP:", e);
            throw e;
        }
    }, []);
    
    const refreshLocation = useCallback(() => {
        return new Promise<void>((resolve, reject) => {
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
                            const countryInfo = getCountryInfo(addr.country_code, addr.country, city);
                            newLoc = {
                                ...newLoc,
                                cityGov: `${city} - ${addr.state || ""}`,
                                fullCountry: countryInfo.fullName,
                                combinedCode: countryInfo.combinedCode
                            };
                        } catch(e) {
                            newLoc.cityGov = "موقعي الحالي (بدون اتصال)";
                        }
                        setConfig(prev => ({ ...prev, location: newLoc }));
                        resolve();
                    },
                    async () => {
                        try {
                            await fetchByIP();
                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    },
                    { enableHighAccuracy: true, timeout: 6000 }
                );
            } else {
                fetchByIP().then(resolve).catch(reject);
            }
        });
    }, [fetchByIP]);

    const manualSearch = useCallback(async (query: string) => {
        if(!query) return;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&accept-language=ar&limit=1`);
            const data = await res.json();
            if(data && data.length > 0) {
                const addr = data[0].address;
                const name = addr.city || addr.town || addr.village || query;
                const province = addr.state || "";
                const countryInfo = getCountryInfo(addr.country_code, addr.country, name);
                const newLocation = {
                    cityGov: `${name} - ${province}`,
                    fullCountry: countryInfo.fullName,
                    combinedCode: countryInfo.combinedCode,
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
                    localNotifier.cancelAll(async () => {
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

                            // Use a for...of loop to handle async operations sequentially
                            for (const key of prayerKeys) {
                                if (!config.mutedPrayers[key]) {
                                    let prayerDate = dayTimings[key];
                                    // Apply offset
                                    prayerDate.setMinutes(prayerDate.getMinutes() + (config.prayerOffsets[key] || 0));

                                    // Skip if time passed
                                    if (prayerDate < new Date()) continue;

                                    const toneConfig = config.tones[key];
                                    let soundPath = "https://www.islamcan.com/audio/adhan/azan1.mp3";
                                    
                                    if (toneConfig && toneConfig.data && toneConfig.data !== 'none' && !toneConfig.data.startsWith('data:')) {
                                        soundPath = toneConfig.data;
                                    }

                                    // Fix sound path for Android (Capacitor)
                                    let androidSoundPath = soundPath;
                                    const isAndroidNative = w.cordova && (w.cordova.platformId === 'android' || (w.device && w.device.platform === 'Android') || /android/i.test(navigator.userAgent));
                                    
                                    if (isAndroidNative) {
                                        // Force bundled azans to use res:// (even if they are old file:// or http:// paths in config)
                                        if (soundPath.includes('azan') || soundPath.startsWith('/assets/audio/')) {
                                            const filename = soundPath.split('/').pop();
                                            if (filename) {
                                                const rawName = filename.toLowerCase()
                                                    .replace(/\.mp3|\.wav|\.ogg/g, '') // Remove extension
                                                    .replace(/\s+/g, '_')       // Replace spaces
                                                    .replace(/[^a-z0-9_]/g, ''); // Remove special chars
                                                
                                                // Ensure it doesn't start with a number
                                                const finalName = /^\d/.test(rawName) ? 'sound_' + rawName : rawName;
                                                
                                                androidSoundPath = `res://${finalName}`;
                                            }
                                        } else if (soundPath.startsWith('file://') || soundPath.startsWith('http')) {
                                            // It's a downloaded custom file or external URL
                                            androidSoundPath = soundPath;
                                        }
                                    }

                                    // Unique ID: day index * 10 + prayer index
                                    const id = (day * 10) + prayerKeys.indexOf(key) + 1;
                                    
                                    // Dynamic Channel ID to force sound update on Android 8+
                                    // If we use the same channel ID, Android will ignore the new sound
                                    const soundName = androidSoundPath.split('/').pop() || 'default';
                                    // Sanitize channel ID
                                    const channelId = `adhan_channel_${key}_${soundName.replace(/[^a-zA-Z0-9]/g, '_')}`;

                                    // Explicitly create the channel to ensure the custom sound is applied
                                    if (isAndroidNative && localNotifier.createChannel) {
                                        localNotifier.createChannel({
                                            androidChannelId: channelId,
                                            androidChannelName: `Adhan ${prayerNamesAr[key]}`,
                                            androidChannelDescription: `Notifications for ${prayerNamesAr[key]} prayer`,
                                            sound: androidSoundPath,
                                            androidChannelImportance: 5, // MAX importance to bypass doze
                                            androidChannelEnableVibration: true,
                                            androidChannelSoundUsage: 4 // USAGE_ALARM
                                        });
                                    }

                                    notificationsToSchedule.push({
                                        id: id,
                                        title: `حان الآن موعد أذان ${prayerNamesAr[key]}`,
                                        text: 'لا تنس ذكر الله. قال رسول الله ﷺ: "أرحنا بها يا بلال"',
                                        trigger: { at: prayerDate },
                                        foreground: true,
                                        sound: androidSoundPath,
                                        androidChannelId: channelId, // Unique channel per prayer/sound combo
                                        priority: 2, // High priority
                                        androidLockscreen: true,
                                        androidChannelEnableVibration: true,
                                        launch: true,
                                        // Explicitly define channel properties for Android 8+
                                        // The plugin will create this channel if it doesn't exist
                                        androidChannelName: `Adhan ${prayerNamesAr[key]}`,
                                        androidChannelDescription: `Notifications for ${prayerNamesAr[key]} prayer`,
                                        androidChannelImportance: 5, // MAX importance
                                        androidAllowWhileIdle: true, // Allow in doze mode
                                        androidWakeUpScreen: true, // Wake up screen
                                        androidAlarmType: 0, // RTC_WAKEUP
                                        androidChannelSoundUsage: 4, // USAGE_ALARM
                                        visibility: 1, // Public
                                        playSound: true // Explicitly enable sound
                                    });
                                }
                            }
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
        refreshLocation().catch(() => {});
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

export const copyAssetToDevice = async (assetPath: string): Promise<string> => {
    try {
        const filename = assetPath.split('/').pop()?.split('?')[0] || 'audio.mp3';
        if (!filename) return assetPath;

        const targetDirectory = Capacitor.getPlatform() === 'android' ? Directory.External : Directory.Data;

        // Check if file already exists in the target directory
        try {
            const stat = await Filesystem.stat({
                path: `sounds/${filename}`,
                directory: targetDirectory
            });
            return stat.uri;
        } catch (e) {
            // File doesn't exist, proceed to copy
        }

        if (assetPath.startsWith('http')) {
            try {
                // Use native downloadFile for much faster downloads and no CORS issues
                const downloadResult = await Filesystem.downloadFile({
                    url: assetPath,
                    path: `sounds/${filename}`,
                    directory: targetDirectory,
                    recursive: true
                });
                
                if (downloadResult.path) {
                    // Return the proper file:// URI
                    const stat = await Filesystem.stat({
                        path: `sounds/${filename}`,
                        directory: targetDirectory
                    });
                    return stat.uri;
                }
            } catch (downloadError) {
                console.warn("Native downloadFile failed (likely on web), falling back to fetch:", downloadError);
            }
        }

        // Fallback for non-http or if downloadFile fails
        let response;
        try {
            response = await fetch(assetPath);
            if (!response.ok) throw new Error("Direct fetch failed");
        } catch (e) {
            if (assetPath.startsWith('http')) {
                console.warn("Direct fetch failed, trying proxy...", e);
                // Try corsproxy.io as a reliable fallback
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(assetPath)}`;
                response = await fetch(proxyUrl);
                if (!response.ok) {
                    // Try allorigins as a second fallback
                    const proxyUrl2 = `https://api.allorigins.win/raw?url=${encodeURIComponent(assetPath)}`;
                    response = await fetch(proxyUrl2);
                    if (!response.ok) throw new Error("All proxy fetches failed");
                }
            } else {
                throw e;
            }
        }
        
        const blob = await response.blob();

        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        await Filesystem.writeFile({
            path: `sounds/${filename}`,
            data: base64Data,
            directory: targetDirectory,
            recursive: true
        });

        const uriResult = await Filesystem.getUri({
            path: `sounds/${filename}`,
            directory: targetDirectory
        });

        return uriResult.uri;
    } catch (error) {
        console.error("Error copying asset to device:", error);
        return assetPath; // Fallback to original path if copy fails
    }
};
