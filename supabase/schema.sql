-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  phone text,
  avatar_url text,
  plan text default 'free' check (plan in ('free', 'pro')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- If you already have the profiles table and want to add the new columns:
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Create categories table
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  name text not null,
  icon text,
  type text not null check (type in ('income', 'expense')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on categories
alter table public.categories enable row level security;

create policy "Users can view own categories and system categories" on public.categories
  for select using (user_id = auth.uid() or user_id is null);

create policy "Users can insert own categories" on public.categories
  for insert with check (user_id = auth.uid());

create policy "Users can update own categories" on public.categories
  for update using (user_id = auth.uid());

create policy "Users can delete own categories" on public.categories
  for delete using (user_id = auth.uid());

-- Create transactions table
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category_id uuid references public.categories on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null,
  note text,
  transaction_date date default current_date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on transactions
alter table public.transactions enable row level security;

create policy "Users can view own transactions" on public.transactions
  for select using (auth.uid() = user_id);

create policy "Users can insert own transactions" on public.transactions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own transactions" on public.transactions
  for update using (auth.uid() = user_id);

create policy "Users can delete own transactions" on public.transactions
  for delete using (auth.uid() = user_id);

-- Create subscriptions table (for Stripe integration)
create table public.subscriptions (
  user_id uuid references auth.users on delete cascade not null primary key,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text check (status in ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid')),
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on subscriptions
alter table public.subscriptions enable row level security;

create policy "Users can view own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Default categories
insert into public.categories (name, icon, type, user_id) values
  ('Salary', 'Wallet', 'income', null),
  ('Gift', 'Gift', 'income', null),
  ('Business', 'Briefcase', 'income', null),
  ('Food', 'Utensils', 'expense', null),
  ('Transport', 'Car', 'expense', null),
  ('Shopping', 'ShoppingBag', 'expense', null),
  ('Bills', 'Receipt', 'expense', null),
  ('Entertainment', 'Play', 'expense', null),
  ('Health', 'Heart', 'expense', null);
