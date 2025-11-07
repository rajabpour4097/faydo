import { API_BASE_URL } from './api'

export interface BusinessInfo {
  business_id: number
  business_name: string
  business_logo: string | null
  business_description: string
  has_active_package: boolean
  discount_all_percentage: number | null
  has_specific_discount: boolean
  specific_discount_title: string | null
  specific_discount_percentage: number | null
  has_elite_gift: boolean
  elite_gift_title: string | null
  elite_gift_description: string | null
  customer_points: number
  customer_vip_status: string
  elite_gift_target_reached: boolean
  elite_gift_used: boolean
  can_use_elite_gift: boolean
  can_use_vip: boolean
  can_use_vip_plus: boolean
}

export interface TransactionCreate {
  business: number
  original_amount: number
  has_special_discount: boolean
  special_discount_title?: string
  special_discount_original_amount?: number
  note?: string
}

export interface Transaction {
  id: number
  customer: number
  customer_name: string
  business: number
  business_name: string
  package: number
  loyalty: number
  original_amount: string
  discount_all_amount: string
  has_special_discount: boolean
  special_discount_title: string | null
  special_discount_original_amount: string
  special_discount_amount: string
  final_amount: string
  points_earned: number
  status: 'pending' | 'approved' | 'rejected'
  note: string | null
  created_at: string
  modified_at: string
}

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('access_token')
  if (token) {
    return { Authorization: `Bearer ${token}` }
  }
  return {}
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'خطا در ارتباط با سرور' }))
    throw error
  }
  return response.json()
}

export const loyaltyService = {
  /**
   * دریافت اطلاعات کسب‌وکار با کد یکتا
   */
  async getBusinessByCode(code: string | number): Promise<BusinessInfo> {
    const response = await fetch(`${API_BASE_URL}/loyalty/business-by-code/?code=${code}`, {
      headers: getAuthHeader()
    })
    return handleResponse(response)
  },

  /**
   * ایجاد تراکنش جدید
   */
  async createTransaction(data: TransactionCreate): Promise<Transaction> {
    const response = await fetch(`${API_BASE_URL}/loyalty/transactions/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  /**
   * دریافت لیست تراکنش‌های مشتری
   */
  async getCustomerTransactions(): Promise<Transaction[]> {
    const response = await fetch(`${API_BASE_URL}/loyalty/transactions/`, {
      headers: getAuthHeader()
    })
    return handleResponse(response)
  },

  /**
   * دریافت جزئیات یک تراکنش
   */
  async getTransaction(id: number): Promise<Transaction> {
    const response = await fetch(`${API_BASE_URL}/loyalty/transactions/${id}/`, {
      headers: getAuthHeader()
    })
    return handleResponse(response)
  }
}
