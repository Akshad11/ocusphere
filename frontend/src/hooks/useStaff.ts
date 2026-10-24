import { useState, useEffect, useCallback } from 'react';
import { RoleDefinition, StaffMember } from '../types/staff.types';
import { StoreSettings, AuditLogEntry } from '../types/settings.types';
import { mockStaffService } from '../services/mockStaffService';
import { mockStore } from '../services/mockApiClient';

export function useStaff(auditParams?: { search?: string; entity?: string; action?: string }) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStaffData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [sList, rList, stg, logs] = await Promise.all([
        mockStaffService.listStaff(),
        mockStaffService.getRoles(),
        mockStaffService.getSettings(),
        mockStaffService.listAuditLogs(auditParams),
      ]);
      setStaff(sList);
      setRoles(rList);
      setSettings(stg);
      setAuditLogs(logs);
    } catch (err: any) {
      setError(err?.message || 'Failed to load staff data');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(auditParams)]);

  useEffect(() => {
    fetchStaffData();
    const unsubscribe = mockStore.subscribe(() => {
      fetchStaffData();
    });
    return unsubscribe;
  }, [fetchStaffData]);

  const createStaff = async (input: Omit<StaffMember, 'id' | 'employeeCode' | 'lastLogin' | 'joinedDate'>) => {
    return await mockStaffService.createStaff(input);
  };

  const updateStaff = async (id: string, input: Partial<StaffMember>) => {
    return await mockStaffService.updateStaff(id, input);
  };

  const updateSettings = async (input: Partial<StoreSettings>) => {
    return await mockStaffService.updateSettings(input);
  };

  return {
    staff,
    roles,
    settings,
    auditLogs,
    loading,
    error,
    refresh: fetchStaffData,
    createStaff,
    updateStaff,
    updateSettings,
  };
}
