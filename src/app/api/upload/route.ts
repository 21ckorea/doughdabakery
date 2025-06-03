import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
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

    // Vercel 환경인지 확인
    if (process.env.VERCEL) {
      try {
        // Vercel Blob Storage 사용
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const blob = await put(filename, buffer, {
          access: 'public',
          contentType: file.type
        });

        console.log('Blob upload success:', blob);

        return NextResponse.json({ 
          url: blob.url,
          success: true 
        });
      } catch (error) {
        console.error('Blob upload error:', error);
        throw error;
      }
    } else {
      // 로컬 환경에서는 파일 시스템 사용
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // uploads 디렉토리 생성
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch {
        // 디렉토리가 이미 존재하면 무시
      }
      
      // 파일 저장
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);
      
      return NextResponse.json({ 
        url: `/uploads/${filename}`,
        success: true 
      });
    }
  } catch (err) {
    console.error('Error uploading file:', err);
    return NextResponse.json({ 
      error: 'Failed to upload file',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
} 