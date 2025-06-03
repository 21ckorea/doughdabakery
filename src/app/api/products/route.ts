import { NextResponse } from 'next/server';
import { Product } from '@/types/product';

// 메모리에 상품 목록 저장
let products: Product[] = [];

export async function GET() {
  try {
    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to read products:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const product: Product = await request.json();
    
    // id가 없으면 새로운 id 생성
    if (!product.id) {
      product.id = Date.now().toString();
    }
    
    // 기존 상품이면 업데이트, 아니면 추가
    const index = products.findIndex(p => p.id === product.id);
    if (index !== -1) {
      products[index] = product;
    } else {
      products.push(product);
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to save product:', error);
    return NextResponse.json({ error: 'Failed to save product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    products = products.filter(product => product.id !== id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
} 