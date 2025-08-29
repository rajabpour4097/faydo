import apiClient from '../utils/api.js';

// Auth Service (JWT)
export const authService = {
  login: (username, password) => apiClient.post('/auth/token/', { username, password }),
  refresh: (refresh) => apiClient.post('/auth/token/refresh/', { refresh })
};
authService.register = (payload) => apiClient.post('/auth/register/', payload);

// User & Profile Services
export const userService = {
  getProfile: () => apiClient.get('/profiles/dashboard/'),
  updateProfile: (data) => apiClient.patch('/profiles/1/', data),
  getMe: () => apiClient.get('/users/me/'),
};

// Categories Services
export const categoryService = {
  getAll: () => apiClient.get('/categories/'),
  getById: (id) => apiClient.get(`/categories/${id}/`),
};

// Business Services
export const businessService = {
  getAll: (params = {}) => apiClient.get('/businesses/', { params }),
  getById: (id) => apiClient.get(`/businesses/${id}/`),
  getByCategory: (categorySlug) => apiClient.get('/businesses/', { 
    params: { category: categorySlug } 
  }),
};

// Offers Services
export const offerService = {
  getAll: (params = {}) => apiClient.get('/offers/', { params }),
  getById: (id) => apiClient.get(`/offers/${id}/`),
  saveOffer: (id) => apiClient.post(`/offers/${id}/save/`),
  useOffer: (id) => apiClient.post(`/offers/${id}/use/`),
  getByCategory: (categorySlug) => apiClient.get('/offers/', { 
    params: { category: categorySlug } 
  }),
};

// User Offers Services
export const userOfferService = {
  getSaved: () => apiClient.get('/user-offers/saved/'),
  getAll: () => apiClient.get('/user-offers/'),
};

// Reviews Services
export const reviewService = {
  getAll: (params = {}) => apiClient.get('/reviews/', { params }),
  create: (data) => apiClient.post('/reviews/', data),
  like: (id) => apiClient.post(`/reviews/${id}/like/`),
  reply: (id, text) => apiClient.post(`/reviews/${id}/reply/`, { text }),
  getByBusiness: (businessId) => apiClient.get('/reviews/', { 
    params: { business: businessId } 
  }),
};

// Notifications Services
export const notificationService = {
  getAll: () => apiClient.get('/notifications/'),
  markRead: (id) => apiClient.post(`/notifications/${id}/mark_read/`),
};

// Dashboard Service
export const dashboardService = {
  getData: async () => {
    try {
      const response = await apiClient.get('/profiles/dashboard/');
      return response.data;
    } catch (error) {
      // در صورت عدم وجود پروفایل، داده‌های mock برگردان
      console.warn('API not available, using mock data');
      return {
        user_profile: {
          user: { id: 1, username: 'testuser', first_name: 'کاربر', last_name: 'نمونه' },
          user_type: 'customer',
          points: 265,
          interests: ['fitness', 'food'],
          achievements: ['starter'],
          level: { name: 'برنزی', threshold: 0 }
        },
        recommended_offers: [
          { id: 1, business: { name: 'FitGym', category: { name: 'فیتنس' } }, percent: 40, title: 'تخفیف ویژه باشگاه' },
          { id: 2, business: { name: 'Cafe Rio', category: { name: 'کافه' } }, percent: 25, title: 'تخفیف منوی کافه' }
        ],
        notifications: [
          { id: 1, title: 'سطح جدید', message: 'فقط ۳۵ امتیاز تا سطح بعدی!', is_read: false },
          { id: 2, title: 'تخفیف ویژه', message: 'تخفیف ویژه ۴۰٪ FitGym', is_read: false }
        ],
        progress: { percent: 32, remaining: 135 }
      };
    }
  }
};
