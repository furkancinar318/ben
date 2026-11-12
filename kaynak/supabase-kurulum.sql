-- Ben uygulaması: şifreli veri kasası
create table if not exists public.vault (
  user_id    uuid primary key references auth.users on delete cascade default auth.uid(),
  data       text not null,          -- AES-256 ile şifrelenmiş veriler
  iv         text not null,
  salt       text not null,
  rev        bigint not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.vault enable row level security;
drop policy if exists "kendi satirim" on public.vault;
create policy "kendi satirim" on public.vault
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
