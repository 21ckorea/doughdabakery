import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/types/product';
import { put, list, del } from '@vercel/blob';
import { promises as fs } from 'fs';
import path from 'path';
import { getProducts, saveProducts } from '../route';

const dataFilePath = path.join(process.cwd(), 'src/data/products.json');

// 파일 시스템에서 상품 데이터 가져오기
async function getProductsFromFile(): Promise<Product[]> {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read products from file:', error);
    return [];
  }
}

// 파일 시스템에 상품 데이터 저장
async function saveProductsToFile(products: Product[]) {
  try {
    await fs.writeFile(dataFilePath, JSON.stringify(products));
  } catch (error) {
    console.error('Failed to save products to file:', error);
    throw error;
  }
}

// Blob Storage에서 상품 데이터 가져오기
async function getProductsFromBlob(): Promise<Product[]> {
  try {
    const { blobs } = await list();
    const productsBlob = blobs.find(blob => blob.pathname.endsWith('products.json'));
    
    if (productsBlob) {
      const response = await fetch(productsBlob.url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('Failed to get products from blob storage:', error);
    return [];
  }
}

// Blob Storage에 상품 데이터 저장
async function saveProductsToBlob(products: Product[]) {
  try {
    await put('products.json', JSON.stringify(products), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      cacheControlMaxAge: 0
    });
  } catch (error) {
    console.error('Failed to save products to blob storage:', error);
    throw error;
  }
}

// 환경에 따라 적절한 저장소 사용
async function getProducts(): Promise<Product[]> {
  if (process.env.VERCEL) {
    return getProductsFromBlob();
  } else {
    return getProductsFromFile();
  }
}

async function saveProducts(products: Product[]) {
  if (process.env.VERCEL) {
    await saveProductsToBlob(products);
  } else {
    await saveProductsToFile(products);
  }
}

interface RouteContext {
  params: {
    id: string;
  };
}

// 개별 상품 조회
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = context.params;
    console.log('Getting product with ID:', id); // 디버깅용 로그

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
  context: RouteContext
) {
  try {
    const { id } = context.params;
    const data = await request.json();
    console.log('Updating product with ID:', id, 'Data:', data); // 디버깅용 로그

    const products = await getProducts();
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    products[productIndex] = {
      ...products[productIndex],
      ...data,
    };

    await saveProducts(products);
    
    // 데이터 동기화를 위한 짧은 지연
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 저장 후 즉시 다시 조회하여 검증
    const updatedProducts = await getProducts();
    const updatedProduct = updatedProducts.find(p => p.id === id);
    
    console.log('Updated product:', updatedProduct); // 디버깅용 로그

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
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = context.params;
    console.log('Deleting product with ID:', id); // 디버깅용 로그

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json(
      { error: '상품 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 