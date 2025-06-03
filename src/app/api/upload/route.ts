import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 파일 데이터를 Buffer로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 파일 이름에 타임스탬프 추가
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    
    // uploads 디렉토리 생성
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // 디렉토리가 이미 존재하면 무시
    }
    
    // 파일 저장
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    return NextResponse.json({ 
      url: `/uploads/${filename}`,
      success: true 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
} 