import type { DeliveryTask } from '../mock/data';
import { apiFetch } from './client';

export async function fetchCaseById(caseId: string): Promise<DeliveryTask | null> {
  if (!caseId) return null;
  try {
    const result = await apiFetch<{ case: DeliveryTask }>(`/api/cases/${encodeURIComponent(caseId)}`);
    return result.case;
  } catch {
    return null;
  }
}
