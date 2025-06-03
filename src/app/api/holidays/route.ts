import { NextResponse } from 'next/server';
import { getHolidays, addHoliday, deleteHoliday } from '@/lib/fileDb';
import { HolidayInput } from '@/types/holiday';

// GET: 휴일 목록 조회
export async function GET() {
  try {
    const holidays = await getHolidays();
    return NextResponse.json(holidays);
  } catch (error) {
    console.error('Failed to fetch holidays:', error);
    return NextResponse.json(
      { error: 'Failed to fetch holidays' },
      { status: 500 }
    );
  }
}

// POST: 새로운 휴일 등록
export async function POST(request: Request) {
  try {
    const holidayInput: HolidayInput = await request.json();
    const newHoliday = await addHoliday(holidayInput);
    
    return NextResponse.json({ 
      message: 'Holiday added successfully',
      holiday: newHoliday
    });
  } catch (error) {
    console.error('Failed to add holiday:', error);
    return NextResponse.json(
      { error: 'Failed to add holiday' },
      { status: 500 }
    );
  }
}

// DELETE: 휴일 삭제
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const success = await deleteHoliday(Number(id));
    
    if (!success) {
      return NextResponse.json(
        { error: 'Holiday not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Holiday deleted successfully' 
    });
  } catch (error) {
    console.error('Failed to delete holiday:', error);
    return NextResponse.json(
      { error: 'Failed to delete holiday' },
      { status: 500 }
    );
  }
} 