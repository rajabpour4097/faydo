import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export const Register = () => {
  const navigate = useNavigate()
  const { registerCustomer, registerBusiness } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    name: '', // For business registration
    phone_number: '',
    password: '',
    password_confirm: '',
    role: 'customer' as 'customer' | 'business',
    gender: 'male' as 'male' | 'female',
    birth_date: '',
    address: '',
    agreeToTerms: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    console.log('Form data before validation:', formData)

    if (formData.password !== formData.password_confirm) {
      setError('رمز عبور و تکرار آن مطابقت ندارند')
      setIsLoading(false)
      return
    }

    if (!formData.agreeToTerms) {
      setError('باید قوانین و مقررات را تایید کنید')
      setIsLoading(false)
      return
    }

    try {
      console.log('Calling register with:', formData)
      
      let result
      if (formData.role === 'business') {
        result = await registerBusiness({
          username: formData.username,
          email: formData.email,
          phone_number: formData.phone_number,
          password: formData.password,
          password_confirm: formData.password_confirm,
          name: formData.name,
          description: '',
          address: formData.address
        })
      } else {
        result = await registerCustomer({
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
          password: formData.password,
          password_confirm: formData.password_confirm,
          gender: formData.gender,
          birth_date: formData.birth_date,
          address: formData.address
        })
      }
      
      console.log('Register result:', result)
      
      if (result.success) {
        console.log('Registration successful, navigating to dashboard')
        // Navigate based on user role
        if (formData.role === 'customer') {
          navigate('/dashboard/customer')
        } else {
          navigate('/dashboard/business')
        }
      } else {
        console.error('Registration failed with error:', result.error)
        setError(result.error || 'خطا در ثبت نام')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('خطا در ثبت نام. لطفاً دوباره تلاش کنید.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            ایجاد حساب کاربری
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            یا{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              وارد حساب موجود شوید
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                نوع حساب کاربری
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="customer">مشتری</option>
                <option value="business">کسب‌وکار</option>
              </select>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                نام کاربری
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="نام کاربری خود را وارد کنید"
              />
            </div>

            {formData.role === 'customer' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                    نام
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="نام"
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                    نام خانوادگی
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="نام خانوادگی"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  نام کسب‌وکار
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="نام کسب‌وکار"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                ایمیل
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                شماره تماس
              </label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={handleChange}
                className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="09123456789"
              />
            </div>

            {formData.role === 'customer' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      جنسیت
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="male">مرد</option>
                      <option value="female">زن</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700">
                      تاریخ تولد
                    </label>
                    <input
                      id="birth_date"
                      name="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={handleChange}
                      className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    آدرس (اختیاری)
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="آدرس محل سکونت"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                رمز عبور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="رمز عبور قوی انتخاب کنید"
              />
            </div>

            <div>
              <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700">
                تکرار رمز عبور
              </label>
              <input
                id="password_confirm"
                name="password_confirm"
                type="password"
                required
                value={formData.password_confirm}
                onChange={handleChange}
                className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="رمز عبور را مجدداً وارد کنید"
              />
            </div>

            <div className="flex items-center">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                required
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="agreeToTerms" className="mr-2 block text-sm text-gray-900">
                با{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">شرایط استفاده</a>
                {' '}و{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">حریم خصوصی</a>
                {' '}موافقم
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'در حال ثبت نام...' : 'ایجاد حساب کاربری'}
              </button>
            </div>

            {formData.role === 'customer' && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 text-center">
                  🎉 <strong>مزیت عضویت رایگان:</strong><br />
                  ۳ ماه اشتراک برنزی رایگان + ۱۰۰ امتیاز هدیه!
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
