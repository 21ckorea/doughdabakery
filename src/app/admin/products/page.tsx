'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import Image from 'next/image';

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product>({
    id: '',
    name: '',
    description: '',
    price: 0,
    image: '',
    isSoldOut: false
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // 이미지 선택 시 미리보기 URL 생성
    if (selectedImage) {
      const url = URL.createObjectURL(selectedImage);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedImage]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      
      // Vercel 환경에서는 전체 URL이, 로컬에서는 상대 경로가 반환됨
      if (data.url.startsWith('http')) {
        return data.url;
      } else {
        // 로컬 환경에서는 상대 경로를 전체 URL로 변환
        return window.location.origin + data.url;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('이미지 업로드에 실패했습니다.');
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let imageUrl = editingProduct.image;

      // 새 이미지가 선택된 경우에만 업로드
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      } else if (!imageUrl) {
        // 이미지가 선택되지 않았고, 기존 이미지도 없는 경우
        alert('이미지를 선택해주세요.');
        setIsUploading(false);
        return;
      }

      const product = {
        ...editingProduct,
        image: imageUrl
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        throw new Error('Failed to save product');
      }

      await fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('상품 저장에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch('/api/products', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    if (product.image) {
      setPreviewUrl(product.image);
    }
  };

  const resetForm = () => {
    setEditingProduct({
      id: '',
      name: '',
      description: '',
      price: 0,
      image: '',
      isSoldOut: false
    });
    setSelectedImage(null);
    setPreviewUrl('');
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">상품 관리</h1>

      {/* 상품 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow p-4">
            <div className="relative h-48 w-full mb-4">
              <Image
                src={product.image || '/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <h3 className="font-bold mb-2">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{product.description}</p>
            <p className="font-bold mb-4">{product.price.toLocaleString()}원</p>
            <div className="flex justify-between">
              <button
                onClick={() => handleEdit(product)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                수정
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 상품 추가/수정 폼 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-6">
          {editingProduct.id ? '상품 수정' : '새 상품 추가'}
        </h2>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상품명
            </label>
            <input
              type="text"
              value={editingProduct.name}
              onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={editingProduct.description}
              onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              가격
            </label>
            <input
              type="number"
              value={editingProduct.price}
              onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이미지
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full mb-2"
            />
            {previewUrl && (
              <div className="relative h-48 w-full mb-2">
                <Image
                  src={previewUrl}
                  alt="미리보기"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={editingProduct.isSoldOut}
                onChange={(e) => setEditingProduct({ ...editingProduct, isSoldOut: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">품절</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            {editingProduct.id && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
              >
                취소
              </button>
            )}
            <button
              type="submit"
              disabled={isUploading}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {isUploading ? '저장 중...' : editingProduct.id ? '수정' : '추가'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 