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
      const response = await fetch(productsBlob.url);
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
      contentType: 'application/json'
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

type Params = { id: string };

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const products = await getProducts();
    const product = products.find(p => p.id === params.id);

    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to get product:', error);
    return NextResponse.json(
      { error: '상품 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const products = await getProducts();
    const productIndex = products.findIndex(p => p.id === params.id);

    if (productIndex === -1) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const data = await request.json();
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const products = await getProducts();
    const productIndex = products.findIndex(p => p.id === params.id);

    if (productIndex === -1) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미지 파일이 있다면 삭제
    const product = products[productIndex];
    if (product.image && product.image.startsWith('/uploads/')) {
      const imagePath = path.join(process.cwd(), 'public', product.image);
      try {
        await fs.unlink(imagePath);
      } catch (error) {
        console.error('Failed to delete image file:', error);
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