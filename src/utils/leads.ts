import {
  getAllDeliveryTasks,
  getSalesByUserId,
  mockLeads,
  mockPublicCases,
} from '../mock/data';
import type { Lead, ShareLeadPayload, User } from '../mock/data';
import { syncJson } from '../api/client';

export const LEAD_STATUS_OPTIONS = ['待联系', '已联系', '已到店', '已成交', '无效', '暂不考虑'] as const;
export type LeadStatus = typeof LEAD_STATUS_OPTIONS[number];

export type ShareLeadRecord = ShareLeadPayload & {
  id: string;
  status: LeadStatus;
  notes?: string;
  sourceChannel?: string;
  sourceEntry?: string;
  sourceUrl?: string;
  lastOperatorId?: string;
  lastOperatedAt?: string;
};

export type ManagedLead = Lead & {
  sourceChannel?: string;
  sourceEntry?: string;
  sourceUrl?: string;
  lastOperatorId?: string;
  lastOperatedAt?: string;
  isStoredLead?: boolean;
};

const SHARE_LEADS_KEY = 'sct-share-leads';

function sourceFor(caseId: string) {
  return getAllDeliveryTasks().find(t => t.id === caseId)
    || mockPublicCases.find(c => c.id === caseId);
}

function normalizeRecord(item: Partial<ShareLeadRecord>, index: number): ShareLeadRecord {
  const createdAt = item.createdAt || new Date().toISOString();
  return {
    id: item.id || `lead-${Date.parse(createdAt) || Date.now()}-${index}`,
    alias: item.alias || '客户',
    phone: item.phone || '',
    city: item.city || '',
    remark: item.remark || '',
    sourceCaseId: item.sourceCaseId || '',
    sourceStoreId: item.sourceStoreId,
    sourceStoreName: item.sourceStoreName,
    sourceSalesId: item.sourceSalesId,
    interestProduct: item.interestProduct || '',
    interestType: item.interestType || '咨询同款产品',
    sourceAction: item.sourceAction || 'consult_same_product',
    sourceChannel: item.sourceChannel || 'unknown',
    sourceEntry: item.sourceEntry || '',
    sourceUrl: item.sourceUrl || '',
    status: LEAD_STATUS_OPTIONS.includes(item.status as LeadStatus) ? item.status as LeadStatus : '待联系',
    notes: item.notes || '',
    createdAt,
    lastOperatorId: item.lastOperatorId,
    lastOperatedAt: item.lastOperatedAt,
  };
}

export function loadStoredShareLeads(): ShareLeadRecord[] {
  try {
    const raw = localStorage.getItem(SHARE_LEADS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is Partial<ShareLeadRecord> => Boolean(item) && typeof item === 'object')
      .map(normalizeRecord);
  } catch {
    return [];
  }
}

function saveStoredShareLeads(records: ShareLeadRecord[]): void {
  localStorage.setItem(SHARE_LEADS_KEY, JSON.stringify(records));
}

async function syncRemote(path: string, payload: unknown): Promise<void> {
  await syncJson(`/api${path}`, payload);
}

export function createShareLead(payload: ShareLeadPayload & Partial<ShareLeadRecord>): ShareLeadRecord {
  const record = normalizeRecord({
    ...payload,
    id: payload.id || `lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    status: payload.status || '待联系',
    createdAt: payload.createdAt || new Date().toISOString(),
  }, 0);
  const next = [record, ...loadStoredShareLeads().filter(l => l.id !== record.id)];
  saveStoredShareLeads(next);
  void syncRemote('/leads', record);
  return record;
}

export function updateStoredShareLead(
  leadId: string,
  patch: Partial<Pick<ShareLeadRecord, 'status' | 'notes'>>,
  operatorId?: string,
): ShareLeadRecord | null {
  const records = loadStoredShareLeads();
  const index = records.findIndex(l => l.id === leadId);
  if (index < 0) return null;
  const updated = {
    ...records[index],
    ...patch,
    lastOperatorId: operatorId,
    lastOperatedAt: new Date().toISOString(),
  };
  records[index] = updated;
  saveStoredShareLeads(records);
  void syncRemote(`/leads/${leadId}/follow-up`, updated);
  return updated;
}

export function toManagedLead(record: ShareLeadRecord): ManagedLead {
  const source = sourceFor(record.sourceCaseId);
  return {
    id: record.id,
    customerAlias: record.alias,
    phone: record.phone,
    city: record.city || '',
    interestedProduct: record.interestProduct,
    interestType: record.interestType,
    sourceCaseId: record.sourceCaseId,
    sourceStoreId: record.sourceStoreId || source?.storeId,
    sourceStoreName: record.sourceStoreName || source?.storeName,
    sourceSalesId: record.sourceSalesId || source?.salesId,
    remark: record.remark,
    status: record.status,
    notes: record.notes,
    createdAt: record.createdAt,
    sourceChannel: record.sourceChannel,
    sourceEntry: record.sourceEntry,
    sourceUrl: record.sourceUrl,
    lastOperatorId: record.lastOperatorId,
    lastOperatedAt: record.lastOperatedAt,
    isStoredLead: true,
  };
}

export function canViewLead(user: User | null | undefined, lead: ManagedLead): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'dealer_owner') return lead.sourceStoreId === user.storeId;
  if (user.role === 'sales') {
    const sales = getSalesByUserId(user.phone);
    return Boolean(sales && lead.sourceSalesId === sales.id);
  }
  return false;
}

export function getAllManagedLeads(user?: User | null): ManagedLead[] {
  const stored = loadStoredShareLeads().map(toManagedLead);
  const demo = mockLeads.map(l => ({ ...l, isStoredLead: false }));
  const all = [...stored, ...demo].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return user ? all.filter(lead => canViewLead(user, lead)) : all;
}

export function getLeadCountForUser(user?: User | null, status?: LeadStatus): number {
  return getAllManagedLeads(user).filter(lead => !status || lead.status === status).length;
}
