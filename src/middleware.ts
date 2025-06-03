import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 현재 URL 경로
  const path = request.nextUrl.pathname;

  // 관리자 쿠키 확인
  const isAuthenticated = request.cookies.has('admin');

  // 관리자 페이지 접근 시
  if (path.startsWith('/admin')) {
    // 로그인 페이지는 예외 처리
    if (path === '/admin/login') {
      // 이미 로그인된 경우 상품 관리 페이지로 리다이렉션
      if (isAuthenticated) {
        return NextResponse.redirect(new URL('/admin/products', request.url));
      }
      // 로그인되지 않은 경우 로그인 페이지 접근 허용
      return NextResponse.next();
    }

    // 로그인되지 않은 경우 로그인 페이지로 리다이렉션
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

// 미들웨어를 적용할 경로 설정
export const config = {
  matcher: '/admin/:path*'
}; 