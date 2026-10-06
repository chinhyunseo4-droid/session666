# 오늘의 한 줄 기록 - Next.js

Next.js App Router와 Supabase로 만든 웹사이트입니다.

## 실행

```bash
pnpm install
pnpm dev
```

## Vercel 환경 변수

Vercel 프로젝트의 **Settings → Environment Variables**에 아래 이름으로 등록하세요.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

값은 로컬의 `.env.local`에 들어 있으며, 이 파일은 GitHub에 올리지 않습니다.

## RLS 정책

목록 조회와 기록 추가가 안 되면 Supabase SQL Editor에서 아래 정책을 실행해야 합니다.

```sql
create policy "Public can read posts" on public.posts
  for select to anon using (true);

create policy "Public can create posts" on public.posts
  for insert to anon with check (true);
```
