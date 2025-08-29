import React from 'react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto py-16 px-6 text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">درباره فایدو</h1>
      <p className="leading-relaxed mb-4 text-sm md:text-base text-gray-600 dark:text-gray-400">
        فایدو پلتفرم وفاداری مشتریان است که به کسب‌وکارها کمک می‌کند مشتریان وفادارتر، تجربه بهتر و نرخ بازگشت بالاتر بسازند. ما با ارائه سیستم امتیازدهی، پیشنهادات هوشمند، و ابزارهای تحلیل، حلقه‌ای میان نیاز مشتری و استراتژی رشد کسب‌وکار ایجاد می‌کنیم.
      </p>
      <div className="grid md:grid-cols-3 gap-6 mt-10 text-sm">
        <div className="p-5 rounded-xl bg-white dark:bg-surface-100 border border-gray-200 dark:border-surface-300">
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">ماموریت</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">ایجاد تعامل پایدار و شفاف میان مشتری و کسب‌وکار از طریق داده و انگیزه.</p>
        </div>
        <div className="p-5 rounded-xl bg-white dark:bg-surface-100 border border-gray-200 dark:border-surface-300">
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">ارزش‌ها</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">کیفیت، شفافیت، سرعت، احترام به حریم خصوصی، رشد مستمر.</p>
        </div>
        <div className="p-5 rounded-xl bg-white dark:bg-surface-100 border border-gray-200 dark:border-surface-300">
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">چرا ما؟</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">ترکیب Gamification، تحلیل، و سطح‌بندی پویا در یک تجربه واحد.</p>
        </div>
      </div>
    </div>
  );
}
