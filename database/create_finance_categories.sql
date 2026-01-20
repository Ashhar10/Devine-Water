-- Create Income Categories Table
create table if not exists public.income_categories (
  id text primary key,
  name text not null,
  color text default '#00d4ff',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create Expense Categories Table
create table if not exists public.expense_categories (
  id text primary key,
  name text not null,
  color text default '#00d4ff',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS (Row Level Security) if you want to secure these tables
-- alter table public.income_categories enable row level security;
-- alter table public.expense_categories enable row level security;

-- Create policies (Example: public access for now, adjust as needed)
-- create policy "Allow public access" on public.income_categories for all using (true);
-- create policy "Allow public access" on public.expense_categories for all using (true);
