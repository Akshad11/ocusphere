import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: { entity?: string; action?: string }) {
    const where: any = {};
    if (params?.entity && params.entity !== 'all') where.entity = params.entity;
    if (params?.action && params.action !== 'all') where.action = params.action;

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }
}
