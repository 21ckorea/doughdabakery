import { NextRequest, NextResponse } from 'next/server';
import { getStoreStatus, updateStoreStatus } from '@/lib/storeUtils';

export async function GET() {
  try {
    const status = await getStoreStatus();
    return NextResponse.json(status, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Failed to get store status:', error);
    return NextResponse.json(
      { error: '매장 상태를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const status = await request.json();
    await updateStoreStatus(status);
    
    return NextResponse.json({ success: true }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Failed to update store status:', error);
    return NextResponse.json(
      { error: '매장 상태 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 