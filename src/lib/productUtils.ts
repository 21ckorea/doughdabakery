import redis from './redis';

const PRODUCTS_KEY = 'products';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isSoldOut?: boolean;
}

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

export async function addProduct(product: Omit<Product, 'id'>): Promise<Product> {
  try {
    const products = await getProducts();
    const newProduct: Product = {
      ...product,
      id: Date.now().toString()
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

    // 필수 필드 확인
    const currentProduct = products[index];
    const updatedProduct: Product = {
      id: currentProduct.id,                    // ID는 변경 불가
      name: updates.name || currentProduct.name, // 이름은 필수
      price: updates.price ?? currentProduct.price, // 가격은 필수 (0일 수 있으므로 nullish 연산자 사용)
      description: updates.description ?? currentProduct.description,
      image: updates.image ?? currentProduct.image,
      isSoldOut: updates.isSoldOut ?? currentProduct.isSoldOut
    };
    
    products[index] = updatedProduct;
    await redis.set(PRODUCTS_KEY, JSON.stringify(products));
    return updatedProduct;
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