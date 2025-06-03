import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { promises as fs } from 'fs';
import path from 'path';
import { getProduct, updateProduct, deleteProduct } from '@/lib/productUtils';

// 개별 상품 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Getting product with ID:', id);

    const product = await getProduct(id);

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

    const updatedProduct = await updateProduct(id, data);

    if (!updatedProduct) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProduct, {
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

    const product = await getProduct(id);
    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미지 삭제 처리
    if (product.image) {
      if (process.env.VERCEL) {
        // Vercel 환경: Blob Storage에서 이미지 삭제
        try {
          if (product.image.includes('blob.vercel-storage.com')) {
            await del(product.image);
            console.log('Image deleted from Blob Storage:', product.image);
          }
        } catch (error) {
          console.error('Failed to delete image from blob storage:', error);
        }
      } else {
        // 로컬 환경: 파일 시스템에서 이미지 삭제
        if (product.image.startsWith('/uploads/')) {
          const imagePath = path.join(process.cwd(), 'public', product.image);
          try {
            await fs.unlink(imagePath);
            console.log('Local image file deleted:', imagePath);
          } catch (error) {
            console.error('Failed to delete local image file:', error);
          }
        }
      }
    }

    const success = await deleteProduct(id);
    if (!success) {
      return NextResponse.json(
        { error: '상품 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

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