import crypto from 'node:crypto';
import { query } from './db.js';

const secret = process.env.AUTH_SECRET || 'change-me-before-pilot';

function b64url(input) {
  return Buffer.from(input).toString('base64url');
}

function sign(data) {
  return crypto.createHmac('sha256', secret).update(data).digest('base64url');
}

export function createToken(user) {
  const payload = {
    sub: user.phone,
    role: user.role,
    storeId: user.store_id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14,
  };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function verifyToken(token) {
  if (!token || !token.includes('.')) return null;
  const [body, signature] = token.split('.');
  if (sign(body) !== signature) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt] = storedHash.split(':');
  return hashPassword(password, salt) === storedHash;
}

export function publicUser(row) {
  if (!row) return null;
  return {
    phone: row.phone,
    name: row.name,
    role: row.role,
    storeName: row.store_name || '',
    storeId: row.store_id || '',
    city: row.city || '',
    team: row.team || '',
  };
}

export async function loadUser(phone) {
  const result = await query(
    `select u.*, s.name as store_name
       from users u
       left join stores s on s.id = u.store_id
      where u.phone = $1 and u.active = true`,
    [phone],
  );
  return result.rows[0] || null;
}

export async function requireAuth(req, res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'UNAUTHORIZED' });
  const user = await loadUser(payload.sub);
  if (!user) return res.status(401).json({ error: 'UNAUTHORIZED' });
  req.user = user;
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) return res.status(403).json({ error: 'FORBIDDEN' });
    next();
  };
}
