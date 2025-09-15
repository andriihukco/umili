import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface AuthUser {
  id: string;
  email: string;
  role: 'freelancer' | 'client' | 'admin';
  name: string;
  avatar?: string;
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get('sb-access-token')?.value;
    
    if (!token) {
      return null;
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    return {
      id: user.id,
      email: user.email!,
      role: profile.role,
      name: profile.name,
      avatar: profile.avatar,
    };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return null;
  }
}

export function requireAuth(handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    return handler(request, user);
  };
}

export function requireRole(allowedRoles: ('freelancer' | 'client' | 'admin')[]) {
  return function(handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>) {
    return async (request: NextRequest) => {
      const user = await getAuthUser(request);
      
      if (!user) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
      
      if (!allowedRoles.includes(user.role)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      
      return handler(request, user);
    };
  };
}

export function requireClient(handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>) {
  return requireRole(['client', 'admin'])(handler);
}

export function requireFreelancer(handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>) {
  return requireRole(['freelancer', 'admin'])(handler);
}

export function requireAdmin(handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>) {
  return requireRole(['admin'])(handler);
}
