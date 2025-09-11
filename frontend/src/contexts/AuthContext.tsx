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
  const [isLoading, setIsLoading] = useState(true) // Start with true to check auth on mount

  const clearSession = () => {
    localStorage.removeItem('auth_user')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

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
      clearSession()
    }
  }

  // Check for existing session on mount
  React.useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const savedUser = localStorage.getItem('auth_user')
        const accessToken = localStorage.getItem('access_token')
        
        if (savedUser && accessToken) {
          // Validate the token by making a profile request
          console.log('Validating existing session...')
          const response = await apiService.getProfile()
          
          if (response.data) {
            // Token is valid, update user data from server
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
            console.log('Session validated successfully')
          } else {
            // Token is invalid or expired, try to refresh
            console.log('Token validation failed, attempting refresh...')
            const refreshToken = localStorage.getItem('refresh_token')
            
            if (refreshToken) {
              const refreshSuccess = await apiService.refreshToken()
              if (refreshSuccess) {
                // Try again after refresh
                const retryResponse = await apiService.getProfile()
                if (retryResponse.data) {
                  const apiUser = retryResponse.data.user
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
                  console.log('Session refreshed successfully')
                } else {
                  console.log('Profile failed after refresh, clearing session and redirecting to login')
                  clearSession()
                  // Force redirect to login
                  setTimeout(() => {
                    window.location.href = '/auth/login'
                  }, 100)
                }
              } else {
                console.log('Token refresh failed, clearing session and redirecting to login')
                clearSession()
                // Force redirect to login
                setTimeout(() => {
                  window.location.href = '/auth/login'
                }, 100)
              }
            } else {
              console.log('No refresh token available, clearing session and redirecting to login')
              clearSession()
              // Force redirect to login
              setTimeout(() => {
                window.location.href = '/auth/login'
              }, 100)
            }
          }
        } else {
          console.log('No saved session found')
          setUser(null)
        }
      } catch (error) {
        console.error('Error validating session:', error)
        clearSession()
      } finally {
        setIsLoading(false)
      }
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
