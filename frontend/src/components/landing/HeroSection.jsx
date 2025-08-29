import React from 'react';
import { Link } from 'react-router-dom';
// استفاده از مسیر public برای جلوگیری از ارور در صورت نبود فایل هنگام توسعه
const heroImg = '/hero-illustration.png'; // فایل را در پوشه public قرار دهید: frontend/public/hero-illustration.png

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 text-white py-24">
      <div className="container-responsive relative z-10 grid gap-10 md:grid-cols-2 items-center">
        <div className="space-y-6">
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight">باشگاه مشتریان هوشمند برای وفاداری بیشتر</h1>
          <p className="text-brand-100 text-sm sm:text-base">فایدو به کسب‌وکار شما کمک می‌کند تخفیف هدفمند ارائه دهید و مشتریان وفادار بسازید.</p>
          <div className="flex gap-4">
            <Link to="/login" className="rounded bg-white text-brand-700 font-semibold px-6 py-3 text-sm shadow hover:bg-brand-50">ورود به داشبورد</Link>
            <a href="#business" className="rounded border border-white/40 px-6 py-3 text-sm hover:bg-white/10">ثبت کسب‌وکار</a>
          </div>
        </div>
        <div className="relative h-72 md:h-96 flex items-center justify-center">
          <div className="absolute inset-0 rounded-xl bg-white/10 backdrop-blur border border-white/20" />
          <img
            src={heroImg}
            alt="Faydo hero illustration"
            className="relative w-full h-full object-contain p-4 md:p-6 drop-shadow-xl"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent_70%)]" />
    </section>
  );
}
