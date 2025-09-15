# Umili - Технічна документація

## 📋 Зміст

1. [Архітектура системи](#архітектура-системи)
2. [База даних](#база-даних)
3. [API Endpoints](#api-endpoints)
4. [Компоненти](#компоненти)
5. [Стан додатку](#стан-додатку)
6. [Безпека](#безпека)
7. [Деплой](#деплой)

## 🏗 Архітектура системи

### Frontend Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   Components    │    │   Zustand Store │
│   Router         │◄──►│   (shadcn/ui)   │◄──►│   (State Mgmt)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Pages &       │    │   UI Components  │    │   Auth & Data   │
│   Layouts       │    │   & Forms        │    │   Management    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                   ▼
                        ┌─────────────────┐
                        │   Supabase      │
                        │   (Backend)     │
                        └─────────────────┘
```

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Icons**: Lucide React
- **Fonts**: Geologica (Google Fonts)

## 🗄 База даних

### Схема бази даних

```sql
-- Користувачі
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('client', 'freelancer', 'admin')) NOT NULL,
  avatar TEXT,
  balance DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Завдання
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',
  category TEXT,
  created_by UUID REFERENCES users(id) NOT NULL,
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Заявки
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) NOT NULL,
  freelancer_id UUID REFERENCES users(id) NOT NULL,
  message TEXT NOT NULL,
  proposed_budget DECIMAL(10,2),
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, freelancer_id)
);

-- Повідомлення
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) NOT NULL,
  sender_id UUID REFERENCES users(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Транзакції
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) NOT NULL,
  from_user_id UUID REFERENCES users(id) NOT NULL,
  to_user_id UUID REFERENCES users(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### RLS Політики

```sql
-- Користувачі можуть бачити тільки свої дані
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Завдання
CREATE POLICY "Anyone can view open tasks" ON tasks
  FOR SELECT USING (status = 'open');

CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = created_by OR auth.uid() = assigned_to);

CREATE POLICY "Clients can create tasks" ON tasks
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'client')
  );

-- Заявки
CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT USING (
    auth.uid() = freelancer_id OR
    EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND created_by = auth.uid())
  );

CREATE POLICY "Freelancers can create applications" ON applications
  FOR INSERT WITH CHECK (
    auth.uid() = freelancer_id AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'freelancer')
  );
```

## 🔌 API Endpoints

### Supabase Client Methods

#### Tasks

```typescript
// Отримати всі завдання
const { data, error } = await supabase
  .from("tasks")
  .select(
    `
    *,
    users:created_by(name, avatar),
    applications(*)
  `
  )
  .order("created_at", { ascending: false });

// Створити завдання
const { data, error } = await supabase.from("tasks").insert({
  title: "Task Title",
  description: "Task Description",
  budget: 10000,
  category: "Web Development",
  created_by: user.id,
});

// Оновити статус завдання
const { error } = await supabase
  .from("tasks")
  .update({ status: "completed" })
  .eq("id", taskId);
```

#### Applications

```typescript
// Подати заявку
const { error } = await supabase.from("applications").insert({
  task_id: taskId,
  freelancer_id: user.id,
  message: "Application message",
  proposed_budget: 8000,
});

// Оновити статус заявки
const { error } = await supabase
  .from("applications")
  .update({ status: "accepted" })
  .eq("id", applicationId);
```

#### Real-time Subscriptions

```typescript
// Підписка на зміни заявок
const channel = supabase
  .channel("applications_changes")
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "applications",
    },
    (payload) => {
      console.log("Application updated:", payload.new);
    }
  )
  .subscribe();
```

## 🧩 Компоненти

### Структура компонентів

```
components/
├── ui/                    # Базові UI компоненти
│   ├── button.tsx        # Кнопки
│   ├── card.tsx          # Картки
│   ├── input.tsx         # Поля вводу
│   ├── dialog.tsx        # Модальні вікна
│   ├── page-header.tsx   # Заголовки сторінок
│   ├── stats-grid.tsx    # Сітка статистики
│   ├── content-grid.tsx  # Сітка контенту
│   └── loading-spinner.tsx # Індикатор завантаження
├── dashboards/           # Панелі управління
│   ├── user-dashboard.tsx    # Основний роутер
│   ├── client-dashboard.tsx  # Панель клієнта
│   ├── freelancer-dashboard.tsx # Панель фрілансера
│   └── admin-dashboard.tsx    # Панель адміна
├── sidebar.tsx           # Бічна навігація
├── app-layout.tsx       # Основний макет
└── auth-provider.tsx     # Провайдер автентифікації
```

### Ключові компоненти

#### Sidebar

```typescript
interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}
```

- Адаптивна навігація
- Роль-базована фільтрація меню
- Пошук в реальному часі
- Профіль користувача

#### PageHeader

```typescript
interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}
```

- Консистентні заголовки сторінок
- Підтримка дій у заголовку
- Адаптивний дизайн

#### StatsGrid

```typescript
interface StatItem {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
}
```

- Універсальна сітка статистики
- Підтримка іконок
- Адаптивна сітка

## 📊 Стан додатку

### Zustand Store

```typescript
interface AppState {
  // Автентифікація
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;

  // Дії
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  signOut: () => Promise<void>;
}
```

### Типи даних

```typescript
interface User {
  id: string;
  email: string;
  created_at: string;
}

interface Profile {
  id: string;
  name: string;
  role: "client" | "freelancer" | "admin";
  avatar: string | null;
  balance: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: "open" | "in_progress" | "completed" | "cancelled";
  category: string;
  created_by: string;
  assigned_to: string | null;
  created_at: string;
  users: {
    name: string;
    avatar: string | null;
  };
}

interface Application {
  id: string;
  task_id: string;
  freelancer_id: string;
  message: string;
  proposed_budget: number | null;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}
```

## 🔒 Безпека

### Автентифікація

- Supabase Auth з email/password
- JWT токени
- Автоматичне оновлення токенів
- Захист маршрутів

### Авторизація

- Row Level Security (RLS)
- Роль-базований доступ
- Валідація на клієнті та сервері

### Валідація

```typescript
// Zod схеми
const TaskSchema = z.object({
  title: z.string().min(1, 'Назва обов'язкова'),
  description: z.string().min(10, 'Опис має бути детальним'),
  budget: z.number().min(100, 'Мінімальний бюджет 100 ₴'),
  category: z.string().min(1, 'Категорія обов'язкова')
});
```

## 🚀 Деплой

### Vercel (Рекомендовано)

1. **Підключення репозиторію**

   ```bash
   # Встановіть Vercel CLI
   npm i -g vercel

   # Деплой
   vercel
   ```

2. **Змінні середовища**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Налаштування домену**
   - Додайте кастомний домен в Vercel
   - Налаштуйте SSL сертифікат

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Optional: Sentry
SENTRY_DSN=https://your-sentry-dsn
```

## 📈 Моніторинг

### Логування

- Console логування в розробці
- Structured логування в продакшені
- Error tracking з Sentry

### Аналітика

- Google Analytics 4
- Vercel Analytics
- Supabase Dashboard

### Performance

- Next.js Bundle Analyzer
- Lighthouse CI
- Core Web Vitals

## 🔧 Розробка

### Команди

```bash
# Розробка
npm run dev

# Збірка
npm run build

# Запуск продакшену
npm start

# Лінтінг
npm run lint

# Типи
npm run type-check
```

### Git Workflow

1. Feature branches від `main`
2. Pull requests з описом змін
3. Code review обов'язковий
4. Squash merge в `main`

### Code Style

- ESLint + Prettier
- TypeScript strict mode
- Conventional commits
- Husky pre-commit hooks

---

**Останнє оновлення**: 2024
**Версія документації**: 1.0.0
