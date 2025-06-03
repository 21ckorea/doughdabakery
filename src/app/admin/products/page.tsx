'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isSoldOut: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleToggleSoldOut = async (productId: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isSoldOut: !product.isSoldOut,
        }),
      });

      if (response.ok) {
        await fetchProducts(); // 목록 새로고침
      }
    } catch (error) {
      console.error('Failed to toggle sold out status:', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">상품 관리</h1>

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
    </div>
  );
} 