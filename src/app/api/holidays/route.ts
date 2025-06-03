import { NextRequest, NextResponse } from 'next/server';
import { getHolidays, addHoliday, deleteHoliday } from '@/lib/fileDb';
import { HolidayInput } from '@/types/holiday';

// GET: 휴일 목록 조회
export async function GET() {
  try {
    const holidays = await getHolidays();
    return NextResponse.json(holidays);
  } catch (error) {
    console.error('Failed to get holidays:', error);
    return NextResponse.json(
      { error: '휴무일 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 새로운 휴일 등록
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const newHoliday = await addHoliday(data);
    return NextResponse.json(newHoliday);
  } catch (error) {
    console.error('Failed to create holiday:', error);
    return NextResponse.json(
      { error: '휴무일 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 휴일 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const success = await deleteHoliday(id);

    if (!success) {
      return NextResponse.json(
        { error: '휴무일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete holiday:', error);
    return NextResponse.json(
      { error: '휴무일 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 