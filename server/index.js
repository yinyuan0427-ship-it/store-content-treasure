import express from 'express';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createToken, loadUser, publicUser, requireAuth, requireRole, verifyPassword } from './auth.js';
import { query } from './db.js';
import { registerLocalStoreRoutes } from './local-store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const uploadDir = process.env.UPLOAD_DIR || path.join(rootDir, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const safeExt = path.extname(file.originalname).toLowerCase().replace(/[^.\w]/g, '') || '.jpg';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${safeExt}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

if (process.env.LOCAL_STORE === '1') {
  registerLocalStoreRoutes(app, upload);
}

function asyncRoute(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function roleStoreFilter(user, alias = '') {
  const prefix = alias ? `${alias}.` : '';
  if (user.role === 'admin') return { where: 'true', params: [] };
  return { where: `${prefix}store_id = $1`, params: [user.store_id] };
}

function rowPayload(row) {
  return row.payload || {};
}

async function listJsonTable(table, user, options = {}) {
  const { where, params } = options.publicOnly ? { where: 'true', params: [] } : roleStoreFilter(user);
  const result = await query(`select payload from ${table} where ${where} order by created_at desc`, params);
  return result.rows.map(rowPayload);
}

async function upsertPayload(table, id, payload, extra = {}) {
  if (table === 'leads') {
    await query(
      `insert into leads (id, case_id, store_id, sales_id, status, payload)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (id) do update set status = excluded.status, payload = excluded.payload, updated_at = now()`,
      [id, payload.sourceCaseId || null, payload.sourceStoreId || extra.storeId || null, payload.sourceSalesId || null, payload.status || '待联系', payload],
    );
    return;
  }
  if (table === 'delivery_tasks') {
    await query(
      `insert into delivery_tasks (id, store_id, sales_id, installer_id, review_status, payload)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (id) do update set review_status = excluded.review_status, payload = excluded.payload, updated_at = now()`,
      [id, payload.storeId || extra.storeId || null, payload.salesId || null, payload.installerId || null, payload.reviewStatus || 'draft', payload],
    );
    return;
  }
  if (table === 'deal_reports') {
    await query(
      `insert into deal_reports (id, store_id, sales_id, status, payload)
       values ($1, $2, $3, $4, $5)
       on conflict (id) do update set status = excluded.status, payload = excluded.payload, updated_at = now()`,
      [id, payload.storeId || extra.storeId || null, payload.salesId || null, payload.status || 'pending', payload],
    );
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'store-content-treasure-api' });
});

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const { phone, password } = req.body || {};
  const user = await loadUser(String(phone || '').trim());
  if (!user || !verifyPassword(String(password || ''), user.password_hash)) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
  }
  res.json({ token: createToken(user), user: publicUser(user) });
}));

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.get('/api/bootstrap', requireAuth, asyncRoute(async (req, res) => {
  const [deliveryTasks, leads, dealReports, products, materials, pointRecords] = await Promise.all([
    listJsonTable('delivery_tasks', req.user),
    listJsonTable('leads', req.user),
    listJsonTable('deal_reports', req.user),
    listJsonTable('products', req.user, { publicOnly: true }),
    listJsonTable('materials', req.user, { publicOnly: true }),
    listJsonTable('point_records', req.user),
  ]);
  res.json({ deliveryTasks, leads, dealReports, products, materials, pointRecords });
}));

app.get('/api/stores', requireAuth, requireRole('admin'), asyncRoute(async (_req, res) => {
  const result = await query('select id, name, city, active from stores order by city, name');
  res.json({ stores: result.rows });
}));

app.get('/api/products', requireAuth, asyncRoute(async (req, res) => {
  res.json({ products: await listJsonTable('products', req.user, { publicOnly: true }) });
}));

app.get('/api/products/:id', requireAuth, asyncRoute(async (req, res) => {
  const result = await query('select payload from products where id = $1', [req.params.id]);
  if (!result.rowCount) return res.status(404).json({ error: 'NOT_FOUND' });
  res.json({ product: result.rows[0].payload });
}));

app.post('/api/products', requireAuth, requireRole('admin'), asyncRoute(async (req, res) => {
  const payload = req.body || {};
  const id = payload.id || `product-${Date.now()}`;
  await query(
    `insert into products (id, store_id, payload)
     values ($1, $2, $3)
     on conflict (id) do update set payload = excluded.payload, updated_at = now()`,
    [id, payload.storeId || null, { ...payload, id }],
  );
  res.status(201).json({ product: { ...payload, id } });
}));

app.put('/api/products/:id', requireAuth, requireRole('admin'), asyncRoute(async (req, res) => {
  const payload = { ...(req.body || {}), id: req.params.id };
  await query('update products set payload = $2, updated_at = now() where id = $1', [req.params.id, payload]);
  res.json({ product: payload });
}));

app.delete('/api/products/:id', requireAuth, requireRole('admin'), asyncRoute(async (req, res) => {
  await query('delete from products where id = $1', [req.params.id]);
  res.status(204).end();
}));

app.get('/api/materials', requireAuth, asyncRoute(async (req, res) => {
  res.json({ materials: await listJsonTable('materials', req.user, { publicOnly: true }) });
}));

app.get('/api/materials/:id', requireAuth, asyncRoute(async (req, res) => {
  const result = await query('select payload from materials where id = $1', [req.params.id]);
  if (!result.rowCount) return res.status(404).json({ error: 'NOT_FOUND' });
  res.json({ material: result.rows[0].payload });
}));

app.get('/api/delivery-tasks', requireAuth, asyncRoute(async (req, res) => {
  res.json({ deliveryTasks: await listJsonTable('delivery_tasks', req.user) });
}));

