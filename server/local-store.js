import fs from 'node:fs';
import path from 'node:path';
import { deliveryTasks, materials, products, stores, users } from './seed-data.js';

const filePath = path.resolve(process.cwd(), 'tmp', 'pilot-local-store.json');

function publicUser(user) {
  return {
    phone: user.phone,
    name: user.name,
    role: user.role,
    storeName: stores.find(store => store.id === user.storeId)?.name || user.storeName || '',
    storeId: user.storeId || '',
    city: user.city || '',
    team: user.team || '',
  };
}

function initialState() {
  return {
    stores,
    users,
    products,
    materials,
    deliveryTasks,
    cases: deliveryTasks,
    leads: [],
    pointRecords: [],
    dealReports: [],
  };
}

function ensureState() {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(initialState(), null, 2));
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveState(state) {
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
}

function scoped(items, user) {
  if (!user || user.role === 'admin') return items;
  return items.filter(item => !item.storeId || item.storeId === user.storeId || item.sourceStoreId === user.storeId);
}

export function registerLocalStoreRoutes(app, upload) {
  const sessions = new Map();

  function auth(req, res, next) {
    const header = req.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    const user = sessions.get(token);
    if (!user) return res.status(401).json({ error: 'UNAUTHORIZED' });
    req.localUser = user;
    next();
  }

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'store-content-treasure-api', store: 'local-json' });
  });

  app.post('/api/auth/login', (req, res) => {
    const state = ensureState();
    const { phone, password } = req.body || {};
    const user = state.users.find(item => item.phone === String(phone || '').trim() && item.password === String(password || ''));
    if (!user) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    const token = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessions.set(token, user);
    res.json({ token, user: publicUser(user) });
  });

  app.get('/api/auth/me', auth, (req, res) => {
    res.json({ user: publicUser(req.localUser) });
  });

  app.get('/api/bootstrap', auth, (req, res) => {
    const state = ensureState();
    res.json({
      deliveryTasks: scoped(state.deliveryTasks, req.localUser),
      leads: scoped(state.leads, req.localUser),
      dealReports: scoped(state.dealReports, req.localUser),
      products: state.products,
      materials: state.materials,
      pointRecords: scoped(state.pointRecords, req.localUser),
    });
  });

  app.get('/api/stores', auth, (req, res) => {
    if (req.localUser.role !== 'admin') return res.status(403).json({ error: 'FORBIDDEN' });
    res.json({ stores: ensureState().stores });
  });

  app.get('/api/products', auth, (_req, res) => res.json({ products: ensureState().products }));
  app.get('/api/products/:id', auth, (req, res) => {
    const product = ensureState().products.find(item => item.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'NOT_FOUND' });
    res.json({ product });
  });

  app.post('/api/products', auth, (req, res) => {
    if (req.localUser.role !== 'admin') return res.status(403).json({ error: 'FORBIDDEN' });
    const state = ensureState();
    const product = { ...(req.body || {}), id: req.body?.id || `product-${Date.now()}` };
    state.products = [product, ...state.products.filter(item => item.id !== product.id)];
    saveState(state);
    res.status(201).json({ product });
  });

  app.put('/api/products/:id', auth, (req, res) => {
    if (req.localUser.role !== 'admin') return res.status(403).json({ error: 'FORBIDDEN' });
    const state = ensureState();
    const product = { ...(req.body || {}), id: req.params.id };
    state.products = [product, ...state.products.filter(item => item.id !== product.id)];
    saveState(state);
    res.json({ product });
  });

  app.delete('/api/products/:id', auth, (req, res) => {
    if (req.localUser.role !== 'admin') return res.status(403).json({ error: 'FORBIDDEN' });
    const state = ensureState();
    state.products = state.products.filter(item => item.id !== req.params.id);
    saveState(state);
    res.status(204).end();
  });

  app.get('/api/materials', auth, (_req, res) => res.json({ materials: ensureState().materials }));
  app.get('/api/materials/:id', auth, (req, res) => {
    const material = ensureState().materials.find(item => item.id === req.params.id);
    if (!material) return res.status(404).json({ error: 'NOT_FOUND' });
    res.json({ material });
  });

  app.get('/api/delivery-tasks', auth, (req, res) => {
    res.json({ deliveryTasks: scoped(ensureState().deliveryTasks, req.localUser) });
  });

  app.post('/api/delivery-tasks', auth, (req, res) => {
    const state = ensureState();
    const deliveryTask = {
      ...(req.body || {}),
      id: req.body?.id || `delivery-${Date.now()}`,
      storeId: req.body?.storeId || req.localUser.storeId,
      storeName: req.body?.storeName || publicUser(req.localUser).storeName,
      createdAt: req.body?.createdAt || new Date().toISOString(),
    };
    state.deliveryTasks = [deliveryTask, ...state.deliveryTasks.filter(item => item.id !== deliveryTask.id)];
    saveState(state);
    res.status(201).json({ deliveryTask });
  });

  app.put('/api/delivery-tasks/:id', auth, (req, res) => {
    const state = ensureState();
    const existing = state.deliveryTasks.find(item => item.id === req.params.id);
    if (!existing) return res.status(404).json({ error: 'NOT_FOUND' });
    if (req.localUser.role !== 'admin' && existing.storeId !== req.localUser.storeId) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    const deliveryTask = { ...existing, ...(req.body || {}), id: req.params.id };
    state.deliveryTasks = [deliveryTask, ...state.deliveryTasks.filter(item => item.id !== deliveryTask.id)];
    saveState(state);
    res.json({ deliveryTask });
  });

  app.put('/api/delivery-tasks/:id/review', auth, (req, res) => {
    if (req.localUser.role !== 'admin') return res.status(403).json({ error: 'FORBIDDEN' });
    const state = ensureState();
    const existing = state.deliveryTasks.find(item => item.id === req.params.id);
    if (!existing) return res.status(404).json({ error: 'NOT_FOUND' });
    const deliveryTask = { ...existing, reviewStatus: req.body?.reviewStatus || 'approved', reviewNote: req.body?.reviewNote || '' };
    state.deliveryTasks = [deliveryTask, ...state.deliveryTasks.filter(item => item.id !== deliveryTask.id)];
    state.cases = [deliveryTask, ...state.cases.filter(item => item.id !== deliveryTask.id)];
    saveState(state);
    res.json({ deliveryTask });
  });

  app.get('/api/cases', (_req, res) => res.json({ cases: ensureState().cases }));
  app.get('/api/cases/:id', (req, res) => {
    const state = ensureState();
    const item = state.cases.find(caseItem => caseItem.id === req.params.id)
      || state.deliveryTasks.find(task => task.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'NOT_FOUND' });
    res.json({ case: item });
  });
  app.get('/api/cases/share/:id', (req, res) => {
    const state = ensureState();
    const item = state.cases.find(caseItem => caseItem.id === req.params.id)
      || state.deliveryTasks.find(task => task.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'NOT_FOUND' });
    res.json({ case: item });
  });

  app.post('/api/leads', (req, res) => {
    const state = ensureState();
    const lead = { ...(req.body || {}), id: req.body?.id || `lead-${Date.now()}`, createdAt: req.body?.createdAt || new Date().toISOString() };
    state.leads = [lead, ...state.leads.filter(item => item.id !== lead.id)];
    saveState(state);
    res.status(201).json({ lead });
  });
  app.get('/api/leads', auth, (req, res) => res.json({ leads: scoped(ensureState().leads, req.localUser) }));
  app.post('/api/leads/:id/follow-up', auth, (req, res) => {
    const state = ensureState();
    const existing = state.leads.find(item => item.id === req.params.id);
    if (!existing) return res.status(404).json({ error: 'NOT_FOUND' });
    const lead = { ...existing, ...(req.body || {}), id: req.params.id };
    state.leads = [lead, ...state.leads.filter(item => item.id !== lead.id)];
    saveState(state);
    res.json({ lead });
  });

  app.get('/api/points', auth, (req, res) => res.json({ pointRecords: scoped(ensureState().pointRecords, req.localUser) }));
  app.get('/api/points/rank', auth, (_req, res) => res.json({ rank: [] }));
  app.get('/api/deal-reports', auth, (req, res) => res.json({ dealReports: scoped(ensureState().dealReports, req.localUser) }));
  app.post('/api/deal-reports', auth, (req, res) => {
    const state = ensureState();
    const dealReport = { ...(req.body || {}), id: req.body?.id || `deal-${Date.now()}`, storeId: req.body?.storeId || req.localUser.storeId, status: req.body?.status || 'pending' };
    state.dealReports = [dealReport, ...state.dealReports.filter(item => item.id !== dealReport.id)];
    saveState(state);
    res.status(201).json({ dealReport });
  });
  app.put('/api/deal-reports/:id/review', auth, (req, res) => {
    if (req.localUser.role !== 'admin') return res.status(403).json({ error: 'FORBIDDEN' });
    const state = ensureState();
    const existing = state.dealReports.find(item => item.id === req.params.id);
    if (!existing) return res.status(404).json({ error: 'NOT_FOUND' });
    const dealReport = { ...existing, status: req.body?.status || 'approved' };
    state.dealReports = [dealReport, ...state.dealReports.filter(item => item.id !== dealReport.id)];
    saveState(state);
    res.json({ dealReport });
  });

  app.post('/api/upload', auth, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'FILE_REQUIRED' });
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
}
