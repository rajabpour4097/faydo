export const Businesses = () => {
  const businesses = [
    {
      id: '1',
      name: 'رستوران سنتی گلستان',
      category: 'رستوران',
      rating: 4.8,
      discount: '15%',
      image: '/api/placeholder/300/200',
      description: 'غذاهای سنتی ایرانی با بهترین کیفیت'
    },
    {
      id: '2', 
      name: 'کافه فن‌جان',
      category: 'کافه',
      rating: 4.6,
      discount: '10%',
      image: '/api/placeholder/300/200',
      description: 'قهوه تازه و محیط دنج'
    },
    {
      id: '3',
      name: 'مرکز خرید آرمیتا',
      category: 'خرید',
      rating: 4.5,
      discount: '20%',
      image: '/api/placeholder/300/200',
      description: 'تجربه خرید متفاوت'
    }
  ]

  const categories = ['همه', 'رستوران', 'کافه', 'خرید', 'ورزش', 'سلامت']

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            کسب‌وکارها
          </h1>
          <p className="text-xl text-gray-600">
            بهترین کسب‌وکارها با تخفیف‌های ویژه
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          {categories.map((category) => (
            <button
              key={category}
              className="px-6 py-2 rounded-full border border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors duration-200"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Businesses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {businesses.map((business) => (
            <div key={business.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <div className="w-full h-48 bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                  <span className="text-gray-500">تصویر کسب‌وکار</span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {business.name}
                  </h3>
                  <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                    {business.discount} تخفیف
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">
                  {business.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {business.category}
                  </span>
                  <div className="flex items-center">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm text-gray-600 mr-1">
                      {business.rating}
                    </span>
                  </div>
                </div>
                
                <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                  مشاهده جزئیات
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
