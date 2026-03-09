const CMS_URL = 'http://127.0.0.1:3005';

export interface Product {
  id: number;
  slug: string;
  name: string;
  price: number;
  currency: string;
  collection: string;
  colors: string[];
  sizes: string[];
  in_stock: boolean;
  badge: string | null;
  images: string[];
  has360: boolean;
  description: string;
  material: string;
  care: string[];
  model_info: string;
}

export async function getAllProducts(): Promise<Product[]> {
  const res = await fetch(`${CMS_URL}/api/products`);
  if (!res.ok) throw new Error(`CMS error: ${res.status}`);
  return res.json();
}

export async function getProduct(slug: string): Promise<Product | null> {
  const res = await fetch(`${CMS_URL}/api/products/${slug}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`CMS error: ${res.status}`);
  return res.json();
}

export async function getProductsByCollection(collection: string): Promise<Product[]> {
  if (collection === 'basics') return getAllProducts();
  const res = await fetch(`${CMS_URL}/api/collections/${collection}`);
  if (!res.ok) throw new Error(`CMS error: ${res.status}`);
  return res.json();
}
