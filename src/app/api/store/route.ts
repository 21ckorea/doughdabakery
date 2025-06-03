import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { put, list } from '@vercel/blob';

interface StoreStatus {
  isOpen: boolean;
  message: string;
}

const dataFilePath = path.join(process.cwd(), 'src/data/store.json');

// 파일 시스템에서 상태 데이터 가져오기
async function getStatusFromFile(): Promise<StoreStatus> {
  try {
    // 파일이 없으면 생성
    try {
      await fs.access(dataFilePath);
    } catch {
      const initialStatus: StoreStatus = { isOpen: true, message: '' };
      await fs.writeFile(dataFilePath, JSON.stringify(initialStatus));
      return initialStatus;
    }

    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read store status from file:', error);
    return { isOpen: true, message: '' };
  }
}

// 파일 시스템에 상태 데이터 저장
async function saveStatusToFile(status: StoreStatus) {
  try {
    // data 디렉토리가 없으면 생성
    const dataDir = path.dirname(dataFilePath);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
    
    await fs.writeFile(dataFilePath, JSON.stringify(status));
  } catch (error) {
    console.error('Failed to save store status to file:', error);
    throw error;
  }
}

// Blob Storage에서 상태 데이터 가져오기
async function getStatusFromBlob(): Promise<StoreStatus> {
  try {
    const { blobs } = await list();
    const statusBlob = blobs.find(blob => blob.pathname.endsWith('store.json'));
    
    if (statusBlob) {
      const response = await fetch(statusBlob.url);
      return await response.json();
    } else {
      const initialStatus: StoreStatus = { isOpen: true, message: '' };
      await saveStatusToBlob(initialStatus);
      return initialStatus;
    }
  } catch (error) {
    console.error('Failed to get store status from blob storage:', error);
    return { isOpen: true, message: '' };
  }
}

// Blob Storage에 상태 데이터 저장
async function saveStatusToBlob(status: StoreStatus) {
  try {
    await put('store.json', JSON.stringify(status), {
      access: 'public',
      contentType: 'application/json'
    });
  } catch (error) {
    console.error('Failed to save store status to blob storage:', error);
    throw error;
  }
}

// 환경에 따라 적절한 저장소 사용
async function getStatus(): Promise<StoreStatus> {
  if (process.env.VERCEL) {
    return getStatusFromBlob();
  } else {
    return getStatusFromFile();
  }
}

async function saveStatus(status: StoreStatus) {
  if (process.env.VERCEL) {
    await saveStatusToBlob(status);
  } else {
    await saveStatusToFile(status);
  }
}

export async function GET() {
  try {
    const status = await getStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Failed to read store status:', error);
    return NextResponse.json({ isOpen: true, message: '' });
  }
}

export async function POST(request: Request) {
  try {
    const status: StoreStatus = await request.json();
    await saveStatus(status);
    return NextResponse.json(status);
  } catch (error) {
    console.error('Failed to save store status:', error);
    return NextResponse.json(
      { error: 'Failed to save store status' },
      { status: 500 }
    );
  }
} 