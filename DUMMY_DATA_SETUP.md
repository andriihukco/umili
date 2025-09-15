# Umili Freelance Marketplace - Dummy Data Setup Guide

This guide will help you set up comprehensive dummy data for testing all user flows in your Umili freelance marketplace.

## 📋 Overview

The dummy data includes:

- **10 users** (6 freelancers, 3 clients, 1 admin)
- **50+ skills** across different categories
- **Portfolio items** with ratings and feedback
- **Tasks** in various statuses (open, in_progress, completed)
- **Applications** (pending, accepted, rejected)
- **Active conversations** with realistic messages
- **Ratings and reviews** for completed projects
- **Notifications** for various events
- **Subscription tiers** and user subscriptions
- **Usage tracking** for applications and job posts

## 🚀 Quick Setup

### Step 1: Run the SQL Scripts

Execute the SQL scripts in your Supabase SQL Editor in this order:

1. **`setup-basic-tables.sql`** - Creates all required tables and basic structure (RUN THIS FIRST)
2. **`create-dummy-data.sql`** - Creates skills, categories, and users
3. **`create-dummy-data-part2.sql`** - Creates portfolios, tasks, applications, and conversations
4. **`create-dummy-data-part3.sql`** - Creates messages, ratings, notifications, and subscriptions

### Step 2: Create Auth Users

**IMPORTANT**: After running `create-dummy-data.sql`, you need to create corresponding users in Supabase Auth dashboard with these exact UUIDs:

#### Freelancers

- `11111111-1111-1111-1111-111111111111` - Олексій Петренко (alex.petrenko@example.com) - Pro
- `22222222-2222-2222-2222-222222222222` - Марія Коваленко (maria.kovalenko@example.com) - Free
- `33333333-3333-3333-3333-333333333333` - Дмитро Іваненко (dmitro.ivanenko@example.com) - Pro
- `44444444-4444-4444-4444-444444444444` - Анна Сидоренко (anna.sidorenko@example.com) - Free
- `55555555-5555-5555-5555-555555555555` - Володимир Мельник (volodymyr.melnyk@example.com) - Pro
- `66666666-6666-6666-6666-666666666666` - Оксана Шевченко (oksana.shevchenko@example.com) - Free

#### Clients

- `77777777-7777-7777-7777-777777777777` - Ігор Бондаренко (igor.bondarenko@example.com) - Pro
- `88888888-8888-8888-8888-888888888888` - Наталія Романенко (natalia.romanenko@example.com) - Free
- `99999999-9999-9999-9999-999999999999` - Сергій Левченко (sergey.levchenko@example.com) - Pro
- `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` - Тетяна Кравченко (tetyana.kravchenko@example.com) - Free

#### Admin

- `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb` - Адміністратор (admin@umili.com) - Admin

### Step 3: Re-enable Foreign Key Constraint

After creating all auth users, run this SQL command to re-enable the foreign key constraint:

