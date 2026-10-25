import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';

export interface TestAuthTokens {
  adminToken: string;
  managerToken: string;
  cashierToken: string;
  inventoryStaffToken: string;
  storeAssistantToken: string;
}

export class TestAppContext {
  public app: INestApplication;
  public prisma: PrismaService;
  public tokens: TestAuthTokens;

  static async create(): Promise<TestAppContext> {
    const ctx = new TestAppContext();

    process.env.NODE_ENV = 'test';
    if (!process.env.DATABASE_URL?.includes('ocusphere_optical_test')) {
      process.env.DATABASE_URL =
        'postgresql://postgres:postgres@postgres:5432/ocusphere_optical_test?schema=public';
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    ctx.app = moduleFixture.createNestApplication();
    ctx.app.use(cookieParser());
    ctx.app.setGlobalPrefix('api/v1');
    ctx.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await ctx.app.init();
    ctx.prisma = ctx.app.get<PrismaService>(PrismaService);
    ctx.tokens = await ctx.authenticateRoles();

    return ctx;
  }

  private async authenticateRoles(): Promise<TestAuthTokens> {
    const server = this.app.getHttpServer();

    const login = async (email: string): Promise<string> => {
      const res = await request(server)
        .post('/api/v1/auth/login')
        .send({ email, password: 'OcuSphere@2026' });

      if (res.status !== 200 || !res.body?.data?.accessToken) {
        throw new Error(
          `Failed to authenticate test user ${email}. Status: ${res.status}, Body: ${JSON.stringify(
            res.body,
          )}`,
        );
      }
      return res.body.data.accessToken;
    };

    const [adminToken, managerToken, cashierToken, inventoryStaffToken, storeAssistantToken] =
      await Promise.all([
        login('rajiv.singhal@ocusphere.in'),
        login('kavita.joshi@ocusphere.in'),
        login('aman.patel@ocusphere.in'),
        login('karan.sharma@ocusphere.in'),
        login('simran.walia@ocusphere.in'),
      ]);

    return {
      adminToken,
      managerToken,
      cashierToken,
      inventoryStaffToken,
      storeAssistantToken,
    };
  }

  async close() {
    if (this.app) {
      await this.app.close();
    }
  }
}
