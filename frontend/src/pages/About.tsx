export const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            درباره فایدو
          </h1>
          <p className="text-xl text-gray-600">
            پلتفرم باشگاه مشتریان که تجربه خرید را متحول می‌کند
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">داستان ما</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            فایدو با هدف ایجاد پلی میان کسب‌وکارها و مشتریان طراحی شده است. ما معتقدیم که هر خرید باید تجربه‌ای لذت‌بخش و پرفایده باشد.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            در فایدو، مشتریان می‌توانند از تخفیف‌های ویژه، امتیازجمع‌آوری و تجربه‌های منحصر به فرد بهره‌مند شوند. در همین حال، کسب‌وکارها می‌توانند پایگاه مشتریان وفادار خود را گسترش دهند.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-4">مأموریت ما</h3>
            <p className="text-gray-600">
              ایجاد تجربه خرید بهتر از طریق باشگاه مشتریان هوشمند
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">👁️</div>
            <h3 className="text-xl font-semibold mb-4">چشم‌انداز ما</h3>
            <p className="text-gray-600">
              تبدیل شدن به پلتفرم باشگاه مشتریان شماره یک ایران
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">💎</div>
            <h3 className="text-xl font-semibold mb-4">ارزش‌های ما</h3>
            <p className="text-gray-600">
              صداقت، کیفیت، نوآوری و تمرکز بر تجربه کاربری
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">چرا فایدو؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4 space-x-reverse">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600">✓</span>
              </div>
              <div>
                <h4 className="font-semibold mb-2">تخفیف‌های ویژه</h4>
                <p className="text-gray-600 text-sm">دسترسی به تخفیف‌های منحصر به فرد کسب‌وکارها</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 space-x-reverse">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600">✓</span>
              </div>
              <div>
                <h4 className="font-semibold mb-2">امتیازجمع‌آوری</h4>
                <p className="text-gray-600 text-sm">با هر خرید امتیاز بگیرید و پاداش دریافت کنید</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 space-x-reverse">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600">✓</span>
              </div>
              <div>
                <h4 className="font-semibold mb-2">سطح‌بندی کاربران</h4>
                <p className="text-gray-600 text-sm">برنزی، نقره‌ای و VIP با مزایای متفاوت</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 space-x-reverse">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600">✓</span>
              </div>
              <div>
                <h4 className="font-semibold mb-2">تجربه‌های ویژه</h4>
                <p className="text-gray-600 text-sm">دعوت به رویدادها و تجربه‌های اختصاصی</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
