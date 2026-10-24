import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.supplier.findMany({
      orderBy: { businessName: 'asc' },
    });
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        purchaseOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found.`);
    }

    return supplier;
  }

  async create(dto: CreateSupplierDto, actorName: string = 'Staff') {
    const supplier = await this.prisma.supplier.create({
      data: dto,
    });

    await this.prisma.auditLog.create({
      data: {
        actorName,
        actorRole: 'Procurement',
        action: 'CREATE',
        entity: 'PurchaseOrder',
        entityId: supplier.id,
        summary: `Created supplier profile for ${supplier.businessName}`,
      },
    });

    return supplier;
  }

  async update(id: string, dto: UpdateSupplierDto, actorName: string = 'Staff') {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException(`Supplier ${id} not found.`);

    const updated = await this.prisma.supplier.update({
      where: { id },
      data: dto,
    });

    await this.prisma.auditLog.create({
      data: {
        actorName,
        actorRole: 'Procurement',
        action: 'UPDATE',
        entity: 'PurchaseOrder',
        entityId: id,
        summary: `Updated supplier profile for ${updated.businessName}`,
      },
    });

    return updated;
  }
}
