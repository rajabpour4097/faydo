import { Link } from 'react-router-dom'

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-300 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-white font-bold text-4xl">404</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            صفحه یافت نشد
          </h2>
          <p className="text-gray-600 mb-8">
            متأسفانه صفحه‌ای که دنبال آن می‌گردید وجود ندارد.
          </p>
          <div className="space-y-4">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              بازگشت به خانه
            </Link>
            <br />
            <Link
              to="/businesses"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              مشاهده کسب‌وکارها
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
