import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { PublicationStatus, ProductType, StockMovementType } from '@prisma/client';
import { userHasPermission } from '../common/constants/permissions.constant';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private sanitizeVariants(variants: any[], canViewCost: boolean) {
    return variants.map((v) => {
      const { costPrice, ...safeVariant } = v;
      return canViewCost
        ? { ...v, sellingPrice: Number(v.sellingPrice), costPrice: Number(v.costPrice) }
        : { ...safeVariant, sellingPrice: Number(v.sellingPrice) };
    });
  }

  async list(query: ProductQueryDto, user?: any) {
    const page = Math.max(1, query.page || 1);
    const pageSize = Math.max(1, Math.min(100, query.pageSize || 12));
    const skip = (page - 1) * pageSize;

    const canViewCost =
      user && userHasPermission(user.role, user.customPermissions, 'view_cost_price');

    const where: any = {};

    // For public requests, only return published products by default unless staff explicitly requests
    if (query.status && query.status !== 'all') {
      where.status = query.status as PublicationStatus;
    } else if (!user) {
      where.status = PublicationStatus.published;
    }

    if (query.productType && query.productType !== 'all') {
      where.productType = query.productType as ProductType;
    }

    if (query.category && query.category !== 'all') {
      where.category = { equals: query.category, mode: 'insensitive' };
    }

    if (query.brand && query.brand !== 'all') {
      where.brand = { equals: query.brand, mode: 'insensitive' };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.basePrice = {};
      if (query.minPrice !== undefined) where.basePrice.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.basePrice.lte = query.maxPrice;
    }

    if (query.search) {
      const q = query.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { modelCode: { contains: q, mode: 'insensitive' } },
        { variants: { some: { variantSku: { contains: q, mode: 'insensitive' } } } },
        { variants: { some: { barcode: { contains: q } } } },
      ];
    }

    if (query.inStockOnly) {
      where.variants = {
        some: {
          stockOnHand: { gt: 0 },
        },
      };
    }

    const orderBy: any = {};
    if (query.sortBy === 'price') {
      orderBy.basePrice = query.sortOrder || 'asc';
    } else if (query.sortBy === 'name') {
      orderBy.name = query.sortOrder || 'asc';
    } else {
      orderBy.createdAt = query.sortOrder || 'desc';
    }

    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: { variants: true },
        orderBy,
        skip,
        take: pageSize,
      }),
    ]);

    const items = products.map((p) => ({
      ...p,
      basePrice: Number(p.basePrice),
      variants: this.sanitizeVariants(p.variants, canViewCost),
    }));

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  async getById(id: string, user?: any) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }

    const canViewCost =
      user && userHasPermission(user.role, user.customPermissions, 'view_cost_price');

    return {
      ...product,
      basePrice: Number(product.basePrice),
      variants: this.sanitizeVariants(product.variants, canViewCost),
    };
  }

  async getBySlug(slug: string, user?: any) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { variants: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found.`);
    }

    const canViewCost =
      user && userHasPermission(user.role, user.customPermissions, 'view_cost_price');

    return {
      ...product,
      basePrice: Number(product.basePrice),
      variants: this.sanitizeVariants(product.variants, canViewCost),
    };
  }

  async create(dto: CreateProductDto, actorName: string = 'Staff') {
    let slug = this.slugify(dto.name);
    const existingSlug = await this.prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    if (!dto.variants || dto.variants.length === 0) {
      throw new BadRequestException('A product must contain at least one variant.');
    }

    // Verify SKU uniqueness
    const skus = dto.variants.map((v) => v.variantSku);
    const existingSkus = await this.prisma.productVariant.findMany({
      where: { variantSku: { in: skus } },
    });
    if (existingSkus.length > 0) {
      throw new ConflictException(
        `Variant SKU already exists: ${existingSkus.map((s) => s.variantSku).join(', ')}`,
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: dto.name,
          slug,
          brand: dto.brand,
          category: dto.category,
          productType: dto.productType,
          description: dto.description,
          modelCode: dto.modelCode,
          basePrice: dto.basePrice,
          featuredImage: dto.featuredImage || (dto.images && dto.images[0]) || '',
          images: dto.images || [],
          status: dto.status || PublicationStatus.published,
        },
      });

      for (const v of dto.variants) {
        const initialStock = v.initialStock || 0;
        const createdVariant = await tx.productVariant.create({
          data: {
            productId: product.id,
            variantSku: v.variantSku,
            barcode: v.barcode,
            colorName: v.colorName,
            colorHex: v.colorHex,
            size: v.size,
            material: v.material,
            sellingPrice: v.sellingPrice,
            costPrice: v.costPrice,
            stockOnHand: initialStock,
            reorderLevel: v.reorderLevel || 5,
            images: v.images || [],
            isAvailable: true,
          },
        });

        if (initialStock > 0) {
          await tx.stockMovement.create({
            data: {
              variantId: createdVariant.id,
              variantSku: createdVariant.variantSku,
              productName: product.name,
              movementType: StockMovementType.adjustment_in,
              quantityDelta: initialStock,
              previousStock: 0,
              newStock: initialStock,
              referenceType: 'adjustment',
              referenceId: `init-${Date.now()}`,
              reason: 'Initial stock intake upon catalogue creation',
              performedBy: actorName,
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          actorName,
          actorRole: 'Catalogue Manager',
          action: 'CREATE',
          entity: 'Product',
          entityId: product.id,
          summary: `Created new product ${product.name} (${dto.variants.length} variants)`,
        },
      });

      return tx.product.findUnique({
        where: { id: product.id },
        include: { variants: true },
      });
    });

    return {
      ...result,
      basePrice: Number(result.basePrice),
      variants: this.sanitizeVariants(result.variants, true),
    };
  }

  async update(id: string, dto: UpdateProductDto, actorName: string = 'Staff') {
    const existing = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!existing) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updateData: any = {};
      if (dto.name) updateData.name = dto.name;
      if (dto.brand) updateData.brand = dto.brand;
      if (dto.category) updateData.category = dto.category;
      if (dto.productType) updateData.productType = dto.productType;
      if (dto.description) updateData.description = dto.description;
      if (dto.modelCode) updateData.modelCode = dto.modelCode;
      if (dto.basePrice !== undefined) updateData.basePrice = dto.basePrice;
      if (dto.status) updateData.status = dto.status;
      if (dto.featuredImage) updateData.featuredImage = dto.featuredImage;
      if (dto.images) updateData.images = dto.images;

      await tx.product.update({
        where: { id },
        data: updateData,
      });

      if (dto.variants && dto.variants.length > 0) {
        for (const v of dto.variants) {
          if (v.id) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                sellingPrice: v.sellingPrice,
                costPrice: v.costPrice,
                reorderLevel: v.reorderLevel,
                colorName: v.colorName,
                colorHex: v.colorHex,
                size: v.size,
                material: v.material,
              },
            });
          } else {
            await tx.productVariant.create({
              data: {
                productId: id,
                variantSku: v.variantSku,
                barcode: v.barcode,
                colorName: v.colorName,
                colorHex: v.colorHex,
                size: v.size,
                material: v.material,
                sellingPrice: v.sellingPrice,
                costPrice: v.costPrice,
                stockOnHand: v.initialStock || 0,
                reorderLevel: v.reorderLevel || 5,
                images: v.images || [],
                isAvailable: true,
              },
            });
          }
        }
      }

      await tx.auditLog.create({
        data: {
          actorName,
          actorRole: 'Catalogue Manager',
          action: 'UPDATE',
          entity: 'Product',
          entityId: id,
          summary: `Updated product ${existing.name}`,
        },
      });

      return tx.product.findUnique({
        where: { id },
        include: { variants: true },
      });
    });

    return {
      ...result,
      basePrice: Number(result.basePrice),
      variants: this.sanitizeVariants(result.variants, true),
    };
  }

  async delete(id: string, actorName: string = 'Staff') {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }

    // Check if variants have historical sale items
    const variantIds = product.variants.map((v) => v.id);
    const [saleItemsCount, movementCount, poItemsCount] = await Promise.all([
      this.prisma.saleItem.count({ where: { variantId: { in: variantIds } } }),
      this.prisma.stockMovement.count({ where: { variantId: { in: variantIds } } }),
      this.prisma.purchaseOrderItem.count({ where: { variantId: { in: variantIds } } }),
    ]);

    if (saleItemsCount > 0 || movementCount > 0 || poItemsCount > 0) {
      // Soft-archive to preserve fiscal and audit integrity
      await this.prisma.product.update({
        where: { id },
        data: { status: PublicationStatus.archived },
      });

      await this.prisma.auditLog.create({
        data: {
          actorName,
          actorRole: 'Catalogue Manager',
          action: 'UPDATE',
          entity: 'Product',
          entityId: id,
          summary: `Archived product ${product.name} (preserved historical stock ledger and records)`,
        },
      });

      return { message: 'Product archived because historical stock ledger or transactions exist.' };
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.productVariant.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
    });

    await this.prisma.auditLog.create({
      data: {
        actorName,
        actorRole: 'Catalogue Manager',
        action: 'DELETE',
        entity: 'Product',
        entityId: id,
        summary: `Deleted product ${product.name}`,
      },
    });

    return { message: 'Product deleted successfully.' };
  }
}
