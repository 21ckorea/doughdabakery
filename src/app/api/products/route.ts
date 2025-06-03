import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/types/product';
import { put, list } from '@vercel/blob';
import { promises as fs } from 'fs';
import path from 'path';

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
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
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

export async function GET() {
  try {
    const products = await getProducts();
    const headers = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    };
    return NextResponse.json(products, { headers });
  } catch (error) {
    console.error('Failed to get products:', error);
    return NextResponse.json(
      { error: '상품 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const products = await getProducts();
    
    // 새 상품 추가
    const newProduct: Product = {
      ...data,
      id: Date.now().toString(),
    };

    products.push(newProduct);
    await saveProducts(products);

    return NextResponse.json(newProduct);
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json(
      { error: '상품 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const products = await getProducts();
    const productIndex = products.findIndex(p => p.id === data.id);

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
    return NextResponse.json(products[productIndex]);
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json(
      { error: '상품 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const products = await getProducts();
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
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