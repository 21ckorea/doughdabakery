import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "도우다 베이커리 - 건강한 천연발효종 빵",
  description: "매일 신선한 천연발효종으로 만드는 건강한 빵, 도우다 베이커리입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="scroll-smooth">
      <body className={inter.className}>
        <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 shadow-sm">
          <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" className="text-xl font-bold">도우다 베이커리</a>
            <div className="flex gap-6">
              <a href="/#products" className="hover:text-gray-600 transition-colors">메뉴</a>
              <a href="/#calendar" className="hover:text-gray-600 transition-colors">영업일정</a>
              <a href="/#contact" className="hover:text-gray-600 transition-colors">오시는 길</a>
            </div>
          </nav>
        </header>
        <div className="pt-16">
        {children}
        </div>
        <footer className="bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
            <p>&copy; 2024 도우다 베이커리. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
