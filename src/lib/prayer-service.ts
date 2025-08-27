// Local prayer times service to replace Devv AI table operations
// This provides CRUD functionality using localStorage

export interface PrayerTime {
  _id?: string;
  _uid?: string;
  date: string;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  masjid_name: string;
  updated_at: number;
}

interface TableResponse {
  items: PrayerTime[];
  total: number;
}

class PrayerService {
  private readonly STORAGE_KEY = 'azaan_prayer_times';

  private getPrayerTimes(): Map<string, PrayerTime> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        return new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn('Failed to load prayer times storage:', error);
    }
    return new Map();
  }

  private savePrayerTimes(prayerTimes: Map<string, PrayerTime>): void {
    try {
      const data = Object.fromEntries(prayerTimes);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save prayer times storage:', error);
    }
  }

  async getItems(tableId: string, options: { query?: { date?: string }; limit?: number }): Promise<TableResponse> {
    console.log(`🔍 Getting prayer times for date: ${options.query?.date}`);
    
    const prayerTimes = this.getPrayerTimes();
    const date = options.query?.date;
    
    if (date) {
      const item = prayerTimes.get(date);
      if (item) {
        console.log(`✅ Found prayer times for ${date}:`, item);
        return {
          items: [item],
          total: 1
        };
      } else {
        console.log(`❌ No prayer times found for ${date}`);
        return {
          items: [],
          total: 0
        };
      }
    }
    
    // Return all items if no date specified
    const allItems = Array.from(prayerTimes.values());
    console.log(`📊 All prayer times:`, allItems);
    return {
      items: allItems,
      total: allItems.length
    };
  }

  async addItem(tableId: string, data: PrayerTime): Promise<void> {
    console.log(`➕ Adding prayer times for ${data.date}:`, data);
    
    const prayerTimes = this.getPrayerTimes();
    const newId = `prayer_${Date.now()}`;
    
    const newPrayerTime: PrayerTime = {
      ...data,
      _id: newId,
      _uid: newId,
      updated_at: Date.now()
    };
    
    prayerTimes.set(data.date, newPrayerTime);
    this.savePrayerTimes(prayerTimes);
    
    console.log(`✅ Prayer times added successfully for ${data.date}`);
  }

  async updateItem(tableId: string, data: PrayerTime): Promise<void> {
    console.log(`🔄 Updating prayer times for ${data.date}:`, data);
    
    const prayerTimes = this.getPrayerTimes();
    
    if (!prayerTimes.has(data.date)) {
      throw new Error(`No prayer times found for date: ${data.date}`);
    }
    
    const updatedPrayerTime: PrayerTime = {
      ...data,
      updated_at: Date.now()
    };
    
    prayerTimes.set(data.date, updatedPrayerTime);
    this.savePrayerTimes(prayerTimes);
    
    console.log(`✅ Prayer times updated successfully for ${data.date}`);
  }

  async deleteItem(tableId: string, data: { _uid: string; _id: string }): Promise<void> {
    console.log(`🗑️ Deleting prayer times with ID: ${data._id}`);
    
    const prayerTimes = this.getPrayerTimes();
    
    // Find the item by ID and remove it
    for (const [date, item] of prayerTimes.entries()) {
      if (item._id === data._id) {
        prayerTimes.delete(date);
        this.savePrayerTimes(prayerTimes);
        console.log(`✅ Prayer times deleted successfully for ${date}`);
        return;
      }
    }
    
    throw new Error(`No prayer times found with ID: ${data._id}`);
  }
}

export const prayerService = new PrayerService();
