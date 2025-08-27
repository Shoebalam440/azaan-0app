import { create } from 'zustand';
import { prayerService } from '@/lib/prayer-service';

export interface PrayerTimes {
  id: string;
  date: string;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  masjid_name: string;
  updated_at: number;
}

interface PrayerStore {
  currentPrayerTimes: PrayerTimes | null;
  loading: boolean;
  error: string | null;
  fetchPrayerTimes: (date: string) => Promise<void>;
  getCurrentPrayer: () => { name: string; time: string; next: { name: string; time: string } } | null;
  getTimeUntilNext: () => string;
}

const PRAYER_NAMES = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
const PRAYER_DISPLAY_NAMES = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr', 
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha'
};

export const usePrayerStore = create<PrayerStore>((set, get) => ({
  currentPrayerTimes: null,
  loading: false,
  error: null,

  fetchPrayerTimes: async (date: string) => {
    set({ loading: true, error: null });
    
    try {
      const result = await prayerService.getItems('ewa3uqhxhfy8', {
        query: { date: date },
        limit: 1
      });

      if (result.items && result.items.length > 0) {
        const prayerData = result.items[0];
        set({
          currentPrayerTimes: {
            id: prayerData._id,
            date: prayerData.date,
            fajr: prayerData.fajr,
            dhuhr: prayerData.dhuhr,
            asr: prayerData.asr,
            maghrib: prayerData.maghrib,
            isha: prayerData.isha,
            masjid_name: prayerData.masjid_name || 'Local Masjid',
            updated_at: prayerData.updated_at
          },
          loading: false
        });
      } else {
        set({
          currentPrayerTimes: null,
          loading: false,
          error: 'No prayer times found for this date'
        });
      }
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      set({
        currentPrayerTimes: null,
        loading: false,
        error: 'Failed to load prayer times'
      });
    }
  },

  getCurrentPrayer: () => {
    const { currentPrayerTimes } = get();
    if (!currentPrayerTimes) return null;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const prayers = PRAYER_NAMES.map(name => ({
      name: PRAYER_DISPLAY_NAMES[name],
      time: currentPrayerTimes[name],
      minutes: timeToMinutes(currentPrayerTimes[name])
    })).sort((a, b) => a.minutes - b.minutes);

    let currentPrayer = prayers[prayers.length - 1]; // Default to last prayer (Isha)
    let nextPrayer = prayers[0]; // Default to first prayer (Fajr) next day

    for (let i = 0; i < prayers.length; i++) {
      if (currentTime < prayers[i].minutes) {
        nextPrayer = prayers[i];
        if (i > 0) {
          currentPrayer = prayers[i - 1];
        }
        break;
      }
    }

    return {
      name: currentPrayer.name,
      time: currentPrayer.time,
      next: {
        name: nextPrayer.name,
        time: nextPrayer.time
      }
    };
  },

  getTimeUntilNext: () => {
    const currentPrayerInfo = get().getCurrentPrayer();
    if (!currentPrayerInfo) return '';

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const nextPrayerMinutes = timeToMinutes(currentPrayerInfo.next.time);
    
    let minutesUntil = nextPrayerMinutes - currentTime;
    
    // If next prayer is tomorrow (e.g., Fajr)
    if (minutesUntil <= 0) {
      minutesUntil += 24 * 60; // Add 24 hours in minutes
    }

    const hours = Math.floor(minutesUntil / 60);
    const minutes = minutesUntil % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}));

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}