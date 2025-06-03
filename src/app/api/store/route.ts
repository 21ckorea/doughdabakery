import { NextRequest, NextResponse } from 'next/server';
import { getStoreHours, updateStoreHours } from '@/lib/storeUtils';

export async function GET() {
  try {
    const hours = await getStoreHours();
    return NextResponse.json(hours, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Failed to get store hours:', error);
    return NextResponse.json(
      { error: '영업 시간을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const hours = await request.json();
    await updateStoreHours(hours);
    
    return NextResponse.json({ success: true }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Failed to update store hours:', error);
    return NextResponse.json(
      { error: '영업 시간 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 