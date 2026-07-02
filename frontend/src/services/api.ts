// API configuration and utilities
// Handle Docker/production environment
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:8001/api'
  
  const hostname = window.location.hostname
  const protocol = window.location.protocol
  const port = window.location.port
  
  // In Docker/production: use same origin with /api path (Nginx proxies to backend)
  // Port 8001 or 443 means we're behind Nginx reverse proxy
  if (port === '8001' || port === '443' || port === '') {
    return `${protocol}//${hostname}${port ? ':' + port : ''}/api`
  }
  
  // Local development: direct connection to backend on port 8001
  return `${protocol}//${hostname}:8001/api`
}

const getMediaBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:8001'
  
  const hostname = window.location.hostname
  const protocol = window.location.protocol
  const port = window.location.port
  
  // In Docker/production: use same origin (Nginx serves media)
  if (port === '8001' || port === '443' || port === '') {
    return `${protocol}//${hostname}${port ? ':' + port : ''}`
  }
  
  // Local development: direct connection to backend
  return `${protocol}//${hostname}:8001`
}

// Always use runtime detection (ignore build-time env vars)
export const API_BASE_URL = getApiBaseUrl()

// Base URL for media files (without /api)
export const MEDIA_BASE_URL = getMediaBaseUrl()

/**
 * تبدیل URL نسبی عکس به URL کامل
 * @param imageUrl - URL نسبی که از API می‌آید (مثل /media/business_logos/logo.jpg)
 * @returns URL کامل با دامنه سرور
 */
export const getFullImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return ''
  
  // اگر URL از قبل کامل است (شروع با http/https)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  
  // اگر URL با / شروع نمی‌شود، آن را اضافه کن
  const normalizedUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
  
  return `${MEDIA_BASE_URL}${normalizedUrl}`
}

export interface ApiResponse<T> {
  data?: T
  message?: string
  error?: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  phone_number: string
  role: 'customer' | 'business' | 'admin' | 'it_manager' | 'project_manager' | 'supporter' | 'financial_manager'
  image?: string
  date_joined: string
  last_login?: string
  display_name?: string
}

export interface CustomerProfile {
  id: number
  user: User
  gender: 'male' | 'female' | ''
  birth_date: string
  membership_level: 'bronze' | 'silver' | 'gold' | 'vip'
  points: number
  active_score?: number
  last_activity_date?: string | null
  address: string
  city: any
  city_id?: number
  is_profile_complete: boolean
}

export interface BusinessProfile {
  id: number
  user: User
  name: string
  description: string
  address: string
  rating_avg: number
  business_location_latitude?: number
  business_location_longitude?: number
  business_phone?: string
  category?: any
  city: any
  instagram_link?: string
  website_link?: string
  is_profile_complete: boolean
  unique_code?: string
  // امتیاز و نظرات
  average_rating?: number
  total_comments?: number
}

export interface ClubItem {
  id: number
  name: string
  description?: string
  icon?: string
}

export interface ServiceCategoryItem {
  id: number
  name: string
  description?: string
  parent?: number | null
  club?: number | null
  club_detail?: ClubItem | null
}

export interface Province {
  id: number
  name: string
}

export interface City {
  id: number
  name: string
  province: Province
}

