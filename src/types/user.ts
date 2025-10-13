export interface UserProfile {
  id: string
  email: string
  full_name: string
  created_at?: string
  trial_used?: boolean
  subscription_status?: string | null
  subscription_id?: string | null
  stripe_customer_id?: string | null
  subscription_end_date?: string | null
}
