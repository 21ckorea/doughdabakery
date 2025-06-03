import { Product } from '@/types/product';
import redis from './redis';

const PRODUCTS_KEY = 'products';

export async function getProducts(): Promise<Product[]> {
  try {
    const productsJson = await redis.get(PRODUCTS_KEY);
    return productsJson ? JSON.parse(productsJson) : [];
  } catch (error) {
    console.error('Failed to get products from Redis:', error);
    return [];
  }
}

export async function saveProducts(products: Product[]): Promise<void> {
  try {
    await redis.set(PRODUCTS_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('Failed to save products to Redis:', error);
    throw error;
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const products = await getProducts();
    return products.find(p => p.id === id) || null;
  } catch (error) {
    console.error('Failed to get product from Redis:', error);
    return null;
  }
}

export async function addProduct(product: Product): Promise<Product> {
  try {
    const products = await getProducts();
    const newProduct = {
      ...product,
      id: Date.now().toString(), // 새 ID 생성
    };
    products.push(newProduct);
    await saveProducts(products);
    return newProduct;
  } catch (error) {
    console.error('Failed to add product to Redis:', error);
    throw error;
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  try {
    const productsJson = await redis.get(PRODUCTS_KEY);
    const products: Product[] = productsJson ? JSON.parse(productsJson) : [];
    const index = products.findIndex((p: Product) => p.id === id);
    
    if (index === -1) return null;
    
    // 기존 제품 정보를 유지하면서 업데이트
    products[index] = {
      ...products[index],  // 기존 제품 정보 유지
      ...updates,         // 새로운 정보로 업데이트
      id                  // 원래 ID 유지
    };
    
    await redis.set(PRODUCTS_KEY, JSON.stringify(products));
    return products[index];
  } catch (error) {
    console.error('Failed to update product in Redis:', error);
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const products = await getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return false;

    products.splice(index, 1);
    await saveProducts(products);
    return true;
  } catch (error) {
    console.error('Failed to delete product from Redis:', error);
    throw error;
  }
} 