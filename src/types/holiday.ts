export interface Holiday {
  id: number;
  date: string;
  reason: string;
  created_at: string;
  updated_at: string;
}

export interface HolidayInput {
  date: string;
  reason: string;
} 