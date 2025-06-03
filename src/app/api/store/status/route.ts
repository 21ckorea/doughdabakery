import { NextResponse } from 'next/server';
import { StoreStatus } from '@/types/store';

// 메모리에 상태 저장 (서버리스 환경 대응)
let storeStatus: StoreStatus = { isOpen: true };

export async function GET() {
  try {
    return NextResponse.json(storeStatus);
  } catch (error) {
    console.error('Failed to read store status:', error);
    return NextResponse.json({ isOpen: true });
  }
}

export async function POST(request: Request) {
  try {
    const newStatus: StoreStatus = await request.json();
    storeStatus = newStatus;
    return NextResponse.json(storeStatus);
  } catch (error) {
    console.error('Failed to update store status:', error);
    return NextResponse.json({ error: 'Failed to update store status' }, { status: 500 });
  }
} 