import { useEffect } from 'react';
import { KeepAwake } from '@capacitor-community/keep-awake';

export const useKeepAwake = () => {
    useEffect(() => {
        let wakeLock: any = null;

        const requestWakeLock = async () => {
            // 1. Try Capacitor KeepAwake (for APK)
            try {
                await KeepAwake.keepAwake();
            } catch (e) {
                // Not in Capacitor or failed
            }

            // 2. Try Web Screen Wake Lock API (Fallback/Web)
            if ('wakeLock' in navigator) {
                try {
                    wakeLock = await (navigator as any).wakeLock.request('screen');
                } catch (err) {
                    console.warn('Wake Lock request failed:', err);
                }
            }
        };

        requestWakeLock();

        // Re-request wake lock when page becomes visible again
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            KeepAwake.allowSleep().catch(() => {});
            if (wakeLock) {
                wakeLock.release().catch(() => {});
            }
        };
    }, []);
};
