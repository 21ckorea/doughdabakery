import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 파일 이름에 타임스탬프 추가
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    
    // Vercel Blob에 업로드
    const blob = await put(filename, file, {
      access: 'public',
    });
    
    return NextResponse.json({ 
      url: blob.url,
      success: true 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
} 