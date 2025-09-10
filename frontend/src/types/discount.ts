export interface Discount {
  id: number;
  title: string;
  description?: string;
  percentage: number;
  start_date: string;
  end_date: string;
  business: number;
  business_name?: string;
  average_score: number;
  total_scores: number;
  is_active: boolean;
  time_remaining: number;
  can_comment: boolean;
  user_score?: number;
  user_comment?: string;
  created_at: string;
  modified_at: string;
}

export interface DiscountCreate {
  title: string;
  description?: string;
  percentage: number;
  start_date: string;
  end_date: string;
}

export interface DiscountScore {
  id: number;
  score: number;
  user_name: string;
  created_at: string;
}

export interface DiscountComment {
  id: number;
  comment: string;
  user_name: string;
  user_avatar?: string;
  created_at: string;
}

export interface DiscountReport {
  reason: string;
}

export interface DiscountSummary {
  id: number;
  title: string;
  percentage: number;
  start_date: string;
  end_date: string;
  average_score: number;
  total_comments: number;
  is_active: boolean;
}

export interface DashboardSummary {
  total_discounts: number;
  active_discounts: number;
  expired_discounts: number;
  recent_discounts: DiscountSummary[];
}
