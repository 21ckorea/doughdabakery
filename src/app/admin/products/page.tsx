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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleToggleSoldOut = async (productId: string) => {
    setIsLoading(true);
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          isSoldOut: !product.isSoldOut,
        }),
      });

      if (response.ok) {
        // 서버에서 최신 데이터를 가져옵니다
        await fetchProducts();
      } else {
        console.error('Failed to update product:', await response.text());
      }
    } catch (error) {
      console.error('Failed to toggle sold out status:', error);
    } finally {
      setIsLoading(false);
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
              {product.isSoldOut && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="text-red-500 text-2xl font-bold bg-white/80 px-4 py-2 rounded-lg">품절</span>
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
            <p className="text-gray-600 mb-2">{product.description}</p>
            <p className="text-lg font-bold mb-4">{product.price.toLocaleString()}원</p>
            <button
              onClick={() => handleToggleSoldOut(product.id)}
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-lg ${
                product.isSoldOut
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {product.isSoldOut ? '판매 재개' : '품절 처리'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 