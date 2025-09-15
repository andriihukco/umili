# Umili MVP Deployment Guide

## Prerequisites

1. **Supabase Account**: Create a new project at [supabase.com](https://supabase.com)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **GitHub Repository**: Push your code to GitHub

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key from Settings > API

### 1.2 Run Database Schema

1. Go to SQL Editor in your Supabase dashboard
2. Run the contents of `supabase-schema.sql`
3. Run the contents of `database-profile-enhancements.sql`
4. Run the contents of `supabase-storage-setup.sql`

### 1.3 Configure Storage Buckets

1. Go to Storage in your Supabase dashboard
2. Verify that these buckets are created:
   - `chat-files` (public)
   - `avatars` (public)
   - `portfolio` (public)

### 1.4 Set up Authentication

1. Go to Authentication > Settings
2. Configure Site URL: `https://your-domain.vercel.app`
3. Add redirect URLs:
   - `https://your-domain.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)

## Step 2: Vercel Deployment

### 2.1 Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository containing your Umili code

### 2.2 Configure Environment Variables

In Vercel dashboard, go to Settings > Environment Variables and add:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_ENABLE_PAYMENTS=false
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

### 2.3 Deploy

1. Click "Deploy" in Vercel
2. Wait for deployment to complete
3. Your app will be available at `https://your-project-name.vercel.app`

## Step 3: Post-Deployment Setup

### 3.1 Update Supabase URLs

1. Go back to Supabase Authentication settings
2. Update Site URL to your actual Vercel domain
3. Update redirect URLs to include your Vercel domain

### 3.2 Test Core Features

1. **User Registration**: Test both freelancer and client registration
2. **Authentication**: Test login/logout flows
3. **Profile Management**: Test profile editing and portfolio links
4. **Task Creation**: Test creating tasks as a client
5. **Applications**: Test applying to tasks as a freelancer
6. **Chat**: Test messaging between users
7. **File Upload**: Test file sharing in chat

### 3.3 Create Admin User (Optional)

Run this SQL in Supabase to create an admin user:

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
```

## Step 4: Domain Setup (Optional)

### 4.1 Custom Domain

1. In Vercel dashboard, go to Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update Supabase authentication URLs with your custom domain

## Step 5: Monitoring & Maintenance

### 5.1 Set up Monitoring

1. Enable Vercel Analytics (optional)
2. Monitor Supabase usage and limits
3. Set up error tracking (Sentry, etc.)

### 5.2 Regular Maintenance

1. Monitor database performance
2. Clean up old chat files periodically
3. Update dependencies regularly
4. Monitor user feedback and issues

## Environment Variables Reference

### Required Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `NEXT_PUBLIC_APP_URL`: Your app's public URL

### Optional Variables

- `NEXT_PUBLIC_ENABLE_PAYMENTS`: Set to `false` for MVP
- `NEXT_PUBLIC_ENABLE_NOTIFICATIONS`: Set to `true` for MVP
- `SUPABASE_SERVICE_ROLE_KEY`: For server-side operations (if needed)

## Troubleshooting

### Common Issues

1. **Authentication not working**: Check Supabase URLs and redirect URLs
2. **File uploads failing**: Verify storage bucket policies
3. **Database errors**: Check RLS policies and user permissions
4. **Build failures**: Check environment variables and dependencies

### Support

- Check Supabase logs in the dashboard
- Check Vercel function logs
- Review browser console for client-side errors

## Security Considerations

1. **Environment Variables**: Never commit sensitive keys to Git
2. **RLS Policies**: Review and test all Row Level Security policies
3. **File Uploads**: Implement file type and size restrictions
4. **Rate Limiting**: Consider implementing rate limiting for API calls

## Performance Optimization

1. **Database Indexes**: Ensure proper indexes are created
2. **Image Optimization**: Use Next.js Image component
3. **Caching**: Implement appropriate caching strategies
4. **CDN**: Vercel automatically provides global CDN

## Next Steps After MVP

1. **Payment Integration**: Add Stripe or LiqPay
2. **Email Notifications**: Implement email system
3. **Advanced Features**: Add more sophisticated matching algorithms
4. **Mobile App**: Consider React Native or Flutter app
5. **Analytics**: Add comprehensive analytics and reporting
