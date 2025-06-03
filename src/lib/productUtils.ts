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
    await fs.writeFile(dataFilePath, JSON.stringify(products, null, 2));
  } catch (error) {
    console.error('Failed to save products to file:', error);
    throw error;
  }
}

// Blob Storage에서 상품 데이터 가져오기
async function getProductsFromBlob(): Promise<Product[]> {
  try {
    // 특정 파일만 조회하도록 최적화
    const { blobs } = await list({ prefix: 'products.json', limit: 1 });
    const productsBlob = blobs.find(blob => blob.pathname === 'products.json');
    
    if (productsBlob) {
      // 캐시를 우회하기 위해 타임스탬프 추가
      const timestamp = Date.now();
      const url = `${productsBlob.url}?t=${timestamp}`;
      console.log('Fetching products from blob URL:', url);

      const response = await fetch(url, {
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
      console.log('Successfully fetched products from blob:', data);
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
    console.log('Saving products to blob:', products);
    
    // 타임스탬프 기록 (로깅용)
    const timestamp = Date.now();
    console.log('Saving products with timestamp:', timestamp);

    await put('products.json', JSON.stringify(products, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      cacheControlMaxAge: 0
    });

    console.log('Successfully saved products to blob at:', new Date(timestamp).toISOString());
  } catch (error) {
    console.error('Failed to save products to blob storage:', error);
    throw error;
  }
}

// 환경에 따라 적절한 저장소 사용
export async function getProducts(): Promise<Product[]> {
  if (process.env.VERCEL) {
    return getProductsFromBlob();
  } else {
    return getProductsFromFile();
  }
}

export async function saveProducts(products: Product[]) {
  if (process.env.VERCEL) {
    await saveProductsToBlob(products);
  } else {
    await saveProductsToFile(products);
  }
} 