create table if not exists accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  type text not null,
  balance numeric default 0,
  icon text,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table accounts enable row level security;

create policy "Users can view own accounts" on accounts
  for select using (auth.uid() = user_id);

create policy "Users can insert own accounts" on accounts
  for insert with check (auth.uid() = user_id);

create policy "Users can update own accounts" on accounts
  for update using (auth.uid() = user_id);

create policy "Users can delete own accounts" on accounts
  for delete using (auth.uid() = user_id);
