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
  display_name?: string
  isProfileComplete?: boolean
  first_name?: string
  last_name?: string
  profile?: {
    gender?: 'male' | 'female' | ''
    birth_date?: string
    city?: any
    address?: string
  }
  businessProfile?: {
    name?: string
    business_phone?: string
    category?: any
    address?: string
    city?: any
    business_location_latitude?: number
    business_location_longitude?: number
  }
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>
  registerCustomer: (userData: CustomerRegisterData) => Promise<{ success: boolean; error?: string }>
  registerBusiness: (userData: BusinessRegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateUser: (userData: Partial<User>) => Promise<boolean>
  refreshProfile: () => Promise<void>
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
  gender: 'male' | 'female' | ''
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

  // Helper function to normalize phone number display
  const normalizePhone = (phone: string): string => {
    return phone || ''
  }

  const clearSession = () => {
    localStorage.removeItem('auth_user')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    setIsLoading(true)
    
    try {
      // Test users for dashboard testing (without backend)
      const testUsers: Record<string, User> = {
        'business': {
          id: 1,
          name: 'رستوران گلستان',
          email: 'business@test.com',
          type: 'business',
          username: 'business',
          phone_number: '09123456789'
        },
        'customer': {
          id: 2,
          name: 'احمد محمدی',
          email: 'customer@test.com',
          type: 'customer',
          username: 'customer',
          phone_number: '09123456788'
        },
        'admin': {
          id: 3,
          name: 'مدیر سیستم',
          email: 'admin@test.com',
          type: 'it_manager',
          username: 'admin',
          phone_number: '09123456787'
        }
      }

      // Check for test users first
      if (testUsers[username] && password === 'test123') {
        const testUser = testUsers[username]
        setUser(testUser)
        localStorage.setItem('auth_user', JSON.stringify(testUser))
        // Store fake tokens for test
        localStorage.setItem('access_token', 'test_access_token')
        localStorage.setItem('refresh_token', 'test_refresh_token')
        return { success: true, user: testUser }
      }

      // If not a test user, try real API
      const response = await apiService.login({ username, password })
      
      if (response.data) {
        const apiUser = response.data.user
        const mappedUser: User = {
          id: apiUser.id,
          name: apiUser.display_name || `${apiUser.first_name} ${apiUser.last_name}`.trim() || apiUser.username,
          email: apiUser.email,
          type: apiUser.role,
          avatar: apiUser.image,
          username: apiUser.username,
          phone_number: apiUser.phone_number,
          display_name: apiUser.display_name,
          first_name: apiUser.first_name,
          last_name: apiUser.last_name
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
          name: apiUser.display_name || `${apiUser.first_name} ${apiUser.last_name}`.trim() || apiUser.username,
          email: apiUser.email,
          type: apiUser.role,
          avatar: apiUser.image,
          username: apiUser.username,
          phone_number: apiUser.phone_number,
          display_name: apiUser.display_name,
          first_name: apiUser.first_name,
          last_name: apiUser.last_name
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
          name: apiUser.display_name || userData.name || apiUser.username,
          email: apiUser.email,
          type: apiUser.role,
          avatar: apiUser.image,
          username: apiUser.username,
          phone_number: apiUser.phone_number,
          display_name: apiUser.display_name,
          first_name: apiUser.first_name,
          last_name: apiUser.last_name
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

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    if (!user) return false
    
    try {
      // If only updating avatar, just update local state without API call
      if (Object.keys(userData).length === 1 && userData.avatar) {
        const updatedUser: User = {
          ...user,
          avatar: userData.avatar
        }
        setUser(updatedUser)
        localStorage.setItem('auth_user', JSON.stringify(updatedUser))
        return true
      }

      // If updating profile fields for customer, use the customer profile endpoint
      if (user.type === 'customer' && userData.profile) {
        const profileData = {
          gender: userData.profile.gender,
          birth_date: userData.profile.birth_date,
          address: userData.profile.address,
          city: userData.profile.city
        }
        
        const response = await apiService.updateCustomerProfile(profileData)
        if (response.data) {
          // Update user with full response data
          const apiUser = response.data.user
          const profile = response.data.profile
          
          const mappedUser: User = {
            id: apiUser.id,
            name: apiUser.display_name || `${apiUser.first_name} ${apiUser.last_name}`.trim() || apiUser.username,
            email: apiUser.email,
            type: apiUser.role,
            avatar: apiUser.image,
            username: apiUser.username,
            phone_number: normalizePhone(apiUser.phone_number),
            display_name: apiUser.display_name,
            first_name: apiUser.first_name,
            last_name: apiUser.last_name,
            profile: apiUser.role === 'customer' && profile && 'gender' in profile ? {
              gender: profile.gender,
              birth_date: profile.birth_date,
              city: profile.city,
              address: profile.address
            } : undefined,
            businessProfile: apiUser.role === 'business' && profile && 'name' in profile ? {
              name: profile.name,
              business_phone: profile.business_phone,
              category: profile.category,
              address: profile.address,
              city: profile.city,
              business_location_latitude: profile.business_location_latitude,
              business_location_longitude: profile.business_location_longitude
            } : undefined,
            isProfileComplete: apiUser.role === 'customer' ? 
              (profile && 'is_profile_complete' in profile ? profile.is_profile_complete : false) : 
              (apiUser.role === 'business' ? 
                (profile && 'is_profile_complete' in profile ? profile.is_profile_complete : false) : true)
          }
          
          setUser(mappedUser)
          localStorage.setItem('auth_user', JSON.stringify(mappedUser))
          return true
        }
        return false
      } else {
        // Update regular user fields
        const response = await apiService.updateProfile(userData)
        if (response.data) {
          // Update user with response data to get updated name
          const updatedApiUser = response.data
          const updatedUser: User = {
            ...user,
            first_name: updatedApiUser.first_name,
            last_name: updatedApiUser.last_name,
            email: updatedApiUser.email,
            phone_number: updatedApiUser.phone_number,
            name: updatedApiUser.display_name || `${updatedApiUser.first_name} ${updatedApiUser.last_name}`.trim() || updatedApiUser.username,
            display_name: updatedApiUser.display_name,
            avatar: updatedApiUser.image, // Add image field update
            ...userData
          }
          setUser(updatedUser)
          localStorage.setItem('auth_user', JSON.stringify(updatedUser))
          return true
        }
        return false
      }
    } catch (error) {
      console.error('Error updating user:', error)
      return false
    }
  }

  const refreshProfile = async () => {
    try {
      const response = await apiService.getProfile()
      if (response.data) {
        const apiUser = response.data.user
        const profile = response.data.profile
        
        const mappedUser: User = {
          id: apiUser.id,
          name: apiUser.display_name || `${apiUser.first_name} ${apiUser.last_name}`.trim() || apiUser.username,
          email: apiUser.email,
          type: apiUser.role,
          avatar: apiUser.image,
          username: apiUser.username,
          phone_number: normalizePhone(apiUser.phone_number),
          display_name: apiUser.display_name,
          first_name: apiUser.first_name,
          last_name: apiUser.last_name,
          profile: apiUser.role === 'customer' && profile && 'gender' in profile ? {
            gender: profile.gender || '', // Convert null/undefined to empty string
            birth_date: profile.birth_date,
            city: profile.city,
            address: profile.address
          } : undefined,
          businessProfile: apiUser.role === 'business' && profile && 'name' in profile ? {
            name: profile.name,
            business_phone: profile.business_phone,
            category: profile.category,
            address: profile.address,
            city: profile.city,
            business_location_latitude: profile.business_location_latitude,
            business_location_longitude: profile.business_location_longitude
          } : undefined,
          isProfileComplete: apiUser.role === 'customer' ? 
            (profile && 'is_profile_complete' in profile ? profile.is_profile_complete : false) : 
            (apiUser.role === 'business' ? 
              (profile && 'is_profile_complete' in profile ? profile.is_profile_complete : false) : true)
        }
        
        setUser(mappedUser)
        localStorage.setItem('auth_user', JSON.stringify(mappedUser))
      }
    } catch (error) {
      console.error('Error refreshing profile:', error)
    }
  }

  // Check for existing session on mount
  React.useEffect(() => {
    const checkAuthStatus = async () => {
      console.log('[MOBILE DEBUG - AuthContext] Starting auth check...')
      try {
        const savedUser = localStorage.getItem('auth_user')
        const accessToken = localStorage.getItem('access_token')
        
        console.log('[MOBILE DEBUG - AuthContext] Storage check:', {
          hasSavedUser: !!savedUser,
          hasAccessToken: !!accessToken,
          savedUserLength: savedUser?.length,
          tokenLength: accessToken?.length
        })
        
        if (savedUser && accessToken) {
          // Validate the token by making a profile request
          console.log('[MOBILE DEBUG - AuthContext] Found stored session, validating...')
          const response = await apiService.getProfile()
          
          if (response.data) {
            // Token is valid, update user data from server
            const apiUser = response.data.user
            const profile = response.data.profile
            
            const mappedUser: User = {
              id: apiUser.id,
              name: apiUser.display_name || `${apiUser.first_name} ${apiUser.last_name}`.trim() || apiUser.username,
              email: apiUser.email,
              type: apiUser.role,
              avatar: apiUser.image,
              username: apiUser.username,
              phone_number: normalizePhone(apiUser.phone_number),
              display_name: apiUser.display_name,
              first_name: apiUser.first_name,
              last_name: apiUser.last_name,
              profile: apiUser.role === 'customer' && profile && 'gender' in profile ? {
                gender: profile.gender,
                birth_date: profile.birth_date,
                city: profile.city,
                address: profile.address
              } : undefined,
              businessProfile: apiUser.role === 'business' && profile && 'name' in profile ? {
                name: profile.name,
                business_phone: profile.business_phone,
                category: profile.category,
                address: profile.address,
                city: profile.city,
                business_location_latitude: profile.business_location_latitude,
                business_location_longitude: profile.business_location_longitude
              } : undefined,
              isProfileComplete: apiUser.role === 'customer' ? 
                (profile && 'is_profile_complete' in profile ? profile.is_profile_complete : false) : 
                (apiUser.role === 'business' ? 
                  (profile && 'is_profile_complete' in profile ? profile.is_profile_complete : false) : true)
            }
            
            setUser(mappedUser)
            localStorage.setItem('auth_user', JSON.stringify(mappedUser))
            console.log('[MOBILE DEBUG - AuthContext] Session validated successfully, user:', mappedUser.username, 'type:', mappedUser.type)
          } else {
            // Token is invalid or expired, try to refresh
            console.log('[MOBILE DEBUG - AuthContext] Token validation failed, attempting refresh...')
            const refreshToken = localStorage.getItem('refresh_token')
            
            if (refreshToken) {
              const refreshSuccess = await apiService.refreshToken()
              if (refreshSuccess) {
                // Try again after refresh
                const retryResponse = await apiService.getProfile()
                if (retryResponse.data) {
                  const apiUser = retryResponse.data.user
                  const profile = retryResponse.data.profile
                  
                  const mappedUser: User = {
                    id: apiUser.id,
                    name: apiUser.display_name || `${apiUser.first_name} ${apiUser.last_name}`.trim() || apiUser.username,
                    email: apiUser.email,
                    type: apiUser.role,
                    avatar: apiUser.image,
                    username: apiUser.username,
                    phone_number: normalizePhone(apiUser.phone_number),
                    display_name: apiUser.display_name,
                    first_name: apiUser.first_name,
                    last_name: apiUser.last_name,
                    profile: apiUser.role === 'customer' && profile && 'gender' in profile ? {
                      gender: profile.gender,
                      birth_date: profile.birth_date,
                      city: profile.city,
                      address: profile.address
                    } : undefined,
                    businessProfile: apiUser.role === 'business' && profile && 'name' in profile ? {
                      name: profile.name,
                      business_phone: profile.business_phone,
                      category: profile.category,
                      address: profile.address,
                      city: profile.city,
                      business_location_latitude: profile.business_location_latitude,
                      business_location_longitude: profile.business_location_longitude
                    } : undefined,
                    isProfileComplete: apiUser.role === 'customer' ? 
                      (profile && 'is_profile_complete' in profile ? profile.is_profile_complete : false) : 
                      (apiUser.role === 'business' ? 
                        (profile && 'is_profile_complete' in profile ? profile.is_profile_complete : false) : true)
                  }
                  
                  setUser(mappedUser)
                  localStorage.setItem('auth_user', JSON.stringify(mappedUser))
                  console.log('Session refreshed successfully')
                } else {
                  console.log('Profile failed after refresh, clearing session')
                  clearSession()
                }
              } else {
                console.log('Token refresh failed, clearing session')
                clearSession()
              }
            } else {
              console.log('No refresh token available, clearing session')
              clearSession()
            }
          }
        } else {
          console.log('[MOBILE DEBUG - AuthContext] No saved session found in localStorage')
          setUser(null)
        }
      } catch (error) {
        console.error('[MOBILE DEBUG - AuthContext] Error validating session:', error)
        clearSession()
      } finally {
        console.log('[MOBILE DEBUG - AuthContext] Auth check complete, isLoading: false')
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
    updateUser,
    refreshProfile,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
