import { RoleDefinition, StaffMember } from '../types/staff.types';
import { StoreSettings, AuditLogEntry } from '../types/settings.types';
import { ROLE_DEFAULT_PERMISSIONS } from '../utils/permissions';
import { mockStore, simulateNetwork } from './mockApiClient';

export interface StaffService {
  listStaff(): Promise<StaffMember[]>;
  getStaffById(id: string): Promise<StaffMember>;
  createStaff(input: Omit<StaffMember, 'id' | 'employeeCode' | 'lastLogin' | 'joinedDate'>): Promise<StaffMember>;
  updateStaff(id: string, input: Partial<StaffMember>): Promise<StaffMember>;
  getRoles(): Promise<RoleDefinition[]>;
  getSettings(): Promise<StoreSettings>;
  updateSettings(input: Partial<StoreSettings>): Promise<StoreSettings>;
  listAuditLogs(params?: { search?: string; entity?: string; action?: string }): Promise<AuditLogEntry[]>;
}

class MockStaffServiceImpl implements StaffService {
  async listStaff(): Promise<StaffMember[]> {
    return simulateNetwork([...mockStore.staff]);
  }

  async getStaffById(id: string): Promise<StaffMember> {
    const s = mockStore.staff.find((item) => item.id === id);
    if (!s) throw new Error(`Staff ${id} not found`);
    return simulateNetwork(s);
  }

  async createStaff(input: Omit<StaffMember, 'id' | 'employeeCode' | 'lastLogin' | 'joinedDate'>): Promise<StaffMember> {
    const seq = mockStore.staff.length + 1;
    const employeeCode = `EMP-${String(seq).padStart(3, '0')}`;
    const newStaff: StaffMember = {
      id: `staff-${Date.now().toString().slice(-4)}`,
      employeeCode,
      ...input,
      joinedDate: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString(),
    };

    mockStore.staff.push(newStaff);
    mockStore.save('staff', mockStore.staff);
    return simulateNetwork(newStaff);
  }

  async updateStaff(id: string, input: Partial<StaffMember>): Promise<StaffMember> {
    const idx = mockStore.staff.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error(`Staff ${id} not found`);

    mockStore.staff[idx] = {
      ...mockStore.staff[idx],
      ...input,
    };
    mockStore.save('staff', mockStore.staff);
    return simulateNetwork(mockStore.staff[idx]);
  }

  async getRoles(): Promise<RoleDefinition[]> {
    const roles: RoleDefinition[] = Object.keys(ROLE_DEFAULT_PERMISSIONS).map((role) => ({
      role: role as any,
      description: `Operational profile for ${role}`,
      defaultPermissions: ROLE_DEFAULT_PERMISSIONS[role as keyof typeof ROLE_DEFAULT_PERMISSIONS],
    }));
    return simulateNetwork(roles);
  }

  async getSettings(): Promise<StoreSettings> {
    return simulateNetwork({ ...mockStore.settings });
  }

  async updateSettings(input: Partial<StoreSettings>): Promise<StoreSettings> {
    mockStore.settings = {
      ...mockStore.settings,
      ...input,
    };
    mockStore.save('settings', mockStore.settings);
    return simulateNetwork({ ...mockStore.settings });
  }

  async listAuditLogs(params = {} as { search?: string; entity?: string; action?: string }): Promise<AuditLogEntry[]> {
    let list = [...mockStore.auditLogs];

    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (l) =>
          l.summary.toLowerCase().includes(q) ||
          l.actorName.toLowerCase().includes(q) ||
          (l.entityId && l.entityId.toLowerCase().includes(q))
      );
    }

    if (params.entity && params.entity !== 'all') {
      list = list.filter((l) => l.entity === params.entity);
    }

    if (params.action && params.action !== 'all') {
      list = list.filter((l) => l.action === params.action);
    }

    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return simulateNetwork(list);
  }
}

import { apiStaffService } from './apiServices';

const isMock = (import.meta as any).env?.VITE_DATA_MODE === 'mock';
export const mockStaffService: StaffService = isMock ? new MockStaffServiceImpl() : apiStaffService;
