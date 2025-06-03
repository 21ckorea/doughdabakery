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
    // 정확한 파일만 조회하도록 최적화
    const { blobs } = await list({ prefix: 'products.json', limit: 1 });
    const productsBlob = blobs.find(blob => blob.pathname === 'products.json');
    
    if (productsBlob) {
      // 캐시 관련 헤더를 더 명확하게 지정
      const response = await fetch(productsBlob.url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch products blob:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        return [];
      }

      const data = await response.json();
      console.log('Fetched products from blob:', data); // 디버깅용 로그
      return data;
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
    console.log('Saving products to blob:', products); // 디버깅용 로그
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
    console.log('PATCH request data:', data); // 디버깅용 로그

    const products = await getProducts();
    console.log('Current products:', products); // 디버깅용 로그

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
    
    // 데이터 동기화를 위한 짧은 지연
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 저장 후 즉시 다시 조회하여 검증
    const updatedProducts = await getProducts();
    const updatedProduct = updatedProducts.find(p => p.id === data.id);
    
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