# 🚀 Deployment Guide - Umili

## Vercel Deployment (Рекомендовано)

### 1. Підготовка

1. **Створіть обліковий запис Vercel**

   - Перейдіть на [vercel.com](https://vercel.com)
   - Увійдіть через GitHub

2. **Підготуйте Supabase проєкт**
   - Створіть новий проєкт на [supabase.com](https://supabase.com)
   - Скопіюйте URL та Anon Key

### 2. Деплой через Vercel Dashboard

1. **Імпорт проєкту**

   ```
   GitHub → Import Project → Select Repository → Import
   ```

2. **Налаштування змінних середовища**

   ```
   Project Settings → Environment Variables

   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Деплой**
   ```
   Deploy → Wait for build → Success! 🎉
   ```

### 3. Налаштування бази даних

1. **Імпорт схеми**

   ```sql
   -- Виконайте supabase-schema.sql в SQL Editor
   ```

2. **Налаштування RLS**

   ```sql
   -- Включіть Row Level Security для всіх таблиць
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
   ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
   ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
   ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
   ```

3. **Створення політик**
   ```sql
   -- Виконайте RLS політики з DOCUMENTATION.md
   ```

### 4. Налаштування домену

1. **Кастомний домен**

   ```
   Project Settings → Domains → Add Domain
   ```

2. **DNS налаштування**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

## Альтернативні платформи

### Netlify

1. **Підключення репозиторію**

   ```bash
   # Встановіть Netlify CLI
   npm install -g netlify-cli

   # Деплой
   netlify deploy --prod
   ```

2. **Налаштування**

   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = ".next"

   [build.environment]
     NEXT_PUBLIC_SUPABASE_URL = "your-url"
     NEXT_PUBLIC_SUPABASE_ANON_KEY = "your-key"
   ```

### Railway

1. **Підключення GitHub**

   - Перейдіть на [railway.app](https://railway.app)
   - Connect GitHub repository

2. **Налаштування змінних**
   ```
   Variables → Add Variables
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   ```

### DigitalOcean App Platform

1. **Створення додатку**
   ```yaml
   # .do/app.yaml
   name: umili
   services:
     - name: web
       source_dir: /
       github:
         repo: your-username/umili
         branch: main
       run_command: npm start
       environment_slug: node-js
       instance_count: 1
       instance_size_slug: basic-xxs
       envs:
         - key: NEXT_PUBLIC_SUPABASE_URL
           value: your-url
         - key: NEXT_PUBLIC_SUPABASE_ANON_KEY
           value: your-key
   ```

## Docker Deployment

### 1. Створення Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Docker Compose

```yaml
# docker-compose.yml
version: "3.8"

services:
  umili:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    restart: unless-stopped
```

### 3. Запуск

```bash
# Збірка та запуск
docker-compose up -d

# Перегляд логів
docker-compose logs -f
```

## Environment Variables

### Обов'язкові змінні

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Опціональні змінні

```env
# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Error Tracking
SENTRY_DSN=https://your-sentry-dsn

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=Umili
```

## Post-Deployment Checklist

### ✅ Перевірки

- [ ] Сайт доступний за доменом
- [ ] Автентифікація працює
- [ ] База даних підключена
- [ ] RLS політики активні
- [ ] HTTPS сертифікат встановлений
- [ ] Мобільна версія працює
- [ ] Форми відправляються
- [ ] Real-time оновлення працюють

### 🔧 Налаштування

1. **Supabase Dashboard**

   - Перевірте підключення
   - Налаштуйте автентифікацію
   - Перевірте RLS політики

2. **Vercel Dashboard**

   - Налаштуйте домен
   - Перевірте змінні середовища
   - Налаштуйте аналітику

3. **Моніторинг**
   - Налаштуйте Sentry (опціонально)
   - Підключіть Google Analytics
   - Налаштуйте алерти

## Troubleshooting

### Поширені проблеми

1. **Build Error**

   ```bash
   # Перевірте логі
   vercel logs

   # Локальна збірка
   npm run build
   ```

2. **Environment Variables**

   ```bash
   # Перевірте змінні
   vercel env ls

   # Додайте змінну
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   ```

3. **Database Connection**

   ```sql
   -- Перевірте підключення
   SELECT * FROM users LIMIT 1;

   -- Перевірте RLS
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

### Логи та дебаг

```bash
# Vercel logs
vercel logs

# Local development
npm run dev

# Production logs
docker-compose logs -f
```

## Performance Optimization

### 1. Next.js Optimization

```javascript
// next.config.ts
const nextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    domains: ["your-supabase-url.supabase.co"],
  },
  compress: true,
  poweredByHeader: false,
};
```

### 2. Supabase Optimization

```sql
-- Індекси для швидкого пошуку
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_applications_freelancer ON applications(freelancer_id);
```

### 3. CDN та кешування

```json
// vercel.json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

**Готово до запуску!** 🚀

Якщо виникли проблеми, перевірте [DOCUMENTATION.md](./DOCUMENTATION.md) або створіть issue в репозиторії.
