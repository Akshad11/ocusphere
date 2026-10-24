import { PaginatedResult } from '../types/common.types';
import { CreateProductInput, Product, ProductListParams, UpdateProductInput } from '../types/product.types';
import { mockStore, simulateNetwork } from './mockApiClient';

export interface ProductService {
  list(params: ProductListParams): Promise<PaginatedResult<Product>>;
  getById(id: string): Promise<Product>;
  getBySlug(slug: string): Promise<Product>;
  create(input: CreateProductInput): Promise<Product>;
  update(id: string, input: UpdateProductInput): Promise<Product>;
  delete(id: string): Promise<boolean>;
}

class MockProductServiceImpl implements ProductService {
  async list(params: ProductListParams = {}): Promise<PaginatedResult<Product>> {
    let items = [...mockStore.products];

    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.modelCode.toLowerCase().includes(q) ||
          p.variants.some((v) => v.variantSku.toLowerCase().includes(q) || v.barcode.includes(q))
      );
    }

    if (params.productType && params.productType !== 'all') {
      items = items.filter((p) => p.productType === params.productType);
    }

    if (params.category && params.category !== 'all') {
      items = items.filter((p) => p.category.toLowerCase() === params.category!.toLowerCase());
    }

    if (params.brand && params.brand !== 'all') {
      items = items.filter((p) => p.brand.toLowerCase() === params.brand!.toLowerCase());
    }

    if (params.status && params.status !== 'all') {
      items = items.filter((p) => p.status === params.status);
    }

    if (params.minPrice !== undefined) {
      items = items.filter((p) => p.basePrice >= params.minPrice!);
    }

    if (params.maxPrice !== undefined) {
      items = items.filter((p) => p.basePrice <= params.maxPrice!);
    }

    if (params.inStockOnly) {
      items = items.filter((p) => p.variants.some((v) => v.stockOnHand - v.reservedQuantity > 0));
    }

    if (params.sortBy) {
      items.sort((a, b) => {
        let valA: string | number = a.name;
        let valB: string | number = b.name;
        if (params.sortBy === 'price') {
          valA = a.basePrice;
          valB = b.basePrice;
        } else if (params.sortBy === 'createdAt') {
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
        } else if (params.sortBy === 'stock') {
          valA = a.variants.reduce((acc, v) => acc + v.stockOnHand, 0);
          valB = b.variants.reduce((acc, v) => acc + v.stockOnHand, 0);
        }
        if (params.sortOrder === 'desc') {
          return valA > valB ? -1 : 1;
        }
        return valA > valB ? 1 : -1;
      });
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 12;
    const total = items.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const start = (page - 1) * pageSize;
    const paginated = items.slice(start, start + pageSize);

    return simulateNetwork({
      items: paginated,
      total,
      page,
      pageSize,
      totalPages,
    });
  }

  async getById(id: string): Promise<Product> {
    const found = mockStore.products.find((p) => p.id === id);
    if (!found) {
      throw new Error(`Product with ID ${id} not found`);
    }
    return simulateNetwork(found);
  }

  async getBySlug(slug: string): Promise<Product> {
    const found = mockStore.products.find((p) => p.slug === slug);
    if (!found) {
      throw new Error(`Product with slug ${slug} not found`);
    }
    return simulateNetwork(found);
  }

  async create(input: CreateProductInput): Promise<Product> {
    const id = `prod-${Date.now().toString().slice(-4)}`;
    const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const variants = input.variants.map((v, idx) => ({
      ...v,
      id: `var-${id}-${idx + 1}`,
      productId: id,
      stockOnHand: v.initialStock || 10,
      reservedQuantity: 0,
    }));

    const newProduct: Product = {
      id,
      name: input.name,
      slug,
      brand: input.brand,
      category: input.category,
      productType: input.productType,
      description: input.description,
      modelCode: input.modelCode,
      basePrice: input.basePrice,
      featuredImage: input.images[0] || 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80',
      images: input.images.length > 0 ? input.images : ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80'],
      variants,
      status: input.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockStore.products.unshift(newProduct);
    mockStore.save('products', mockStore.products);

    // Add audit log
    mockStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actorName: 'Admin User',
      actorRole: 'Store Manager',
      action: 'CREATE',
      entity: 'Product',
      entityId: newProduct.id,
      summary: `Created new product ${newProduct.name} (${newProduct.modelCode})`,
      timestamp: new Date().toISOString(),
    });
    mockStore.save('auditLogs', mockStore.auditLogs);

    return simulateNetwork(newProduct);
  }

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    const idx = mockStore.products.findIndex((p) => p.id === id);
    if (idx === -1) {
      throw new Error(`Product ${id} not found`);
    }

    const current = mockStore.products[idx];
    const updated: Product = {
      ...current,
      ...input,
      updatedAt: new Date().toISOString(),
      variants: input.variants
        ? input.variants.map((v, i) => {
            const existing = current.variants.find((cv) => cv.variantSku === v.variantSku);
            return {
              ...v,
              id: existing ? existing.id : `var-${id}-${i + 1}`,
              productId: id,
              stockOnHand: existing ? existing.stockOnHand : (v.initialStock || 0),
              reservedQuantity: existing ? existing.reservedQuantity : 0,
            };
          })
        : current.variants,
    };

    mockStore.products[idx] = updated;
    mockStore.save('products', mockStore.products);

    mockStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actorName: 'Admin User',
      actorRole: 'Store Manager',
      action: 'UPDATE',
      entity: 'Product',
      entityId: updated.id,
      summary: `Updated product ${updated.name}`,
      timestamp: new Date().toISOString(),
    });
    mockStore.save('auditLogs', mockStore.auditLogs);

    return simulateNetwork(updated);
  }

  async delete(id: string): Promise<boolean> {
    const idx = mockStore.products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      const removed = mockStore.products.splice(idx, 1)[0];
      mockStore.save('products', mockStore.products);
      mockStore.auditLogs.unshift({
        id: `log-${Date.now()}`,
        actorName: 'Admin User',
        actorRole: 'Store Manager',
        action: 'DELETE',
        entity: 'Product',
        entityId: id,
        summary: `Deleted product ${removed.name}`,
        timestamp: new Date().toISOString(),
      });
      mockStore.save('auditLogs', mockStore.auditLogs);
      return simulateNetwork(true);
    }
    return simulateNetwork(false);
  }
}

import { apiProductService } from './apiServices';

const isMock = (import.meta as any).env?.VITE_DATA_MODE === 'mock';
export const mockProductService: ProductService = isMock ? new MockProductServiceImpl() : apiProductService;
