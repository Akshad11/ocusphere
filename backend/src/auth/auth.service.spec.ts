import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwt: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
      },
    };

    jwt = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.validateUser('unknown@ocusphere.in', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'inactive@ocusphere.in',
        isActive: false,
      });
      await expect(service.validateUser('inactive@ocusphere.in', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should validate user with valid Argon2 password and return safe object', async () => {
      const password = 'SecretPassword123';
      const hash = await argon2.hash(password, { type: argon2.argon2id });

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        fullName: 'Rajiv Singhal',
        email: 'rajiv.singhal@ocusphere.in',
        passwordHash: hash,
        isActive: true,
        role: 'OWNER_ADMIN',
      });

      const user = await service.validateUser('rajiv.singhal@ocusphere.in', password);
      expect(user).toBeDefined();
      expect(user.email).toBe('rajiv.singhal@ocusphere.in');
      expect((user as any).passwordHash).toBeUndefined();
    });
  });

  describe('login', () => {
    it('should issue JWT access token on successful authentication', async () => {
      const password = 'SecretPassword123';
      const hash = await argon2.hash(password, { type: argon2.argon2id });

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        fullName: 'Rajiv Singhal',
        email: 'rajiv.singhal@ocusphere.in',
        employeeCode: 'EMP-001',
        passwordHash: hash,
        isActive: true,
        role: 'OWNER_ADMIN',
      });

      prisma.user.update.mockResolvedValue({});

      const result = await service.login({
        email: 'rajiv.singhal@ocusphere.in',
        password,
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('rajiv.singhal@ocusphere.in');
    });
  });
});
