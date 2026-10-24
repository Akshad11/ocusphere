import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreatePrescriptionDto } from './dto/prescription.dto';
import { userHasPermission } from '../common/constants/permissions.constant';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  private mapCustomer(c: any, includePrescriptions: boolean = false) {
    const formatted = {
      id: c.id,
      customerCode: c.customerCode,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email || '',
      phone: c.phone,
      dateOfBirth: c.dateOfBirth,
      gender: c.gender,
      address: {
        street: c.street || '',
        city: c.city || '',
        state: c.state || '',
        postalCode: c.postalCode || '',
        country: c.country || 'India',
      },
      contactPreferences: {
        sms: c.prefSms,
        whatsapp: c.prefWhatsapp,
        email: c.prefEmail,
        marketingConsent: c.prefMarketing,
      },
      totalVisits: c.totalVisits,
      totalSpent: Number(c.totalSpent),
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };

    if (includePrescriptions && c.prescriptions) {
      return {
        ...formatted,
        prescriptions: c.prescriptions.map((rx: any) => ({
          id: rx.id,
          customerId: rx.customerId,
          recordedDate: rx.recordedDate,
          optometristName: rx.optometristName,
          clinicOrBranch: rx.clinicOrBranch,
          rightEye: {
            sph: rx.rightSph,
            cyl: rx.rightCyl,
            axis: rx.rightAxis,
            add: rx.rightAdd,
          },
          leftEye: {
            sph: rx.leftSph,
            cyl: rx.leftCyl,
            axis: rx.leftAxis,
            add: rx.leftAdd,
          },
          pupillaryDistance: Number(rx.pupillaryDistance),
          nearPd: rx.nearPd ? Number(rx.nearPd) : undefined,
          lensTypeRecommended: rx.lensTypeRecommended,
          coatingRecommended: rx.coatingRecommended,
          notes: rx.notes,
        })),
      };
    }

    return formatted;
  }

  async findAll(params: { search?: string; page?: number; pageSize?: number }) {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, Math.min(100, params.pageSize || 20));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.search) {
      const q = params.search.trim();
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
        { email: { contains: q, mode: 'insensitive' } },
        { customerCode: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Explicitly exclude optical prescriptions from general customer list for privacy protection
    const [total, customers] = await Promise.all([
      this.prisma.customer.count({ where }),
      this.prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
    ]);

    const items = customers.map((c) => this.mapCustomer(c, false));

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  async findOne(id: string, user?: any) {
    const canViewPrescriptions =
      user && userHasPermission(user.role, user.customPermissions, 'view_prescriptions');

    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        prescriptions: canViewPrescriptions,
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found.`);
    }

    return this.mapCustomer(customer, canViewPrescriptions);
  }

  async create(dto: CreateCustomerDto, actorName: string = 'Staff') {
    const existing = await this.prisma.customer.findUnique({
      where: { phone: dto.phone },
    });

    if (existing) {
      throw new ConflictException(`A customer with phone number ${dto.phone} is already registered.`);
    }

    const count = await this.prisma.customer.count();
    const customerCode = `CUST-${(count + 1).toString().padStart(4, '0')}`;

    const customer = await this.prisma.customer.create({
      data: {
        customerCode,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email?.toLowerCase().trim(),
        phone: dto.phone,
        dateOfBirth: dto.dateOfBirth,
        gender: dto.gender,
        street: dto.address?.street,
        city: dto.address?.city,
        state: dto.address?.state,
        postalCode: dto.address?.postalCode,
        country: dto.address?.country || 'India',
        prefSms: dto.contactPreferences?.sms !== false,
        prefWhatsapp: dto.contactPreferences?.whatsapp !== false,
        prefEmail: dto.contactPreferences?.email === true,
        prefMarketing: dto.contactPreferences?.marketingConsent !== false,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorName,
        actorRole: 'CRM Staff',
        action: 'CREATE',
        entity: 'Customer',
        entityId: customer.id,
        summary: `Created customer profile for ${customer.firstName} ${customer.lastName} (${customer.customerCode})`,
      },
    });

    return this.mapCustomer(customer, false);
  }

  async update(id: string, dto: UpdateCustomerDto, actorName: string = 'Staff') {
    const existing = await this.prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Customer ${id} not found.`);
    }

    const updateData: any = {};
    if (dto.firstName) updateData.firstName = dto.firstName;
    if (dto.lastName) updateData.lastName = dto.lastName;
    if (dto.email !== undefined) updateData.email = dto.email ? dto.email.toLowerCase().trim() : null;
    if (dto.phone) updateData.phone = dto.phone;
    if (dto.dateOfBirth !== undefined) updateData.dateOfBirth = dto.dateOfBirth;
    if (dto.gender !== undefined) updateData.gender = dto.gender;
    if (dto.address) {
      if (dto.address.street !== undefined) updateData.street = dto.address.street;
      if (dto.address.city !== undefined) updateData.city = dto.address.city;
      if (dto.address.state !== undefined) updateData.state = dto.address.state;
      if (dto.address.postalCode !== undefined) updateData.postalCode = dto.address.postalCode;
      if (dto.address.country !== undefined) updateData.country = dto.address.country;
    }
    if (dto.contactPreferences) {
      if (dto.contactPreferences.sms !== undefined) updateData.prefSms = dto.contactPreferences.sms;
      if (dto.contactPreferences.whatsapp !== undefined) updateData.prefWhatsapp = dto.contactPreferences.whatsapp;
      if (dto.contactPreferences.email !== undefined) updateData.prefEmail = dto.contactPreferences.email;
      if (dto.contactPreferences.marketingConsent !== undefined) updateData.prefMarketing = dto.contactPreferences.marketingConsent;
    }

    const updated = await this.prisma.customer.update({
      where: { id },
      data: updateData,
    });

    await this.prisma.auditLog.create({
      data: {
        actorName,
        actorRole: 'CRM Staff',
        action: 'UPDATE',
        entity: 'Customer',
        entityId: id,
        summary: `Updated customer profile for ${updated.firstName} ${updated.lastName}`,
      },
    });

    return this.mapCustomer(updated, false);
  }

  async getCustomerSales(customerId: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new NotFoundException(`Customer ${customerId} not found.`);

    const sales = await this.prisma.sale.findMany({
      where: { customerId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return sales.map((s) => ({
      ...s,
      subtotal: Number(s.subtotal),
      discountTotal: Number(s.discountTotal),
      taxTotal: Number(s.taxTotal),
      grandTotal: Number(s.grandTotal),
      items: s.items.map((i) => ({
        ...i,
        unitPrice: Number(i.unitPrice),
        discount: Number(i.discount),
        taxableAmount: Number(i.taxableAmount),
        total: Number(i.total),
      })),
    }));
  }

  async getCustomerBookings(customerId: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new NotFoundException(`Customer ${customerId} not found.`);

    return this.prisma.booking.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addPrescription(customerId: string, dto: CreatePrescriptionDto, user: any) {
    if (!userHasPermission(user.role, user.customPermissions, 'view_prescriptions')) {
      throw new ForbiddenException('Access denied: You do not have permission to manage medical optical prescriptions.');
    }

    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new NotFoundException(`Customer ${customerId} not found.`);

    const rx = await this.prisma.opticalPrescription.create({
      data: {
        customerId,
        optometristName: dto.optometristName,
        clinicOrBranch: dto.clinicOrBranch,
        rightSph: dto.rightSph,
        rightCyl: dto.rightCyl,
        rightAxis: dto.rightAxis,
        rightAdd: dto.rightAdd,
        leftSph: dto.leftSph,
        leftCyl: dto.leftCyl,
        leftAxis: dto.leftAxis,
        leftAdd: dto.leftAdd,
        pupillaryDistance: dto.pupillaryDistance,
        nearPd: dto.nearPd,
        lensTypeRecommended: dto.lensTypeRecommended,
        coatingRecommended: dto.coatingRecommended,
        notes: dto.notes,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorName: user.fullName,
        actorRole: user.role,
        action: 'CREATE',
        entity: 'Customer',
        entityId: customerId,
        summary: `Recorded optical prescription by ${dto.optometristName} for ${customer.firstName} ${customer.lastName}`,
      },
    });

    return rx;
  }
}
