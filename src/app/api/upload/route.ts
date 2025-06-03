import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 파일 확장자 검사
    const fileExtension = path.extname(file.name).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: '지원하지 않는 파일 형식입니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '파일 크기가 너무 큽니다.' },
        { status: 400 }
      );
    }

    // Vercel 환경인지 확인
    if (process.env.VERCEL) {
      try {
        // Vercel Blob Storage 사용
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const blob = await put(file.name, buffer, {
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
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }
      
      // 파일 저장
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);
      
      return NextResponse.json({ 
        url: `/uploads/${fileName}`,
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