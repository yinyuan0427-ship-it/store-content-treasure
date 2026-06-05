create table if not exists stores (
  id text primary key,
  name text not null,
  city text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists users (
  phone text primary key,
  password_hash text not null,
  name text not null,
  role text not null check (role in ('admin', 'dealer_owner', 'sales', 'installer')),
  store_id text references stores(id),
  city text not null default '',
  team text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id text primary key,
  store_id text references stores(id),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists product_images (
  id bigserial primary key,
  product_id text not null references products(id) on delete cascade,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists materials (
  id text primary key,
  store_id text references stores(id),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists delivery_tasks (
  id text primary key,
  store_id text references stores(id),
  sales_id text,
  installer_id text,
  review_status text not null default 'draft',
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists task_images (
  id bigserial primary key,
  task_id text not null references delivery_tasks(id) on delete cascade,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists cases (
  id text primary key,
  task_id text references delivery_tasks(id),
  store_id text references stores(id),
  visibility text not null default 'public',
  review_status text not null default 'approved',
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists leads (
  id text primary key,
  case_id text,
  store_id text references stores(id),
  sales_id text,
  status text not null default '待联系',
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists point_records (
  id text primary key,
  user_id text not null,
  store_id text references stores(id),
  points integer not null default 0,
  type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists deal_reports (
  id text primary key,
  store_id text references stores(id),
  sales_id text,
  status text not null default 'pending',
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_delivery_tasks_store on delivery_tasks(store_id);
create index if not exists idx_cases_store on cases(store_id);
create index if not exists idx_leads_store on leads(store_id);
create index if not exists idx_deal_reports_store on deal_reports(store_id);