app.post('/api/delivery-tasks', requireAuth, asyncRoute(async (req, res) => {
  const payload = { ...(req.body || {}) };
  payload.id ||= `delivery-${Date.now()}`;
  payload.storeId ||= req.user.store_id;
  payload.storeName ||= req.user.store_name;
  await upsertPayload('delivery_tasks', payload.id, payload, { storeId: req.user.store_id });
  res.status(201).json({ deliveryTask: payload });
}));

app.put('/api/delivery-tasks/:id', requireAuth, asyncRoute(async (req, res) => {
  const existing = await query('select payload, store_id from delivery_tasks where id = $1', [req.params.id]);
  if (!existing.rowCount) return res.status(404).json({ error: 'NOT_FOUND' });
  if (req.user.role !== 'admin' && existing.rows[0].store_id !== req.user.store_id) {
    return res.status(403).json({ error: 'FORBIDDEN' });
  }
  const payload = { ...existing.rows[0].payload, ...(req.body || {}), id: req.params.id };
  await upsertPayload('delivery_tasks', req.params.id, payload, { storeId: existing.rows[0].store_id });
  res.json({ deliveryTask: payload });
}));

app.put('/api/delivery-tasks/:id/review', requireAuth, requireRole('admin'), asyncRoute(async (req, res) => {
  const existing = await query('select payload, store_id from delivery_tasks where id = $1', [req.params.id]);
  if (!existing.rowCount) return res.status(404).json({ error: 'NOT_FOUND' });
  const payload = { ...existing.rows[0].payload, reviewStatus: req.body.reviewStatus || 'approved', reviewNote: req.body.reviewNote || '' };
  await upsertPayload('delivery_tasks', req.params.id, payload, { storeId: existing.rows[0].store_id });
  res.json({ deliveryTask: payload });
}));

app.get('/api/cases', asyncRoute(async (_req, res) => {
  const result = await query(`select payload from cases where visibility = 'public' order by created_at desc`);
  res.json({ cases: result.rows.map(rowPayload) });
}));

app.get('/api/cases/:id', asyncRoute(async (req, res) => {
  const result = await query(
    `select payload from cases where id = $1 and visibility = 'public'
     union all
     select payload from delivery_tasks where id = $1
     limit 1`,
    [req.params.id],
  );
  if (!result.rowCount) return res.status(404).json({ error: 'NOT_FOUND' });
  res.json({ case: result.rows[0].payload });
}));

app.get('/api/cases/share/:id', asyncRoute(async (req, res) => {
  const result = await query(
    `select payload from cases where id = $1 and visibility = 'public'
     union all
     select payload from delivery_tasks where id = $1
     limit 1`,
    [req.params.id],
  );
  if (!result.rowCount) return res.status(404).json({ error: 'NOT_FOUND' });
  res.json({ case: result.rows[0].payload });
}));

app.post('/api/leads', asyncRoute(async (req, res) => {
  const payload = { ...(req.body || {}) };
  payload.id ||= `lead-${Date.now()}`;
  payload.createdAt ||= new Date().toISOString();
  await upsertPayload('leads', payload.id, payload);
  res.status(201).json({ lead: payload });
}));

app.get('/api/leads', requireAuth, asyncRoute(async (req, res) => {
  res.json({ leads: await listJsonTable('leads', req.user) });
}));

app.post('/api/leads/:id/follow-up', requireAuth, asyncRoute(async (req, res) => {
  const existing = await query('select payload, store_id from leads where id = $1', [req.params.id]);
  if (!existing.rowCount) return res.status(404).json({ error: 'NOT_FOUND' });
  if (req.user.role !== 'admin' && existing.rows[0].store_id !== req.user.store_id) {
    return res.status(403).json({ error: 'FORBIDDEN' });
  }
  const payload = { ...existing.rows[0].payload, ...(req.body || {}), id: req.params.id };
  await upsertPayload('leads', req.params.id, payload, { storeId: existing.rows[0].store_id });
  res.json({ lead: payload });
}));

app.get('/api/points', requireAuth, asyncRoute(async (req, res) => {
  res.json({ pointRecords: await listJsonTable('point_records', req.user) });
}));

app.get('/api/points/rank', requireAuth, asyncRoute(async (_req, res) => {
  res.json({ rank: [] });
}));

app.get('/api/deal-reports', requireAuth, asyncRoute(async (req, res) => {
  res.json({ dealReports: await listJsonTable('deal_reports', req.user) });
}));

app.post('/api/deal-reports', requireAuth, asyncRoute(async (req, res) => {
  const payload = { ...(req.body || {}) };
  payload.id ||= `deal-${Date.now()}`;
  payload.storeId ||= req.user.store_id;
  payload.status ||= 'pending';
  await upsertPayload('deal_reports', payload.id, payload, { storeId: req.user.store_id });
  res.status(201).json({ dealReport: payload });
}));

app.put('/api/deal-reports/:id/review', requireAuth, requireRole('admin'), asyncRoute(async (req, res) => {
  const existing = await query('select payload, store_id from deal_reports where id = $1', [req.params.id]);
  if (!existing.rowCount) return res.status(404).json({ error: 'NOT_FOUND' });
  const payload = { ...existing.rows[0].payload, status: req.body.status || 'approved' };
  await upsertPayload('deal_reports', req.params.id, payload, { storeId: existing.rows[0].store_id });
  res.json({ dealReport: payload });
}));

app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'FILE_REQUIRED' });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

app.use(express.static(path.join(rootDir, 'dist')));
app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(path.join(rootDir, 'dist', 'index.html'));
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`Store Content Treasure API listening on ${port}`);
});