```sql
ALTER TABLE public.users ADD CONSTRAINT users_id_fkey
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

### Step 4: Test User Flows

## 🧪 Testing Scenarios

### Freelancer Flows

#### 1. Browse and Apply to Tasks

- **Login as**: Олексій Петренко (alex.petrenko@example.com)
- **Test**: Browse open tasks, apply to "Розробка веб-сайту для ресторану"
- **Expected**: See application in pending status

#### 2. Manage Portfolio

- **Login as**: Марія Коваленко (maria.kovalenko@example.com)
- **Test**: View portfolio items, check ratings
- **Expected**: See 2 portfolio items with high ratings

#### 3. Active Project Communication

- **Login as**: Володимир Мельник (volodymyr.melnyk@example.com)
- **Test**: Check active project "Розробка платформи для онлайн-курсів"
- **Expected**: See conversation with client, exchange messages

#### 4. Subscription Management

- **Login as**: Дмитро Іваненко (dmitro.ivanenko@example.com)
- **Test**: Check subscription status, view usage limits
- **Expected**: See Pro subscription with unlimited applications

### Client Flows

#### 1. Post and Manage Tasks

- **Login as**: Ігор Бондаренко (igor.bondarenko@example.com)
- **Test**: View posted tasks, manage applications
- **Expected**: See 3 tasks, review applications

#### 2. Review Applications

- **Login as**: Наталія Романенко (natalia.romanenko@example.com)
- **Test**: Review applications for "Розробка веб-сайту для ресторану"
- **Expected**: See 2 applications, accept/reject functionality

#### 3. Project Communication

- **Login as**: Сергій Левченко (sergey.levchenko@example.com)
- **Test**: Communicate with freelancer on "Дизайн корпоративного сайту"
- **Expected**: See active conversation with designer

#### 4. Rate Completed Projects

- **Login as**: Тетяна Кравченко (tetyana.kravchenko@example.com)
- **Test**: Rate completed project "Веб-сайт для кафе"
- **Expected**: See rating form, submit review

### Admin Flows

#### 1. User Management

- **Login as**: Адміністратор (admin@umili.com)
- **Test**: View all users, check roles and subscriptions
- **Expected**: See all 10 users with their details

#### 2. Analytics Dashboard

- **Test**: View platform statistics, user activity
- **Expected**: See metrics for tasks, applications, ratings

## 📊 Data Summary

### Users by Role

- **Freelancers**: 6 (3 Pro, 3 Free)
- **Clients**: 3 (2 Pro, 2 Free)
- **Admin**: 1

### Tasks by Status

- **Open**: 5 tasks (waiting for applications)
- **In Progress**: 3 tasks (active projects)
- **Completed**: 3 tasks (with ratings)

### Applications by Status

- **Pending**: 6 applications (awaiting client decision)
- **Accepted**: 3 applications (active projects)
- **Rejected**: 1 application

### Conversations

- **Active**: 3 conversations with realistic message history
- **Messages**: 15+ messages across different projects

### Portfolio Items

- **Total**: 10 portfolio items
- **Featured**: 4 featured items
- **Ratings**: All items have client ratings (4.6-5.0)

## 🔧 Customization

### Adding More Users

To add more test users:

1. Add new UUIDs to the users table
2. Create corresponding auth.users in Supabase Auth
3. Add user skills, portfolio items, and subscriptions as needed

### Adding More Tasks

To add more test tasks:

1. Insert new tasks with different statuses
2. Create applications from various freelancers
3. Add conversations and messages for active projects

### Modifying Data

All data is realistic and can be modified:

- Change names, emails, and descriptions
- Adjust budgets and hourly rates
- Modify skill sets and proficiency levels
- Update portfolio items and ratings

## 🐛 Troubleshooting

### Common Issues

1. **Foreign Key Errors**: Make sure to run scripts in order
2. **Auth User Missing**: Create auth.users with exact UUIDs
3. **RLS Policies**: Ensure Row Level Security policies allow data access
4. **Subscription Issues**: Check that subscription tiers exist before creating users

### Verification Queries

```sql
-- Check user count
SELECT role, COUNT(*) FROM public.users GROUP BY role;

-- Check task statuses
SELECT status, COUNT(*) FROM public.tasks GROUP BY status;

-- Check application statuses
SELECT status, COUNT(*) FROM public.applications GROUP BY status;

-- Check active conversations
SELECT COUNT(*) FROM public.conversations;

-- Check messages
SELECT COUNT(*) FROM public.messages;
```

## 📝 Notes

- All passwords for test users should be set to a simple value like "password123"
- Email addresses are fictional and safe to use
- Data includes Ukrainian names and descriptions for realistic testing
- Portfolio images use Unsplash URLs (replace with your own if needed)
- All monetary values are in USD

## 🎯 Next Steps

After setting up dummy data:

1. **Test Authentication**: Login with different user types
2. **Test Task Flows**: Post tasks, apply, accept/reject applications
3. **Test Communication**: Use chat functionality
4. **Test Payments**: Integrate with your payment system
5. **Test Notifications**: Check notification system
6. **Test Subscriptions**: Verify subscription limits and features

This comprehensive dummy data will allow you to test all major user flows and edge cases in your Umili freelance marketplace!
