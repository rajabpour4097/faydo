import React from 'react'
import {
  Wifi, Car, CreditCard, CalendarCheck, Laptop, Plug, Users, Sun, Crown,
  BookOpen, Briefcase, PartyPopper, Cigarette, ShoppingBag, Music, Coffee,
  UtensilsCrossed, Baby, Leaf, Truck, TableProperties, Building2, Cake,
  Cookie, Wheat, Stethoscope, Shield, Siren, FlaskConical, Pill, ArrowUpDown,
  Accessibility, Home, MessageCircle, Sparkles, Syringe, Droplets, Heart,
  Dumbbell, Waves, ShowerHead, Package, Shirt, Scissors, Dog,
  Cat, Gamepad2, Camera, Bath, Clock, MapPin, Star, Phone, type LucideIcon,
} from 'lucide-react'

const KEYWORD_ICON_MAP: [string, LucideIcon][] = [
  ['wifi', Wifi],
  ['park', Car],
  ['پارکینگ', Car],
  ['پرداخت', CreditCard],
  ['کارت', CreditCard],
  ['رزرو', CalendarCheck],
  ['لپ', Laptop],
  ['laptop', Laptop],
  ['پریز', Plug],
  ['جلسه', Users],
  ['روباز', Sun],
  ['vip', Crown],
  ['مطالعه', BookOpen],
  ['کاری', Briefcase],
  ['دورهمی', PartyPopper],
  ['دخانیات', Cigarette],
  ['بیرون', ShoppingBag],
  ['آنلاین', ShoppingBag],
  ['موسیقی', Music],
  ['قهوه', Coffee],
  ['صبحانه', UtensilsCrossed],
  ['خانواد', Users],
  ['مراسم', Building2],
  ['کودک', Baby],
  ['گیاهی', Leaf],
  ['رژیمی', Leaf],
  ['ارسال', Truck],
  ['میز', TableProperties],
  ['تولد', Cake],
  ['کیک', Cake],
  ['شیرینی', Cookie],
  ['گلوتن', Wheat],
  ['نان', Cookie],
  ['پزشک', Stethoscope],
  ['بیمه', Shield],
  ['اورژانس', Siren],
  ['آزمایش', FlaskConical],
  ['دارو', Pill],
  ['آسانسور', ArrowUpDown],
  ['ویلچر', Accessibility],
  ['منزل', Home],
  ['مشاوره', MessageCircle],
  ['زیبایی', Sparkles],
  ['لیزر', Sparkles],
  ['پوست', Droplets],
  ['تزریق', Syringe],
  ['عروس', Heart],
  ['اقساط', CreditCard],
  ['مربی', Dumbbell],
  ['بدنسازی', Dumbbell],
  ['کراس', Dumbbell],
  ['یوگا', Heart],
  ['پیلاتس', Heart],
  ['استخر', Waves],
  ['سونا', Bath],
  ['دوش', ShowerHead],
  ['مکمل', Package],
  ['لباس', Shirt],
  ['دوخت', Scissors],
  ['مزون', Shirt],
  ['دامپزشک', Stethoscope],
  ['حیوان', Dog],
  ['پت', Cat],
  ['واکسن', Shield],
  ['آرایش', Scissors],
  ['مو', Scissors],
  ['گریم', Sparkles],
  ['بازی', Gamepad2],
  ['دوربین', Camera],
  ['سرویس', Bath],
  ['ساعت', Clock],
  ['آدرس', MapPin],
  ['امتیاز', Star],
  ['تماس', Phone],
]

export function getAmenityIcon(name: string, slug?: string): LucideIcon {
  const haystack = `${slug || ''} ${name}`.toLowerCase()
  for (const [keyword, Icon] of KEYWORD_ICON_MAP) {
    if (haystack.includes(keyword.toLowerCase())) {
      return Icon
    }
  }
  return Sparkles
}

interface AmenityIconProps {
  name: string
  slug?: string
  className?: string
}

export const AmenityIcon: React.FC<AmenityIconProps> = ({ name, slug, className = 'w-5 h-5' }) => {
  const Icon = getAmenityIcon(name, slug)
  return <Icon className={className} strokeWidth={1.75} />
}