export interface ProfileData {
  user: User
  profile: CustomerProfile | BusinessProfile | null
  role: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

// Package related interfaces
export interface VipExperienceCategory {
  id: number
  vip_type: 'VIP' | 'VIP+'
  category: number
  category_name?: string
  club_id?: number | null
  club_name?: string | null
  name: string
  description?: string
  created_at?: string
  modified_at?: string
}

export interface Package {
  id: number
  business_id: number
  business_name: string
  is_active: boolean
  start_date?: string
  end_date?: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  status_display: string
  is_complete: boolean
  created_at: string
  modified_at: string
  discount_all?: DiscountAll
  specific_discount?: SpecificDiscount
  elite_gift?: EliteGift
  experiences?: VipExperience[]
  // فیلدهای جدید از PackageListSerializer
  discount_percentage?: number
  specific_discount_title?: string
  specific_discount_percentage?: number
  specific_discount_description?: string
  elite_gift_title?: string
  elite_gift_gift?: string
  elite_gift_amount?: number
  elite_gift_count?: number
  vip_experiences_count?: number
  has_vip?: boolean
  has_vip_plus?: boolean
  days_remaining?: number
  // امتیاز و نظرات
  average_rating?: number
  total_comments?: number
  // فیلدهای کسب‌وکار
  business_logo?: string
  business_image?: string
  gallery_images?: string[]
  business_location_latitude?: number
  business_location_longitude?: number
  business_category?: {
    id: number
    name: string
    icon?: string
  }
  city?: { id: number; name: string }
}

export interface DiscountAll {
  id: number
  percentage: number
  score: number
  comments: Comment[]
  created_at: string
  modified_at: string
}

export interface SpecificDiscount {
  id: number
  percentage: number
  title?: string
  description?: string
  score: number
  comments: Comment[]
  created_at: string
  modified_at: string
}

export interface EliteGift {
  id: number
  amount?: number
  count?: number
  gift: string
  score: number
  comments: Comment[]
  created_at: string
  modified_at: string
}

// (merged into the VipExperienceCategory interface above)

export interface VipExperience {
  id: number
  vip_experience_category: VipExperienceCategory
  vip_experience_category_id: number
  description?: string
  score: number
  comments: Comment[]
  created_at: string
  modified_at: string
}

export interface Comment {
  id: number
  text: string
  user_name: string
  user_last_name: string
  created_at: string
  likes_count: number
  is_liked: boolean
}

export interface EliteGiftClaim {
  id: number
  customer: number
  customer_name: string
  elite_gift: number
  gift_name: string
  package: number
  business: number
  business_name: string
  progress_at_claim: {
    type: 'amount' | 'count'
    target: number
    current: number
    remaining: number
    percentage: number
    eligible: boolean
    transactions_count: number
    approved_claims: number
    total_deducted: number
  }
  status: 'pending' | 'approved' | 'rejected' | 'used'
  status_display: string
  approved_at: string | null
  used_at: string | null
  business_note: string | null
  created_at: string
  modified_at: string
}

export interface EliteGiftProgress {
  type: 'amount' | 'count'
  target: number
  current: number
  remaining: number
  percentage: number
  eligible: boolean
  transactions_count: number
  error?: string
  gift_name?: string
  gift_description?: string
  package_id?: number
  package_start_date?: string
  package_end_date?: string
}

// ─── Points & Tier Interfaces ───────────────────────────────────────

export type MembershipLevel = 'bronze' | 'silver' | 'gold' | 'vip'

export interface TierProgress {
  percent: number
  points_to_next: number
  next_tier: MembershipLevel | null
  current_min: number
  current_max: number | null
}

export interface PointsSummary {
  total_points: number
  points_6months: number
  active_score: number
  active_status: 'active' | 'semi_active' | 'inactive'
  membership_level: MembershipLevel
  expiring_points: number
  tier_progress: TierProgress
  last_activity: string | null
}

export interface PointsEvent {
  id: number
  event_type: string
  event_label: string
  points_delta: number
  active_score_delta: number
  description: string | null
  created_at: string
}

export interface PointsHistoryResponse {
  count: number
  page: number
  total_pages: number
  results: PointsEvent[]
}

// ─────────────────────────────────────────────────────────────────────

// ─── Business Dashboard Interfaces ──────────────────────────────────

export interface BusinessTransaction {
  id: number
  customer: number
  customer_name: string
  business: number
  business_name: string
  package: number | null
  loyalty: number
  original_amount: string
  discount_all_amount: string
  final_amount: string
  points_earned: number
  status: 'pending' | 'approved' | 'rejected'
  note: string | null
  description?: string | null
  transaction_type?: string
  can_comment: boolean
  comment_deadline?: string | null
  has_commented: boolean
  created_at: string
  modified_at: string
}

export interface BusinessLoyalty {
  id: number
  customer: number
  customer_name: string
  business: number
  business_name: string
  points: number
  vip_status: 'none' | 'vip' | 'vip_plus'
  elite_gift_target_reached: boolean
  elite_gift_used: boolean
  created_at: string
  modified_at: string
}

export interface BusinessTransactionsResponse {
  count: number
  next: string | null
  previous: string | null
  results: BusinessTransaction[]
}

// ─────────────────────────────────────────────────────────────────────

export interface BusinessGalleryImage {
  id: number
  image: string
  image_url: string
  title?: string
  description?: string
  is_featured: boolean
  order: number
  created_at: string
}

export interface PackageCreateRequest {
  business: number
  is_active?: boolean
  start_date?: string
  end_date?: string
  status?: 'draft' | 'pending' | 'approved' | 'rejected'
  is_complete?: boolean
  discount_all?: Partial<DiscountAll>
  specific_discount?: Partial<SpecificDiscount>
  elite_gift?: Partial<EliteGift>
  experiences?: Partial<VipExperience>[]
}

export interface LoginRequest {
  username: string
  password: string
}

export interface CustomerRegisterRequest {
  username: string
  email: string
  first_name: string
  last_name: string
  phone_number: string
  password: string
  password_confirm: string
  gender: 'male' | 'female' | ''
  birth_date: string
  address?: string
}

export interface BusinessRegisterRequest {
  username: string
  email: string
  phone_number: string
  password: string
  password_confirm: string
  name: string // Business name
  description?: string
  address?: string
  business_location_latitude?: number
  business_location_longitude?: number
}

export interface AuthResponse {
  message: string
  user: User
  tokens: AuthTokens
}

class ApiService {
  private baseUrl: string
  private accessToken: string | null = null

