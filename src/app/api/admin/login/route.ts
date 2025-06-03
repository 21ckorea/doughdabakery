import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // 환경 변수에서 설정한 비밀번호와 비교
    if (password === process.env.ADMIN_PASSWORD) {
      // 관리자 토큰 생성
      const token = crypto.randomBytes(32).toString('hex');
      
      // 쿠키 만료일을 7일 후로 설정
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);

      // Response 객체 생성
      const response = NextResponse.json({ success: true });

      // 쿠키 설정
      response.cookies.set({
        name: 'admin_token',
        value: token,
        expires: expiryDate,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      return response;
    }

    return NextResponse.json(
      { error: '비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 