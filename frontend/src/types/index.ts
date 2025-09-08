export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  userType: 'customer' | 'business'
  membershipLevel?: 'bronze' | 'silver' | 'vip'
  points?: number
  joinDate: Date
  isActive: boolean
}

export interface Business {
  id: string
  name: string
  description: string
  category: string
  logo?: string
  coverImage?: string
  address: string
  phone: string
  email: string
  website?: string
  rating: number
  reviewCount: number
  isVerified: boolean
  isPremium: boolean
  discounts: Discount[]
  owner: User
  createdAt: Date
}

export interface Discount {
  id: string
  businessId: string
  title: string
  description: string
  percentage: number
  category: 'general' | 'vip' | 'sample'
  validFrom: Date
  validTo: Date
  maxUsage?: number
  currentUsage: number
  isActive: boolean
  terms?: string
}

export interface Review {
  id: string
  businessId: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  likes: number
  replies: ReviewReply[]
  createdAt: Date
  isVerified: boolean
}

export interface ReviewReply {
  id: string
  reviewId: string
  userId: string
  userName: string
  userAvatar?: string
  comment: string
  createdAt: Date
}
