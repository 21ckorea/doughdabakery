import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { promises as fs } from 'fs';
import path from 'path';
import { getProducts, saveProducts } from '@/lib/productUtils';

// 개별 상품 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Getting product with ID:', id);

    const products = await getProducts();
    const product = products.find(p => p.id === id);

    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(product, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Failed to get product:', error);
    return NextResponse.json(
      { error: '상품을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 상품 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    console.log('Updating product with ID:', id, 'Data:', data);

    const products = await getProducts();
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 메모리에서 상품 정보 업데이트
    const updatedProductInMem = {
      ...products[productIndex],
      ...data,
    };
    products[productIndex] = updatedProductInMem;

    // 변경된 전체 상품 목록 저장
    await saveProducts(products);
    
    console.log('Product saved. Returning in-memory updated product:', updatedProductInMem);

    return NextResponse.json(updatedProductInMem, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json(
      { error: '상품 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 상품 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Deleting product with ID:', id);

    const products = await getProducts();
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const productToDelete = products[productIndex];

    // 이미지 삭제 처리
    if (productToDelete.image) {
      if (process.env.VERCEL) {
        // Vercel 환경: Blob Storage에서 이미지 삭제
        try {
          if (productToDelete.image.includes('blob.vercel-storage.com')) {
            await del(productToDelete.image);
            console.log('Image deleted from Blob Storage:', productToDelete.image);
          }
        } catch (error) {
          console.error('Failed to delete image from blob storage:', error);
        }
      } else {
        // 로컬 환경: 파일 시스템에서 이미지 삭제
        if (productToDelete.image.startsWith('/uploads/')) {
          const imagePath = path.join(process.cwd(), 'public', productToDelete.image);
          try {
            await fs.unlink(imagePath);
            console.log('Local image file deleted:', imagePath);
          } catch (error) {
            console.error('Failed to delete local image file:', error);
          }
        }
      }
    }

    products.splice(productIndex, 1);
    await saveProducts(products);

    return NextResponse.json({ success: true }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json(
      { error: '상품 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 