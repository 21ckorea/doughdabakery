import redis from './redis';

const STORE_KEY = 'store_status';
const STORE_HOURS_KEY = 'store_hours';

export interface StoreStatus {
  isOpen: boolean;
  message?: string;
  lastUpdated: string;
}

export interface StoreHours {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  openTime: string;  // HH:mm format
  closeTime: string; // HH:mm format
  isOpen: boolean;
}

export async function getStoreStatus(): Promise<StoreStatus> {
  try {
    const status = await redis.get(STORE_KEY);
    return status ? JSON.parse(status) : {
      isOpen: false,
      message: '영업 준비중입니다.',
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to get store status from Redis:', error);
    throw error;
  }
}

export async function updateStoreStatus(status: StoreStatus): Promise<void> {
  try {
    await redis.set(STORE_KEY, JSON.stringify({
      ...status,
      lastUpdated: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Failed to update store status in Redis:', error);
    throw error;
  }
}

export async function getStoreHours(): Promise<StoreHours[]> {
  try {
    const hours = await redis.get(STORE_HOURS_KEY);
    return hours ? JSON.parse(hours) : [];
  } catch (error) {
    console.error('Failed to get store hours from Redis:', error);
    throw error;
  }
}

export async function updateStoreHours(hours: StoreHours[]): Promise<void> {
  try {
    await redis.set(STORE_HOURS_KEY, JSON.stringify(hours));
  } catch (error) {
    console.error('Failed to update store hours in Redis:', error);
    throw error;
  }
} 