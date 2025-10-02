// API configuration and utilities
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8000/api`

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
  membership_level: 'bronze' | 'silver' | 'vip'
  points: number
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
}

export interface ServiceCategoryItem {
  id: number
  name: string
  description?: string
  parent?: number | null
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
export interface Package {
  id: number
  business_name: string
  is_active: boolean
  start_date?: string
  end_date?: string
  status: 'pending' | 'approved' | 'rejected'
  status_display: string
  is_complete: boolean
  created_at: string
  modified_at: string
  discount_all?: DiscountAll
  specific_discount?: SpecificDiscount
  elite_gift?: EliteGift
  experiences?: VipExperience[]
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

export interface VipExperienceCategory {
  id: number
  vip_type: 'VIP' | 'VIP+'
  category_name: string
  name: string
  description?: string
  created_at: string
  modified_at: string
}

export interface VipExperience {
  id: number
  vip_experience_category: VipExperienceCategory
  vip_experience_category_id: number
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

export interface PackageCreateRequest {
  business: number
  is_active?: boolean
  start_date?: string
  end_date?: string
  status?: 'pending' | 'approved' | 'rejected'
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
  gender: 'male' | 'female'
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
      const data = await response.json()

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
            const retryData = await retryResponse.json()
            
            if (retryResponse.ok) {
              return { data: retryData }
            }
          }
        }
        
        return { error: data.detail || data.message || Object.values(data).flat().join(', ') || 'خطا در ارتباط با سرور' }
      }

      return { data }
    } catch (error) {
      console.error('API request failed:', error)
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

  async getPackage(id: number): Promise<ApiResponse<Package>> {
    return this.request<Package>(`/packages/packages/${id}/`)
  }

  async createPackage(packageData: PackageCreateRequest): Promise<ApiResponse<Package>> {
    return this.request<Package>('/packages/packages/', {
      method: 'POST',
      body: JSON.stringify(packageData),
    })
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

  async getVipExperienceCategories(): Promise<ApiResponse<VipExperienceCategory[]>> {
    const resp = await this.request<any>('/packages/vip-experience-categories/')
    if (resp.data) {
      if (Array.isArray(resp.data)) {
        return { data: resp.data as VipExperienceCategory[] }
      } else if (Array.isArray(resp.data.results)) {
        return { data: resp.data.results as VipExperienceCategory[] }
      }
    }
    return resp
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
}

export const apiService = new ApiService()
