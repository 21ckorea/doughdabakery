import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
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

    // 파일 이름에 타임스탬프 추가하여 유니크하게 만들기
    const timestamp = Date.now();
    const originalName = file.name;
    const extension = path.extname(originalName);
    const fileName = `${timestamp}-${path.basename(originalName, extension)}${extension}`;
    
    // 파일 저장 경로 설정
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, fileName);
    
    // 파일 저장
    await writeFile(filePath, buffer);
    
    // 클라이언트에서 접근 가능한 URL 경로 반환
    const fileUrl = `/uploads/${fileName}`;
    
    return NextResponse.json({ 
      url: fileUrl,
      success: true 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
} 