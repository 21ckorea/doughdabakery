import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // admin 경로에 대해서만 처리
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 로그인 페이지는 제외
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    const authToken = request.cookies.get('admin_token');
    
    // 인증 토큰이 없으면 로그인 페이지로 리다이렉트
    if (!authToken?.value) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
} 