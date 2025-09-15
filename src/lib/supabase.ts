import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Utility function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Database types
export interface Database {
  public: {
    Tables: {
      subscription_tiers: {
        Row: {
          id: string
          name: string
          role: 'freelancer' | 'client'
          price_monthly: number
          price_yearly: number
          applications_limit: number
          job_posts_limit: number
          features: Record<string, unknown>
          liqpay_product_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          role: 'freelancer' | 'client'
          price_monthly?: number
          price_yearly?: number
          applications_limit?: number
          job_posts_limit?: number
          features?: Record<string, unknown>
          liqpay_product_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: 'freelancer' | 'client'
          price_monthly?: number
          price_yearly?: number
          applications_limit?: number
          job_posts_limit?: number
          features?: Record<string, unknown>
          liqpay_product_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          tier_id: string
          liqpay_order_id: string | null
          status: 'active' | 'canceled' | 'past_due' | 'unpaid'
          billing_cycle: 'monthly' | 'yearly'
          current_period_start: string
          current_period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tier_id: string
          liqpay_order_id?: string | null
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid'
          billing_cycle: 'monthly' | 'yearly'
          current_period_start: string
          current_period_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tier_id?: string
          liqpay_order_id?: string | null
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid'
          billing_cycle?: 'monthly' | 'yearly'
          current_period_start?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
        }
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          usage_type: 'application' | 'job_post'
          period_start: string
          period_end: string
          count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          usage_type: 'application' | 'job_post'
          period_start: string
          period_end: string
          count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          usage_type?: 'application' | 'job_post'
          period_start?: string
          period_end?: string
          count?: number
          created_at?: string
          updated_at?: string
        }
      }
      work_experience: {
        Row: {
          id: string
          user_id: string
          company_name: string
          position: string
          location: string | null
          employment_type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship'
          start_date: string
          end_date: string | null
          is_current: boolean
          description: string | null
          achievements: string[] | null
          skills_used: string[] | null
          company_website: string | null
          company_logo: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          position: string
          location?: string | null
          employment_type?: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship'
          start_date: string
          end_date?: string | null
          is_current?: boolean
          description?: string | null
          achievements?: string[] | null
          skills_used?: string[] | null
          company_website?: string | null
          company_logo?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          position?: string
          location?: string | null
          employment_type?: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship'
          start_date?: string
          end_date?: string | null
          is_current?: boolean
          description?: string | null
          achievements?: string[] | null
          skills_used?: string[] | null
          company_website?: string | null
          company_logo?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      education: {
        Row: {
          id: string
          user_id: string
          institution_name: string
          degree: string
          field_of_study: string | null
          location: string | null
          start_date: string
          end_date: string | null
          is_current: boolean
          gpa: number | null
          description: string | null
          achievements: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          institution_name: string
          degree: string
          field_of_study?: string | null
          location?: string | null
          start_date: string
          end_date?: string | null
          is_current?: boolean
          gpa?: number | null
          description?: string | null
          achievements?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          institution_name?: string
          degree?: string
          field_of_study?: string | null
          location?: string | null
          start_date?: string
          end_date?: string | null
          is_current?: boolean
          gpa?: number | null
          description?: string | null
          achievements?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      certifications: {
        Row: {
          id: string
          user_id: string
          name: string
          issuing_organization: string
          issue_date: string
          expiry_date: string | null
          credential_id: string | null
          credential_url: string | null
          skills_verified: string[] | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          issuing_organization: string
          issue_date: string
          expiry_date?: string | null
          credential_id?: string | null
          credential_url?: string | null
          skills_verified?: string[] | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          issuing_organization?: string
          issue_date?: string
          expiry_date?: string | null
          credential_id?: string | null
          credential_url?: string | null
          skills_verified?: string[] | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'freelancer' | 'client' | 'admin'
          avatar: string | null
          bio: string | null
          skills: string[] | null
          hourly_rate: number | null
          current_tier_id: string | null
          resume_url: string | null
          portfolio_links: {
            website: string
            github: string
            linkedin: string
            dribbble: string
            behance: string
            figma: string
            instagram: string
            twitter: string
            youtube: string
            tiktok: string
          } | null
          experience_years: number | null
          location: string | null
          availability: 'available' | 'busy' | 'part-time' | 'unavailable' | null
          is_blocked: boolean
          block_reason: string | null
          blocked_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: 'freelancer' | 'client' | 'admin'
          avatar?: string | null
          bio?: string | null
          skills?: string[] | null
          hourly_rate?: number | null
          current_tier_id?: string | null
          resume_url?: string | null
          portfolio_links?: {
            website: string
            github: string
            linkedin: string
            dribbble: string
            behance: string
            figma: string
            instagram: string
            twitter: string
            youtube: string
            tiktok: string
          } | null
          experience_years?: number | null
          location?: string | null
          availability?: 'available' | 'busy' | 'part-time' | 'unavailable' | null
          is_blocked?: boolean
          block_reason?: string | null
          blocked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'freelancer' | 'client' | 'admin'
          avatar?: string | null
          bio?: string | null
          skills?: string[] | null
          hourly_rate?: number | null
          current_tier_id?: string | null
          resume_url?: string | null
          portfolio_links?: {
            website: string
            github: string
            linkedin: string
            dribbble: string
            behance: string
            figma: string
            instagram: string
            twitter: string
            youtube: string
            tiktok: string
          } | null
          experience_years?: number | null
          location?: string | null
          availability?: 'available' | 'busy' | 'part-time' | 'unavailable' | null
          is_blocked?: boolean
          block_reason?: string | null
          blocked_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string
          budget: number
          status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled'
          client_id: string
          freelancer_id: string | null
          created_by: string
          category: string | null
          skills_required: string[] | null
          experience_level: 'beginner' | 'intermediate' | 'expert' | null
          project_type: 'one_time' | 'ongoing' | 'consultation' | null
          estimated_duration: string | null
          deadline: string | null
          additional_requirements: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          budget: number
          status?: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled'
          client_id: string
          freelancer_id?: string | null
          created_by: string
          category?: string | null
          skills_required?: string[] | null
          experience_level?: 'beginner' | 'intermediate' | 'expert' | null
          project_type?: 'one_time' | 'ongoing' | 'consultation' | null
          estimated_duration?: string | null
          deadline?: string | null
          additional_requirements?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          budget?: number
          status?: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled'
          client_id?: string
          freelancer_id?: string | null
          created_by?: string
          category?: string | null
          skills_required?: string[] | null
          experience_level?: 'beginner' | 'intermediate' | 'expert' | null
          project_type?: 'one_time' | 'ongoing' | 'consultation' | null
          estimated_duration?: string | null
          deadline?: string | null
          additional_requirements?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          task_id: string
          freelancer_id: string
          message: string
          proposed_budget: number | null
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          freelancer_id: string
          message: string
          proposed_budget?: number | null
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          freelancer_id?: string
          message?: string
          proposed_budget?: number | null
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          task_id: string
          client_id: string
          freelancer_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          client_id: string
          freelancer_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          client_id?: string
          freelancer_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          message_type: 'text' | 'application' | 'system'
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          message_type?: 'text' | 'application' | 'system'
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          message_type?: 'text' | 'application' | 'system'
          created_at?: string
        }
      }
      portfolio: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          image_url: string | null
          project_url: string | null
          skills_used: string[] | null
          category: string | null
          budget_range: string | null
          duration: string | null
          client_feedback: string | null
          rating: number | null
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          image_url?: string | null
          project_url?: string | null
          skills_used?: string[] | null
          category?: string | null
          budget_range?: string | null
          duration?: string | null
          client_feedback?: string | null
          rating?: number | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          image_url?: string | null
          project_url?: string | null
          skills_used?: string[] | null
          category?: string | null
          budget_range?: string | null
          duration?: string | null
          client_feedback?: string | null
          rating?: number | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          name: string
          category: string
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      user_skills: {
        Row: {
          id: string
          user_id: string
          skill_id: string
          proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          years_experience: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          skill_id: string
          proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          years_experience?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          skill_id?: string
          proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          years_experience?: number
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          parent_id: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          parent_id?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          parent_id?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          task_id: string
          rater_id: string
          rated_id: string
          rating: number
          review: string | null
          communication_rating: number | null
          quality_rating: number | null
          timeliness_rating: number | null
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          rater_id: string
          rated_id: string
          rating: number
          review?: string | null
          communication_rating?: number | null
          quality_rating?: number | null
          timeliness_rating?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          rater_id?: string
          rated_id?: string
          rating?: number
          review?: string | null
          communication_rating?: number | null
          quality_rating?: number | null
          timeliness_rating?: number | null
          created_at?: string
        }
      }
      file_attachments: {
        Row: {
          id: string
          task_id: string | null
          application_id: string | null
          portfolio_id: string | null
          uploaded_by: string
          file_name: string
          file_url: string
          file_size: number | null
          file_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          task_id?: string | null
          application_id?: string | null
          portfolio_id?: string | null
          uploaded_by: string
          file_name: string
          file_url: string
          file_size?: number | null
          file_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string | null
          application_id?: string | null
          portfolio_id?: string | null
          uploaded_by?: string
          file_name?: string
          file_url?: string
          file_size?: number | null
          file_type?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'success' | 'warning' | 'error'
          is_read: boolean
          related_id: string | null
          related_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'info' | 'success' | 'warning' | 'error'
          is_read?: boolean
          related_id?: string | null
          related_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'info' | 'success' | 'warning' | 'error'
          is_read?: boolean
          related_id?: string | null
          related_type?: string | null
          created_at?: string
        }
      }
    }
  }
}