import { mockSalesPersons, mockStores } from '../mock/data';

export interface AdvisorContact {
  displayName: string;
  wechatId: string;
  phone?: string;
  source: 'sales' | 'store' | 'hq';
}

const HQ_ADVISOR: AdvisorContact = {
  displayName: 'TEMPUR 睡眠顾问',
  wechatId: 'tempur-advisor',
  phone: '400-000-0000',
  source: 'hq',
};

const SALES_CONTACTS: Record<string, Omit<AdvisorContact, 'source'>> = {
  sales_zhang: { displayName: '专属睡眠顾问', wechatId: 'tempur-zhang', phone: '13800138001' },
  sales_li: { displayName: '专属睡眠顾问', wechatId: 'tempur-li', phone: '13800138002' },
  sales_new: { displayName: '专属睡眠顾问', wechatId: 'tempur-new', phone: '13800138003' },
};

const STORE_CONTACTS: Record<string, Omit<AdvisorContact, 'source'>> = {
  store_sz: { displayName: '门店睡眠顾问', wechatId: 'tempur-suzhou', phone: '0512-00000000' },
  store_nj: { displayName: '门店睡眠顾问', wechatId: 'tempur-nanjing', phone: '025-00000000' },
};

export function getAdvisorContact({
  salesId,
  storeId,
}: {
  salesId?: string;
  storeId?: string;
}): AdvisorContact {
  if (salesId && SALES_CONTACTS[salesId]) {
    return { ...SALES_CONTACTS[salesId], source: 'sales' };
  }

  const sales = salesId ? mockSalesPersons.find(s => s.id === salesId) : undefined;
  const resolvedStoreId = storeId || sales?.storeId;
  if (resolvedStoreId && STORE_CONTACTS[resolvedStoreId]) {
    return { ...STORE_CONTACTS[resolvedStoreId], source: 'store' };
  }

  const store = resolvedStoreId ? mockStores.find(s => s.id === resolvedStoreId) : undefined;
  if (store) {
    return { displayName: '门店睡眠顾问', wechatId: HQ_ADVISOR.wechatId, phone: HQ_ADVISOR.phone, source: 'store' };
  }

  return HQ_ADVISOR;
}
