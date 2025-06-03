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

export default function ProductEditPage() {
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
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
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
      return data.url;
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
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
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
    <div>
      <h1 className="text-3xl font-bold mb-8">상품 등록/수정</h1>

      {/* 상품 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {products.map((product) => (
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
            <div className="flex justify-between gap-4">
              <button
                onClick={() => handleEdit(product)}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
              >
                수정
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 상품 추가/수정 폼 */}
      <form onSubmit={handleSubmit} className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">
          {editingProduct.id ? '상품 수정' : '새 상품 추가'}
        </h2>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
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
            <label className="block text-sm font-medium mb-2">
              설명
            </label>
            <textarea
              value={editingProduct.description}
              onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
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
            <label className="block text-sm font-medium mb-2">
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
              <span className="text-sm font-medium">품절</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            {editingProduct.id && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border rounded-lg hover:bg-gray-100"
              >
                취소
              </button>
            )}
            <button
              type="submit"
              disabled={isUploading}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isUploading ? '저장 중...' : editingProduct.id ? '수정' : '추가'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 