import { ReactNode } from 'react';
import Link from 'next/link';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* 관리자 네비게이션 바 */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin" className="text-xl font-bold text-gray-800">
                관리자 페이지
              </Link>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/admin/holidays"
                className="text-gray-600 hover:text-gray-900"
              >
                휴일 관리
              </Link>
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900"
              >
                메인페이지
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
} 