# Supabase Setup Guide

## Quick Setup for Tasks Catalog

To see tasks in the catalog, you need to configure your Supabase connection:

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (usually takes 2-3 minutes)

### 2. Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public key**

### 3. Configure Environment Variables

1. Create a `.env.local` file in your project root:

```bash
cp env.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Set Up Database Schema

Run these SQL scripts in your Supabase SQL Editor in order:

1. **`setup-basic-tables.sql`** - Creates all required tables
2. **`create-dummy-data.sql`** - Creates skills, categories, and users
3. **`create-dummy-data-part2.sql`** - Creates portfolios, tasks, applications
4. **`create-dummy-data-part3.sql`** - Creates messages, ratings, notifications

### 5. Create Auth Users

After running the SQL scripts, create corresponding users in Supabase Auth:

1. Go to **Authentication** → **Users** → **Add user**
2. Create users with these emails (or use the UUIDs from the SQL scripts):
   - `admin@umili.com` (admin)
   - `client@umili.com` (client)
   - `freelancer@umili.com` (freelancer)

### 6. Test the Connection

1. Restart your development server:

```bash
npm run dev
```

2. Go to `/catalog/tasks` - you should now see sample tasks!

## Troubleshooting

### No Tasks Showing

- Check browser console for error messages
- Verify your `.env.local` file has correct Supabase credentials
- Ensure you've run all the SQL setup scripts
- Check that Row Level Security (RLS) policies allow data access

### Database Connection Errors

- Verify your Supabase project is active
- Check that your API keys are correct
- Ensure your project URL includes `https://`

### Still Having Issues?

1. Check the browser console for detailed error messages
2. Verify your Supabase project has the correct tables created
3. Make sure you've run the dummy data scripts to populate the database

## Next Steps

Once you have tasks showing:

1. Test the filtering and search functionality
2. Try applying to tasks (if logged in as a freelancer)
3. Create new tasks (if logged in as a client)
4. Explore other features of the platform