  constructor() {
    this.baseUrl = API_BASE_URL
    this.accessToken = localStorage.getItem('access_token')
  }

  // Update token from localStorage (in case it changed)
  private updateToken() {
    this.accessToken = localStorage.getItem('access_token')
  }

  private isTokenExpired(): boolean {
    const token = this.accessToken
    if (!token) return true

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      // Check if token expires in next 5 minutes (300 seconds buffer)
      return payload.exp < (currentTime + 300)
    } catch {
      return true
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Update token from localStorage in case it changed
    this.updateToken()
    
    // Check if token is expired and try to refresh before making request
    if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/register') && !endpoint.includes('/auth/refresh')) {
      if (this.isTokenExpired()) {
        console.log('Token is expired, attempting refresh before request...')
        const refreshSuccess = await this.refreshToken()
        if (!refreshSuccess) {
          console.log('Token refresh failed, clearing tokens')
          this.clearTokens()
          return { error: 'نشست شما منقضی شده است. لطفا مجددا وارد شوید.' }
        }
        this.updateToken()
      }
    }
    
    const url = `${this.baseUrl}${endpoint}`
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Add authorization header for protected endpoints (exclude login/register)
    if (this.accessToken && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register') && !endpoint.includes('/auth/refresh')) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.accessToken}`,
      }
    }

