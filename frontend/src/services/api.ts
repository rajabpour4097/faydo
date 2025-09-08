// API configuration and utilities
const API_BASE_URL = 'http://localhost:8000/api'

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
}

export interface AuthTokens {
  access: string
  refresh: string
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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    if (this.accessToken && !endpoint.includes('/auth/')) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.accessToken}`,
      }
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
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

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('/accounts/auth/profile/')
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
}

export const apiService = new ApiService()
