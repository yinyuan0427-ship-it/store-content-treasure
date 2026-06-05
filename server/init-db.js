import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { query, withTransaction, pool } from './db.js';
import { hashPassword } from './auth.js';
import { deliveryTasks, materials, products, stores, users } from './seed-data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function upsertJson(client, table, row, extra = {}) {
  const payload = { ...row };
  const storeId = extra.storeId ?? row.storeId ?? null;
  const status = extra.status ?? row.reviewStatus ?? row.status ?? null;
  if (table === 'delivery_tasks') {
    await client.query(
      `insert into delivery_tasks (id, store_id, sales_id, installer_id, review_status, payload)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (id) do update set payload = excluded.payload, updated_at = now()`,
      [row.id, storeId, row.salesId || null, row.installerId || null, status || 'draft', payload],
    );
    return;
  }
  if (table === 'cases') {
    await client.query(
      `insert into cases (id, task_id, store_id, visibility, review_status, payload)
       values ($1, $2, $3, 'public', $4, $5)
       on conflict (id) do update set payload = excluded.payload, updated_at = now()`,
      [row.id, row.id, storeId, status || 'approved', payload],
    );
    return;
  }
  if (table === 'materials') {
    await client.query(
      `insert into materials (id, store_id, payload)
       values ($1, $2, $3)
       on conflict (id) do update set payload = excluded.payload, updated_at = now()`,
      [row.id, storeId, payload],
    );
    return;
  }
  if (table === 'products') {
    await client.query(
      `insert into products (id, store_id, payload)
       values ($1, $2, $3)
       on conflict (id) do update set payload = excluded.payload, updated_at = now()`,
      [row.id, storeId, payload],
    );
  }
}

async function main() {
  const schema = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
  await query(schema);

  await withTransaction(async (client) => {
    for (const store of stores) {
      await client.query(
        `insert into stores (id, name, city)
         values ($1, $2, $3)
         on conflict (id) do update set name = excluded.name, city = excluded.city`,
        [store.id, store.name, store.city],
      );
    }

    for (const user of users) {
      await client.query(
        `insert into users (phone, password_hash, name, role, store_id, city, team)
         values ($1, $2, $3, $4, $5, $6, $7)
         on conflict (phone) do update set
           name = excluded.name,
           role = excluded.role,
           store_id = excluded.store_id,
           city = excluded.city,
           team = excluded.team`,
        [user.phone, hashPassword(user.password), user.name, user.role, user.storeId, user.city, user.team || ''],
      );
    }

    for (const product of products) await upsertJson(client, 'products', product);
    for (const material of materials) await upsertJson(client, 'materials', material);
    for (const task of deliveryTasks) {
      await upsertJson(client, 'delivery_tasks', task);
      await upsertJson(client, 'cases', task);
    }
  });

  console.log('Database schema and pilot seed data are ready.');
}

main().finally(() => pool.end());
