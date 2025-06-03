import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/types/product';
import { getProducts, saveProducts } from '@/lib/productUtils';

// 상품 목록 조회
export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Failed to get products:', error);
    return NextResponse.json(
      { error: '상품 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 새 상품 추가
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const products = await getProducts();
    
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
    console.log('PATCH request data:', data);

    const products = await getProducts();
    console.log('Current products:', products);

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
    
    console.log('Updated product:', updatedProduct);

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