    try {
      const response = await fetch(url, config)
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        // If it's a 401 error and we have a refresh token, try to refresh
        if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
          const refreshSuccess = await this.refreshToken()
          if (refreshSuccess) {
            // Retry the request with the new token
            this.updateToken()
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${this.accessToken}`,
            }
            const retryResponse = await fetch(url, config)
            
            if (retryResponse.ok) {
              const retryData = await retryResponse.json()
              return { data: retryData }
            }
          }
        }
        
        // Try to parse error response
        let errorMessage = 'خطا در ارتباط با سرور'
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json()
            errorMessage = errorData.detail || errorData.message || Object.values(errorData).flat().join(', ') || errorMessage
          } else {
            // Server returned HTML error page (like 500 error page)
            const htmlText = await response.text()
            console.error('Server returned HTML error page:', htmlText.substring(0, 200))
            errorMessage = `خطا در سرور (${response.status}): ${response.statusText}`
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          errorMessage = `خطا در سرور (${response.status}): ${response.statusText}`
        }
        
        return { error: errorMessage }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      console.error('API request failed:', error)
      
      // Handle different types of network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return { error: 'خطا در اتصال به سرور. لطفا اتصال اینترنت خود را بررسی کنید.' }
      }
      
      if (error instanceof Error && error.name === 'NetworkError') {
        return { error: 'خطا در شبکه. لطفا اتصال خود را بررسی کنید.' }
      }
      
      return { error: 'خطا در ارتباط با سرور' }
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/accounts/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    if (response.data) {
      this.setTokens(response.data.tokens)
    }

    return response
  }

  async register(userData: CustomerRegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/accounts/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    })

    if (response.data) {
      this.setTokens(response.data.tokens)
    }

    return response
  }

  async businessRegister(userData: BusinessRegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/accounts/auth/register/business/', {
      method: 'POST',
      body: JSON.stringify(userData),
    })

    if (response.data) {
      this.setTokens(response.data.tokens)
    }

    return response
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    const refreshToken = localStorage.getItem('refresh_token')
    const response = await this.request<{ message: string }>('/accounts/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    })

    this.clearTokens()
    return response
  }

  async getProfile(): Promise<ApiResponse<ProfileData>> {
    return this.request<ProfileData>('/accounts/auth/profile/')
  }

  // Profile update methods
  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/accounts/auth/profile/', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  async uploadProfileImage(imageFile: File): Promise<ApiResponse<{ image: string }>> {
    const formData = new FormData()
    formData.append('image', imageFile)
    
    return this.request<{ image: string }>('/accounts/auth/profile/image/', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    })
  }

  async getClubs(): Promise<ApiResponse<ClubItem[]>> {
    const resp = await this.request<any>('/accounts/clubs/')
    if (resp.data) {
      if (Array.isArray(resp.data)) return { data: resp.data as ClubItem[] }
      if (Array.isArray(resp.data.results)) return { data: resp.data.results as ClubItem[] }
    }
    return resp
  }

  async createClub(data: Omit<ClubItem, 'id'>): Promise<ApiResponse<ClubItem>> {
    return this.request<ClubItem>('/accounts/clubs/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateClub(id: number, data: Partial<ClubItem>): Promise<ApiResponse<ClubItem>> {
    return this.request<ClubItem>(`/accounts/clubs/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteClub(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/accounts/clubs/${id}/`, { method: 'DELETE' })
  }

  async getServiceCategories(): Promise<ApiResponse<ServiceCategoryItem[]>> {
    const resp = await this.request<any>('/accounts/service-categories/')
    if (resp.data) {
      // Handle paginated {results: [...]} or direct array
      if (Array.isArray(resp.data)) {
        return { data: resp.data as ServiceCategoryItem[] }
      } else if (Array.isArray(resp.data.results)) {
        return { data: resp.data.results as ServiceCategoryItem[] }
      }
    }
    return resp
  }

  async createServiceCategory(data: Omit<ServiceCategoryItem, 'id' | 'club_detail'>): Promise<ApiResponse<ServiceCategoryItem>> {
    return this.request<ServiceCategoryItem>('/accounts/service-categories/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateServiceCategory(id: number, data: Partial<Omit<ServiceCategoryItem, 'club_detail'>>): Promise<ApiResponse<ServiceCategoryItem>> {
    return this.request<ServiceCategoryItem>(`/accounts/service-categories/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteServiceCategory(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/accounts/service-categories/${id}/`, { method: 'DELETE' })
  }

  async getProvinces(): Promise<ApiResponse<Province[]>> {
    const resp = await this.request<any>('/accounts/locations/provinces/')
    if (resp.data) {
      if (Array.isArray(resp.data)) {
        return { data: resp.data as Province[] }
      } else if (Array.isArray(resp.data.results)) {
        return { data: resp.data.results as Province[] }
      }
    }
    return resp
  }

  async getCitiesByProvince(provinceId: number): Promise<ApiResponse<{ province: Province; cities: City[] }>> {
    return this.request<{ province: Province; cities: City[] }>(`/accounts/locations/provinces/${provinceId}/cities/`)
  }

  async getAllCities(): Promise<ApiResponse<{ id: number; name: string; cities: City[] }[]>> {
    return this.request<{ id: number; name: string; cities: City[] }[]>('/accounts/locations/cities/')
  }

  // Phone verification methods
  async sendOTP(phoneNumber: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/accounts/auth/send-otp/', {
      method: 'POST',
      body: JSON.stringify({ phone_number: phoneNumber }),
    })
  }

  async verifyOTP(phoneNumber: string, otpCode: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/accounts/auth/verify-otp/', {
      method: 'POST',
      body: JSON.stringify({ 
        phone_number: phoneNumber, 
        otp_code: otpCode 
      }),
    })
  }

  async updatePhoneNumber(phoneNumber: string, otpCode: string): Promise<ApiResponse<User>> {
    return this.request<User>('/accounts/auth/profile/phone/', {
      method: 'PUT',
      body: JSON.stringify({ 
        phone_number: phoneNumber, 
        otp_code: otpCode 
      }),
    })
  }

  async updateBusinessProfile(businessData: { business_name?: string; description?: string; address?: string }): Promise<ApiResponse<any>> {
    return this.request<any>('/accounts/auth/profile/business/', {
      method: 'PUT',
      body: JSON.stringify(businessData),
    })
  }

  async updateFullBusinessProfile(data: {
    name?: string
    business_name?: string
    description?: string
    address?: string
    business_phone?: string
    category_id?: number
    city_id?: number
    business_location_latitude?: number
    business_location_longitude?: number
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/accounts/auth/profile/business/', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updateCustomerProfile(customerData: { 
    gender?: string; 
    birth_date?: string; 
    address?: string; 
    city_id?: number;
    city?: { name: string } 
  }): Promise<ApiResponse<ProfileData>> {
    return this.request<ProfileData>('/accounts/auth/profile/customer/', {
      method: 'PUT',
      body: JSON.stringify(customerData),
    })
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) return false

    try {
      const response = await this.request<{ access: string }>('/accounts/auth/refresh/', {
        method: 'POST',
        body: JSON.stringify({ refresh: refreshToken }),
      })

      if (response.data) {
        this.accessToken = response.data.access
        localStorage.setItem('access_token', response.data.access)
        return true
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    }

    return false
  }

  private setTokens(tokens: AuthTokens) {
    this.accessToken = tokens.access
    localStorage.setItem('access_token', tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
  }

  private clearTokens() {
    this.accessToken = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  // Package management methods
  async getPackages(): Promise<ApiResponse<Package[]>> {
    const resp = await this.request<any>('/packages/packages/')
    if (resp.data) {
      if (Array.isArray(resp.data)) {
        return { data: resp.data as Package[] }
      } else if (Array.isArray(resp.data.results)) {
        return { data: resp.data.results as Package[] }
      }
    }
    return resp
  }

  async getPublicPackages(): Promise<ApiResponse<Package[]>> {
    // دریافت پکیج‌های عمومی (فعال و تایید شده) برای صفحه اکتشاف
    const resp = await this.request<any>('/packages/packages/public/')
    if (resp.data) {
      if (Array.isArray(resp.data)) {
        return { data: resp.data as Package[] }
      } else if (Array.isArray(resp.data.results)) {
        return { data: resp.data.results as Package[] }
      }
    }
    return resp
  }

  async getPackage(id: number): Promise<ApiResponse<Package>> {
    return this.request<Package>(`/packages/packages/${id}/`)
  }


  async createPackage(packageData: PackageCreateRequest): Promise<ApiResponse<Package>> {
    console.log('API: Creating package with data:', packageData)
    console.log('API: Current access token:', this.accessToken)
    console.log('API: Is authenticated:', this.isAuthenticated())
    
    const response = await this.request<Package>('/packages/packages/', {
      method: 'POST',
      body: JSON.stringify(packageData),
    })
    
    console.log('API: Create package response:', response)
    return response
  }

  async updatePackage(id: number, packageData: Partial<PackageCreateRequest>): Promise<ApiResponse<Package>> {
    return this.request<Package>(`/packages/packages/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(packageData),
    })
  }

  async deletePackage(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/packages/packages/${id}/`, {
      method: 'DELETE',
    })
  }

  async togglePackageActive(id: number): Promise<ApiResponse<{ id: number; is_active: boolean; message: string }>> {
    return this.request<{ id: number; is_active: boolean; message: string }>(`/packages/packages/${id}/toggle_active/`, {
      method: 'POST',
    })
  }

  async approvePackage(id: number): Promise<ApiResponse<{ id: number; status: string; message: string }>> {
    return this.request<{ id: number; status: string; message: string }>(`/packages/packages/${id}/approve/`, {
      method: 'POST',
    })
  }

  async rejectPackage(id: number): Promise<ApiResponse<{ id: number; status: string; message: string }>> {
    return this.request<{ id: number; status: string; message: string }>(`/packages/packages/${id}/reject/`, {
      method: 'POST',
    })
  }


  async getComments(contentTypeId: number, objectId: number): Promise<ApiResponse<Comment[]>> {
    const resp = await this.request<any>(`/packages/comments/?content_type_id=${contentTypeId}&object_id=${objectId}`)
    if (resp.data) {
      if (Array.isArray(resp.data)) {
        return { data: resp.data as Comment[] }
      } else if (Array.isArray(resp.data.results)) {
        return { data: resp.data.results as Comment[] }
      }
    }
    return resp
  }

  async createComment(text: string, contentTypeId: number, objectId: number): Promise<ApiResponse<Comment>> {
    return this.request<Comment>('/packages/comments/', {
      method: 'POST',
      body: JSON.stringify({
        text,
        content_type: contentTypeId,
        object_id: objectId,
      }),
    })
  }

  async likeComment(commentId: number): Promise<ApiResponse<{ is_liked: boolean; likes_count: number; message: string }>> {
    return this.request<{ is_liked: boolean; likes_count: number; message: string }>(`/packages/comments/${commentId}/like/`, {
      method: 'POST',
    })
  }

  // Business Gallery management methods
  async getBusinessGallery(): Promise<ApiResponse<BusinessGalleryImage[]>> {
    const resp = await this.request<any>('/accounts/business-gallery/')
    if (resp.data) {
      if (Array.isArray(resp.data)) {
        return { data: resp.data as BusinessGalleryImage[] }
      } else if (Array.isArray(resp.data.results)) {
        return { data: resp.data.results as BusinessGalleryImage[] }
      }
    }
    return resp
  }

  async createGalleryImage(imageData: FormData): Promise<ApiResponse<BusinessGalleryImage>> {
    return this.request<BusinessGalleryImage>('/accounts/business-gallery/', {
      method: 'POST',
      body: imageData,
      headers: {
        // Don't set Content-Type, let browser set it with boundary for FormData
      }
    })
  }

  async updateGalleryImage(id: number, imageData: Partial<BusinessGalleryImage>): Promise<ApiResponse<BusinessGalleryImage>> {
    return this.request<BusinessGalleryImage>(`/accounts/business-gallery/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(imageData)
    })
  }

  async deleteGalleryImage(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/accounts/business-gallery/${id}/`, {
      method: 'DELETE'
    })
  }

  async getBusinessGalleryByBusinessId(businessId: number): Promise<ApiResponse<BusinessGalleryImage[]>> {
    const resp = await this.request<any>(`/accounts/business-gallery/by_business/?business_id=${businessId}`)
    if (resp.data) {
      if (Array.isArray(resp.data)) {
        return { data: resp.data as BusinessGalleryImage[] }
      } else if (Array.isArray(resp.data.results)) {
        return { data: resp.data.results as BusinessGalleryImage[] }
      }
    }
    return resp
  }

  // Stepwise package creation methods
  async savePackageDiscounts(packageId: number, discountAll: { percentage: number }, specificDiscount?: { title: string; description?: string; percentage: number }, removeSpecific?: boolean): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/packages/packages/${packageId}/discounts/`, {
      method: 'POST',
      body: JSON.stringify({
        discount_all: discountAll,
        specific_discount: specificDiscount,
        remove_specific: removeSpecific || false,
      }),
    })
  }

  async savePackageLoyalGift(packageId: number, gift: string, amount?: number, count?: number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/packages/packages/${packageId}/loyal_gift/`, {
      method: 'POST',
      body: JSON.stringify({
        gift,
        amount,
        count,
      }),
    })
  }

  async savePackageVip(
    packageId: number,
    experiences: { category_id: number; description: string }[]
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/packages/packages/${packageId}/vip/`, {
      method: 'POST',
      body: JSON.stringify({ experiences }),
    })
  }

  async finalizePackage(packageId: number, durationMonths: number, agree: boolean): Promise<ApiResponse<{ message: string; id: number; start_date: string; end_date: string; status: string }>> {
    return this.request<{ message: string; id: number; start_date: string; end_date: string; status: string }>(`/packages/packages/${packageId}/finalize/`, {
      method: 'POST',
      body: JSON.stringify({
        duration_months: durationMonths,
        agree,
      }),
    })
  }

  async getPackageStatus(packageId: number): Promise<ApiResponse<{
    id: number;
    is_complete: boolean;
    status: string;
    has_discount_all: boolean;
    has_elite_gift: boolean;
    has_vip_experiences: boolean;
    has_dates: boolean;
    discount_all: number | null;
    specific_discount: { title: string; percentage: number; description: string } | null;
    elite_gift: { gift: string; amount: number | null; count: number | null } | null;
    vip_experiences: { id: number; name: string; vip_type: string; description?: string }[];
  }>> {
    return this.request(`/packages/packages/${packageId}/status/`)
  }

  async getVipExperienceCategories(clubId?: number): Promise<ApiResponse<VipExperienceCategory[]>> {
    const endpoint = clubId
      ? `/packages/vip-experiences/?club_id=${clubId}`
      : '/packages/vip-experiences/'
    const response = await this.request<any>(endpoint)
    if (response.error) return response
    if (response.data) {
      if (Array.isArray(response.data)) {
        return { ...response, data: response.data as VipExperienceCategory[] }
      }
      if (Array.isArray(response.data.results)) {
        return { ...response, data: response.data.results as VipExperienceCategory[] }
      }
    }
    return { ...response, data: [] }
  }

  async getVipExperienceCategoriesByClub(clubId: number): Promise<ApiResponse<VipExperienceCategory[]>> {
    const response = await this.request<any>(`/packages/vip-experiences/?club_id=${clubId}`)
    if (response.data && Array.isArray(response.data)) return { data: response.data }
    if (response.data && response.data.results) return { data: response.data.results }
    return response
  }

  // Get business comments
  async getBusinessComments(businessId: number): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/packages/packages/business/${businessId}/comments/`)
  }

  // QR Code verification
  async verifyQRCode(uniqueCode: string): Promise<ApiResponse<{ success: boolean; business: BusinessProfile }>> {
    return this.request<{ success: boolean; business: BusinessProfile }>('/accounts/qr/verify/', {
      method: 'POST',
      body: JSON.stringify({
        unique_code: uniqueCode,
      }),
    })
  }

  // Elite Gift Progress
  async getEliteGiftProgress(packageId: number): Promise<ApiResponse<EliteGiftProgress>> {
    return this.request<EliteGiftProgress>(`/loyalty/elite-gift-progress/${packageId}/`)
  }

  // Elite Gift Claim
  async createEliteGiftClaim(packageId: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/loyalty/elite-gift-claims/`, {
      method: 'POST',
      body: JSON.stringify({ package_id: packageId })
    })
  }

  // Get all Elite Gift Claims (filtered by user role)
  async getEliteGiftClaims(): Promise<ApiResponse<EliteGiftClaim[]>> {
    return this.request<EliteGiftClaim[]>(`/loyalty/elite-gift-claims/`)
  }

  // Approve Elite Gift Claim
  async approveEliteGiftClaim(claimId: number, note?: string): Promise<ApiResponse<EliteGiftClaim>> {
    return this.request<EliteGiftClaim>(`/loyalty/elite-gift-claims/${claimId}/approve/`, {
      method: 'POST',
      body: JSON.stringify({ note })
    })
  }

  // Reject Elite Gift Claim
  async rejectEliteGiftClaim(claimId: number, note?: string): Promise<ApiResponse<EliteGiftClaim>> {
    return this.request<EliteGiftClaim>(`/loyalty/elite-gift-claims/${claimId}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ note })
    })
  }

  // ─── Points & Tier ───────────────────────────────────────────────

  async getPointsSummary(): Promise<ApiResponse<PointsSummary>> {
    return this.request<PointsSummary>('/loyalty/points-summary/')
  }

  async getPointsHistory(page = 1, pageSize = 20): Promise<ApiResponse<PointsHistoryResponse>> {
    return this.request<PointsHistoryResponse>(`/loyalty/points-history/?page=${page}&page_size=${pageSize}`)
  }

  async awardStoryShare(): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/loyalty/story-share/', { method: 'POST' })
  }

  async awardFavoriteBusiness(businessId: number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/loyalty/favorite/', {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId }),
    })
  }

  // ─── Business Dashboard ────────────────────────────────────────────

  async getTransactions(params?: { status?: string; page?: number; page_size?: number }): Promise<ApiResponse<BusinessTransactionsResponse>> {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.page) qs.set('page', String(params.page))
    if (params?.page_size) qs.set('page_size', String(params.page_size))
    const query = qs.toString() ? `?${qs}` : ''
    return this.request<BusinessTransactionsResponse>(`/loyalty/transactions/${query}`)
  }

  async approveTransaction(transactionId: number): Promise<ApiResponse<BusinessTransaction>> {
    return this.request<BusinessTransaction>(`/loyalty/transactions/${transactionId}/approve/`, {
      method: 'POST',
    })
  }

  async rejectTransaction(transactionId: number, note?: string): Promise<ApiResponse<BusinessTransaction>> {
    return this.request<BusinessTransaction>(`/loyalty/transactions/${transactionId}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    })
  }

  async getLoyalties(): Promise<ApiResponse<BusinessLoyalty[]>> {
    const resp = await this.request<any>('/loyalty/loyalties/')
    if (resp.data) {
      if (Array.isArray(resp.data)) return { data: resp.data }
      if (Array.isArray(resp.data.results)) return { data: resp.data.results }
    }
    return resp
  }

  // ─── Password Management ───────────────────────────────────────────
  async checkHasPassword(): Promise<ApiResponse<{ has_password: boolean }>> {
    return this.request<{ has_password: boolean }>('/accounts/auth/set-password/')
  }

  async setPassword(data: {
    new_password: string
    confirm_password: string
    current_password?: string
  }): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/accounts/auth/set-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

export const apiService = new ApiService()

