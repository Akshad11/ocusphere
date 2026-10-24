import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import * as argon2 from 'argon2';
import { ROLE_DEFAULT_PERMISSIONS } from '../common/constants/permissions.constant';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        employeeCode: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        customPermissions: true,
        isActive: true,
        avatarUrl: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return users.map((u) => {
      const defaultPerms = ROLE_DEFAULT_PERMISSIONS[u.role] || [];
      const mergedPerms = Array.from(new Set([...defaultPerms, ...u.customPermissions]));
      return {
        ...u,
        permissions: mergedPerms,
      };
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        employeeCode: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        customPermissions: true,
        isActive: true,
        avatarUrl: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Staff member with ID ${id} not found.`);
    }

    const defaultPerms = ROLE_DEFAULT_PERMISSIONS[user.role] || [];
    return {
      ...user,
      permissions: Array.from(new Set([...defaultPerms, ...user.customPermissions])),
    };
  }

  async create(dto: CreateStaffDto, actorName: string = 'Admin User') {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { employeeCode: dto.employeeCode }],
      },
    });

    if (existing) {
      throw new ConflictException('Staff member with this email or employee code already exists.');
    }

    const passwordToHash = dto.password || 'OcuSphere@2026';
    const passwordHash = await argon2.hash(passwordToHash, { type: argon2.argon2id });

    const user = await this.prisma.user.create({
      data: {
        employeeCode: dto.employeeCode,
        fullName: dto.fullName,
        email: dto.email.toLowerCase().trim(),
        phone: dto.phone,
        role: dto.role,
        customPermissions: dto.customPermissions || [],
        passwordHash,
      },
      select: {
        id: true,
        employeeCode: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        customPermissions: true,
        isActive: true,
        createdAt: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorName,
        actorRole: 'Admin',
        action: 'CREATE',
        entity: 'Staff',
        entityId: user.id,
        summary: `Created staff profile for ${user.fullName} (${user.role})`,
        userId: user.id,
      },
    });

    const defaultPerms = ROLE_DEFAULT_PERMISSIONS[user.role] || [];
    return {
      ...user,
      permissions: Array.from(new Set([...defaultPerms, ...user.customPermissions])),
    };
  }

  async update(id: string, dto: UpdateStaffDto, actorName: string = 'Admin User') {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Staff member with ID ${id} not found.`);
    }

    const updateData: any = {};
    if (dto.fullName) updateData.fullName = dto.fullName;
    if (dto.phone) updateData.phone = dto.phone;
    if (dto.role) updateData.role = dto.role;
    if (dto.customPermissions) updateData.customPermissions = dto.customPermissions;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.password) {
      updateData.passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        employeeCode: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        customPermissions: true,
        isActive: true,
        updatedAt: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorName,
        actorRole: 'Admin',
        action: 'UPDATE',
        entity: 'Staff',
        entityId: updated.id,
        summary: `Updated staff profile for ${updated.fullName}`,
        userId: updated.id,
      },
    });

    const defaultPerms = ROLE_DEFAULT_PERMISSIONS[updated.role] || [];
    return {
      ...updated,
      permissions: Array.from(new Set([...defaultPerms, ...updated.customPermissions])),
    };
  }

  async remove(id: string, actorName: string = 'Admin User') {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Staff member with ID ${id} not found.`);
    }

    // Soft delete / deactivate to preserve historical sales and audit records
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    await this.prisma.auditLog.create({
      data: {
        actorName,
        actorRole: 'Admin',
        action: 'DELETE',
        entity: 'Staff',
        entityId: id,
        summary: `Deactivated staff member ${user.fullName}`,
      },
    });

    return { message: 'Staff member deactivated successfully.' };
  }
}
