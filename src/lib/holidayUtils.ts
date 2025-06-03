import redis from './redis';

const HOLIDAYS_KEY = 'holidays';

export interface Holiday {
  id: string;
  date: string;        // YYYY-MM-DD format
  name: string;
  description?: string;
  isRecurringYearly?: boolean;
}

export async function getHolidays(): Promise<Holiday[]> {
  try {
    const holidays = await redis.get(HOLIDAYS_KEY);
    return holidays ? JSON.parse(holidays) : [];
  } catch (error) {
    console.error('Failed to get holidays from Redis:', error);
    throw error;
  }
}

export async function addHoliday(holiday: Omit<Holiday, 'id'>): Promise<Holiday> {
  try {
    const holidays = await getHolidays();
    const newHoliday: Holiday = {
      ...holiday,
      id: Date.now().toString()
    };
    
    holidays.push(newHoliday);
    await redis.set(HOLIDAYS_KEY, JSON.stringify(holidays));
    
    return newHoliday;
  } catch (error) {
    console.error('Failed to add holiday to Redis:', error);
    throw error;
  }
}

export async function updateHoliday(id: string, updates: Partial<Holiday>): Promise<Holiday | null> {
  try {
    const holidays = await getHolidays();
    const index = holidays.findIndex(h => h.id === id);
    
    if (index === -1) return null;
    
    holidays[index] = {
      ...holidays[index],
      ...updates
    };
    
    await redis.set(HOLIDAYS_KEY, JSON.stringify(holidays));
    return holidays[index];
  } catch (error) {
    console.error('Failed to update holiday in Redis:', error);
    throw error;
  }
}

export async function deleteHoliday(id: string): Promise<boolean> {
  try {
    const holidays = await getHolidays();
    const index = holidays.findIndex(h => h.id === id);
    
    if (index === -1) return false;
    
    holidays.splice(index, 1);
    await redis.set(HOLIDAYS_KEY, JSON.stringify(holidays));
    
    return true;
  } catch (error) {
    console.error('Failed to delete holiday from Redis:', error);
    throw error;
  }
}

export async function isHoliday(date: string): Promise<boolean> {
  try {
    const holidays = await getHolidays();
    const [, month, day] = date.split('-');
    
    return holidays.some(holiday => {
      if (holiday.isRecurringYearly) {
        // For recurring holidays, only compare month and day
        const [, holidayMonth, holidayDay] = holiday.date.split('-');
        return holidayMonth === month && holidayDay === day;
      }
      // For non-recurring holidays, compare full date
      return holiday.date === date;
    });
  } catch (error) {
    console.error('Failed to check holiday status in Redis:', error);
    throw error;
  }
} 