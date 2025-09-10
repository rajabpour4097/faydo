import React, { createContext, useContext, useState, ReactNode } from 'react'
import { apiService } from '../services/api'

interface User {
  id: number
  name: string
  email: string
  type: 'customer' | 'business' | 'admin' | 'it_manager' | 'project_manager' | 'supporter' | 'financial_manager'
  avatar?: string
  username: string
  phone_number: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>
  registerCustomer: (userData: CustomerRegisterData) => Promise<{ success: boolean; error?: string }>
  registerBusiness: (userData: BusinessRegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
}

interface CustomerRegisterData {
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

interface BusinessRegisterData {
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

//Remove unused type
//type RegisterData = CustomerRegisterData | BusinessRegisterData

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    setIsLoading(true)
    
    try {
      const response = await apiService.login({ username, password })
      
      if (response.data) {
        const apiUser = response.data.user
        const mappedUser: User = {
          id: apiUser.id,
          name: `${apiUser.first_name} ${apiUser.last_name}`.trim() || apiUser.username,
          email: apiUser.email,
          type: apiUser.role,
          avatar: apiUser.image,
          username: apiUser.username,
          phone_number: apiUser.phone_number
        }
        
        setUser(mappedUser)
        localStorage.setItem('auth_user', JSON.stringify(mappedUser))
        return { success: true, user: mappedUser }
      } else {
        return { success: false, error: response.error || 'خطا در ورود' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'خطا در ارتباط با سرور' }
    } finally {
      setIsLoading(false)
    }
  }

  const registerCustomer = async (userData: CustomerRegisterData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    try {
      console.log('Attempting customer registration with data:', userData)
      const response = await apiService.register(userData)
      console.log('Registration response:', response)
      
      if (response.data) {
        const apiUser = response.data.user
        const mappedUser: User = {
          id: apiUser.id,
          name: `${userData.first_name} ${userData.last_name}`.trim() || apiUser.username,
          email: apiUser.email,
          type: apiUser.role,
          avatar: apiUser.image,
          username: apiUser.username,
          phone_number: apiUser.phone_number
        }
        
        setUser(mappedUser)
        localStorage.setItem('auth_user', JSON.stringify(mappedUser))
        return { success: true }
      } else {
        console.error('Registration failed:', response.error)
        return { success: false, error: response.error || 'خطا در ثبت نام' }
      }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: 'خطا در ارتباط با سرور' }
    } finally {
      setIsLoading(false)
    }
  }

  const registerBusiness = async (userData: BusinessRegisterData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    try {
      console.log('Attempting business registration with data:', userData)
      const response = await apiService.businessRegister(userData)
      console.log('Registration response:', response)
      
      if (response.data) {
        const apiUser = response.data.user
        const mappedUser: User = {
          id: apiUser.id,
          name: userData.name || apiUser.username,
          email: apiUser.email,
          type: apiUser.role,
          avatar: apiUser.image,
          username: apiUser.username,
          phone_number: apiUser.phone_number
        }
        
        setUser(mappedUser)
        localStorage.setItem('auth_user', JSON.stringify(mappedUser))
        return { success: true }
      } else {
        console.error('Registration failed:', response.error)
        return { success: false, error: response.error || 'خطا در ثبت نام' }
      }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: 'خطا در ارتباط با سرور' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await apiService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('auth_user')
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  }

  // Check for existing session on mount
  React.useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true)
      const savedUser = localStorage.getItem('auth_user')
      const accessToken = localStorage.getItem('access_token')
      
      if (savedUser && accessToken) {
        try {
          const parsedUser = JSON.parse(savedUser)
          // Just restore the user from localStorage, token validation will happen when API calls are made
          setUser(parsedUser)
        } catch (error) {
          console.error('Error parsing saved user:', error)
          localStorage.removeItem('auth_user')
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
      }
      setIsLoading(false)
    }

    checkAuthStatus()
  }, [])

  const value: AuthContextType = {
    user,
    login,
    registerCustomer,
    registerBusiness,
    logout,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
