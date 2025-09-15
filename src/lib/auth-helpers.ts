import { supabase } from './supabase';

/**
 * Check if an email is already registered in the system
 * @param email - The email to check
 * @returns Promise<boolean> - true if email is available, false if already exists
 */
export async function checkEmailAvailability(email: string): Promise<boolean> {
  try {
    // Check in public.users table first (this is what we can control)
    const { data: publicUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (publicUser) {
      return false; // Email exists in public.users
    }

    // For auth.users, we'll rely on Supabase's built-in validation
    // when the user tries to sign up
    return true; // Email appears to be available
  } catch (error) {
    console.error('Error checking email availability:', error);
    return true; // Allow signup attempt, let Supabase handle the validation
  }
}

/**
 * Validate email format
 * @param email - The email to validate
 * @returns boolean - true if valid format, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get the appropriate site URL for email redirects
 * @returns string - The site URL
 */
export function getSiteUrl(): string {
  // In production, use the environment variable
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // Fallback to production URL
  return 'https://umili.work';
}

/**
 * Handle Supabase auth errors with user-friendly messages
 * @param error - The Supabase error
 * @returns string - User-friendly error message
 */
export function getAuthErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object' || !('message' in error)) {
    return 'Сталася неочікувана помилка. Спробуйте ще раз.';
  }

  const message = (error as { message: string }).message.toLowerCase();

  if (message.includes('already registered') || message.includes('user already registered')) {
    return 'Користувач з таким email вже зареєстрований. Спробуйте увійти в систему.';
  }

  if (message.includes('invalid email') || message.includes('email format')) {
    return 'Невірний формат email адреси.';
  }

  if (message.includes('password') && message.includes('weak')) {
    return 'Пароль занадто слабкий. Використовуйте мінімум 6 символів.';
  }

  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Занадто багато спроб. Спробуйте через кілька хвилин.';
  }

  if (message.includes('network') || message.includes('connection')) {
    return 'Проблема з підключенням. Перевірте інтернет-з\'єднання.';
  }

  // Return the original error message if no specific case matches
  return (error as { message: string }).message;
}
