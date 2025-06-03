import { NextRequest, NextResponse } from 'next/server';
import { StoreStatus } from '@/types/store';

// 메모리에 상태 저장 (서버리스 환경 대응)
let storeStatus: StoreStatus = { isOpen: true };

export async function GET() {
  try {
    return NextResponse.json(storeStatus);
  } catch (error) {
    console.error('Failed to get store status:', error);
    return NextResponse.json(
      { error: '영업 상태를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    storeStatus = { ...storeStatus, ...data };
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update store status:', error);
    return NextResponse.json(
      { error: '영업 상태 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 