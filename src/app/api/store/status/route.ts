import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { StoreStatus } from '@/types/store';

const dataFilePath = path.join(process.cwd(), 'src/data/store.json');

// 파일이 없으면 생성
async function ensureFile() {
  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.writeFile(dataFilePath, JSON.stringify({ isOpen: true }));
  }
}

export async function GET() {
  try {
    await ensureFile();
    const data = await fs.readFile(dataFilePath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Failed to read store status:', error);
    return NextResponse.json({ isOpen: true });
  }
}

export async function POST(request: Request) {
  try {
    const status: StoreStatus = await request.json();
    await fs.writeFile(dataFilePath, JSON.stringify(status));
    return NextResponse.json(status);
  } catch (error) {
    console.error('Failed to update store status:', error);
    return NextResponse.json({ error: 'Failed to update store status' }, { status: 500 });
  }
} 