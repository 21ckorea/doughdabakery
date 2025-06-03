'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menus = [
    { name: '상품 관리', path: '/admin/products' },
    { name: '상품 등록/수정', path: '/admin/products/edit' },
    { name: '영업 상태 관리', path: '/admin/store' },
    { name: '휴일 관리', path: '/admin/holidays' },
  ];

  return (
    <div>
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {menus.map((menu) => (
              <Link
                key={menu.path}
                href={menu.path}
                className={`py-4 px-1 border-b-2 ${
                  pathname === menu.path
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                {menu.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
} 