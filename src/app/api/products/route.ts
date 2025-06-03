import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Product } from '@/types/product';

const dataFilePath = path.join(process.cwd(), 'src/data/products.json');

// 파일이 없으면 생성
async function ensureFile() {
  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.writeFile(dataFilePath, JSON.stringify([]));
  }
}

export async function GET() {
  try {
    await ensureFile();
    const data = await fs.readFile(dataFilePath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Failed to read products:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const product: Product = await request.json();
    await ensureFile();
    const data = await fs.readFile(dataFilePath, 'utf8');
    const products: Product[] = JSON.parse(data);
    
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
    
    await fs.writeFile(dataFilePath, JSON.stringify(products));
    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to save product:', error);
    return NextResponse.json({ error: 'Failed to save product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await ensureFile();
    const data = await fs.readFile(dataFilePath, 'utf8');
    const products: Product[] = JSON.parse(data);
    
    const filteredProducts = products.filter(product => product.id !== id);
    await fs.writeFile(dataFilePath, JSON.stringify(filteredProducts));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
} 