'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isSoldOut: boolean;
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [holidays, setHolidays] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement product addition logic
  };

  const handleToggleSoldOut = async (productId: string) => {
    // TODO: Implement sold out toggle logic
  };

  const handleAddHoliday = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedDate) {
      setHolidays([...holidays, selectedDate]);
      setSelectedDate(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">관리자 페이지</h1>

      {/* 제품 관리 섹션 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">제품 관리</h2>
        <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-1">제품명</label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">가격</label>
            <input
              type="number"
              name="price"
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">설명</label>
            <textarea
              name="description"
              required
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">이미지</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              required
              className="w-full"
            />
          </div>
          <button
            type="submit"
            className="md:col-span-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          >
            제품 추가
          </button>
        </form>

        {/* 제품 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="border rounded-lg p-4">
              <div className="relative h-48 mb-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-2">{product.description}</p>
              <p className="text-lg font-bold mb-4">{product.price.toLocaleString()}원</p>
              <button
                onClick={() => handleToggleSoldOut(product.id)}
                className={`w-full py-2 px-4 rounded-lg ${
                  product.isSoldOut
                    ? 'bg-red-500 text-white'
                    : 'bg-green-500 text-white'
                }`}
              >
                {product.isSoldOut ? '판매 재개' : '품절 처리'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 휴무일 관리 섹션 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">휴무일 관리</h2>
        <form onSubmit={handleAddHoliday} className="mb-8">
          <div className="flex gap-4">
            <input
              type="date"
              value={selectedDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="px-3 py-2 border rounded-lg"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            >
              휴무일 추가
            </button>
          </div>
        </form>

        {/* 휴무일 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {holidays.map((holiday, index) => (
            <div key={index} className="flex justify-between items-center border rounded-lg p-4">
              <span>{holiday.toLocaleDateString()}</span>
              <button
                onClick={() => setHolidays(holidays.filter((_, i) => i !== index))}
                className="text-red-500 hover:text-red-600"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
} 