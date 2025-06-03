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

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let imageUrl = editingProduct.image;

      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      const product = {
        ...editingProduct,
        image: imageUrl
      };

      await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Failed to save product:', error);
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

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8">
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

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={editingProduct.isSoldOut}
              onChange={(e) => setEditingProduct({ ...editingProduct, isSoldOut: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">
              품절
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isUploading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? '업로드 중...' : editingProduct.id ? '수정' : '추가'}
            </button>
            {editingProduct.id && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                취소
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow p-4">
            <div className="relative h-48 w-full mb-4">
              {product.image && (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover rounded-lg"
                />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
            <p className="text-gray-600 mb-2">{product.description}</p>
            <p className="text-lg font-bold mb-2">{product.price.toLocaleString()}원</p>
            {product.isSoldOut && (
              <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm mb-2">
                품절
              </span>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(product)}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
              >
                수정
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 