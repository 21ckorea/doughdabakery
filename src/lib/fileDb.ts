import fs from 'fs/promises';
import path from 'path';
import { Holiday, HolidayInput } from '@/types/holiday';

interface DbData {
  holidays: Holiday[];
}

const DB_PATH = path.join(process.cwd(), 'src/data/holidays.json');

// 데이터 읽기
async function readDb(): Promise<DbData> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data) as DbData;
  } catch {
    // 파일이 없는 경우 기본 구조 반환
    return { holidays: [] };
  }
}

// 데이터 쓰기
async function writeDb(data: DbData): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// 휴일 목록 조회
export async function getHolidays(): Promise<Holiday[]> {
  const db = await readDb();
  return db.holidays;
}

// 휴일 추가
export async function addHoliday(holidayInput: HolidayInput): Promise<Holiday> {
  const db = await readDb();
  const newHoliday: Holiday = {
    id: Date.now(), // timestamp를 id로 사용
    date: holidayInput.date,
    reason: holidayInput.reason,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  db.holidays.push(newHoliday);
  await writeDb(db);
  return newHoliday;
}

// 휴일 삭제
export async function deleteHoliday(id: number): Promise<boolean> {
  const db = await readDb();
  const initialLength = db.holidays.length;
  db.holidays = db.holidays.filter((holiday: Holiday) => holiday.id !== id);
  
  if (db.holidays.length === initialLength) {
    return false;
  }
  
  await writeDb(db);
  return true;
} 