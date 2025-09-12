import { 
  Discount, 
  DiscountCreate, 
  DiscountComment, 
  DashboardSummary 
} from '../types/discount';

const API_BASE_URL = 'http://localhost:8000/api';

class DiscountService {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  // دریافت تمام تخفیفات
  async getDiscounts(options?: { mine?: boolean }): Promise<Discount[]> {
    const params = new URLSearchParams();
    if (options?.mine) {
      params.append('mine', 'true');
    }
    const url = `${API_BASE_URL}/discounts/discounts/${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('خطا در دریافت تخفیفات');
    }

    const data = await response.json();
    return data.results || data;
  }

  // دریافت یک تخفیف
  async getDiscount(id: number): Promise<Discount> {
    console.log('discountService.getDiscount called with id:', id);
    const url = `${API_BASE_URL}/discounts/discounts/${id}/`;
    console.log('Request URL:', url);
    console.log('Headers:', this.getAuthHeaders());
    
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error('خطا در دریافت تخفیف');
    }

    const data = await response.json();
    console.log('Response data:', data);
    return data;
  }

  // ایجاد تخفیف جدید
  async createDiscount(discount: DiscountCreate): Promise<Discount> {
    const response = await fetch(`${API_BASE_URL}/discounts/discounts/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(discount),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'خطا در ایجاد تخفیف');
    }

    return response.json();
  }

  // ویرایش تخفیف
  async updateDiscount(id: number, discount: Partial<DiscountCreate>): Promise<Discount> {
    const response = await fetch(`${API_BASE_URL}/discounts/discounts/${id}/`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(discount),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'خطا در ویرایش تخفیف');
    }

    return response.json();
  }

  // حذف تخفیف
  async deleteDiscount(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/discounts/discounts/${id}/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('خطا در حذف تخفیف');
    }
  }

  // امتیازدهی
  async rateDiscount(id: number, score: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/discounts/discounts/${id}/rate/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ score }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'خطا در ثبت امتیاز');
    }
  }

  // دریافت نظرات
  async getComments(discountId: number): Promise<DiscountComment[]> {
    console.log('discountService.getComments called with discountId:', discountId);
    const url = `${API_BASE_URL}/discounts/discounts/${discountId}/comments/`;
    console.log('Comments request URL:', url);
    
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    console.log('Comments response status:', response.status);
    console.log('Comments response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Comments response error:', errorText);
      throw new Error('خطا در دریافت نظرات');
    }

    const data = await response.json();
    console.log('Comments response data:', data);
    return data;
  }

  // ثبت نظر
  async addComment(discountId: number, comment: string): Promise<DiscountComment> {
    const response = await fetch(`${API_BASE_URL}/discounts/discounts/${discountId}/comment/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ comment }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'خطا در ثبت نظر');
    }

    return response.json();
  }

  // لایک/آنلایک کردن کامنت
  async likeComment(commentId: number): Promise<{ liked: boolean; likes_count: number; message: string }> {
    const response = await fetch(`${API_BASE_URL}/discounts/comments/${commentId}/like/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'خطا در لایک کردن نظر');
    }

    return response.json();
  }

  // دریافت نظرات اخیر برای داشبورد کسب‌وکار
  async getRecentComments(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/discounts/discounts/recent_comments/`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('خطا در دریافت نظرات اخیر');
    }

    return response.json();
  }

  // گزارش تخلف
  async reportDiscount(discountId: number, reason: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/discounts/discounts/${discountId}/report/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'خطا در ثبت گزارش');
    }
  }

  // خلاصه داشبورد
  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await fetch(`${API_BASE_URL}/discounts/discounts/dashboard_summary/`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('خطا در دریافت خلاصه داشبورد');
    }

    return response.json();
  }
}

export default new DiscountService();
