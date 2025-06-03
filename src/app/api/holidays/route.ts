import { NextRequest, NextResponse } from 'next/server';
import { getHolidays, addHoliday, updateHoliday, deleteHoliday } from '@/lib/holidayUtils';

// GET: 휴일 목록 조회
export async function GET() {
  try {
    const holidays = await getHolidays();
    return NextResponse.json(holidays, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Failed to get holidays:', error);
    return NextResponse.json(
      { error: '휴일 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 새로운 휴일 등록
export async function POST(request: NextRequest) {
  try {
    const holidayData = await request.json();
    const newHoliday = await addHoliday(holidayData);
    
    return NextResponse.json(newHoliday, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Failed to add holiday:', error);
    return NextResponse.json(
      { error: '휴일 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    const updatedHoliday = await updateHoliday(id, updates);
    
    if (!updatedHoliday) {
      return NextResponse.json(
        { error: '휴일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedHoliday, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Failed to update holiday:', error);
    return NextResponse.json(
      { error: '휴일 수정 중 오류가 발생했습니다.' },
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
        { error: '휴일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Failed to delete holiday:', error);
    return NextResponse.json(
      { error: '휴일 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 