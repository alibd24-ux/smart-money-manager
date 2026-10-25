import { Category, CategoryGroup, IncomeSource } from './types';

export const BN_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

export const CATEGORY_GROUPS: CategoryGroup[] = [
  { id: 'housing', name: 'বাসা ভাড়া ও ইউটিলিটি', icon: 'fa-house', color: '#38bdf8' },
  { id: 'food', name: 'খাবার ও যাতায়াত', icon: 'fa-utensils', color: '#34d399' },
  { id: 'lifestyle', name: 'জীবনযাত্রা ও পারিবারিক খরচ', icon: 'fa-people-roof', color: '#f472b6' },
];

export const PALETTE = [
  '#38bdf8',
  '#34d399',
  '#fbbf24',
  '#fb7185',
  '#a78bfa',
  '#f472b6',
  '#4ade80',
  '#22d3ee',
  '#f97316',
  '#e879f9',
  '#fde047',
  '#2dd4bf',
  '#818cf8',
  '#fda4af',
];

export const DEFAULT_CATS: Category[] = [
  { id: 'rent', g: 'housing', name: 'বাসা ভাড়া', icon: 'fa-house-chimney', budget: 15000, bucket: 'need', color: '#38bdf8' },
  { id: 'utility', g: 'housing', name: 'বিদ্যুৎ, গ্যাস ও পানি', icon: 'fa-bolt', budget: 3000, bucket: 'need', color: '#34d399' },
  { id: 'internet', g: 'housing', name: 'ইন্টারনেট ও মোবাইল', icon: 'fa-wifi', budget: 1200, bucket: 'need', color: '#fbbf24' },
  { id: 'grocery', g: 'food', name: 'মাসিক বাজার', icon: 'fa-basket-shopping', budget: 10000, bucket: 'need', color: '#fb7185' },
  { id: 'dining', g: 'food', name: 'রেস্টুরেন্ট ও বাইরের খাবার', icon: 'fa-mug-saucer', budget: 3000, bucket: 'want', color: '#a78bfa' },
  { id: 'transport', g: 'food', name: 'যাতায়াত খরচ', icon: 'fa-bus', budget: 4000, bucket: 'need', color: '#f472b6' },
  { id: 'health', g: 'lifestyle', name: 'স্বাস্থ্য ও ঔষধ', icon: 'fa-heart-pulse', budget: 2500, bucket: 'need', color: '#4ade80' },
  { id: 'education', g: 'lifestyle', name: 'শিক্ষা ও বই', icon: 'fa-graduation-cap', budget: 3000, bucket: 'need', color: '#22d3ee' },
  { id: 'shopping', g: 'lifestyle', name: 'পোশাক ও কেনাকাটা', icon: 'fa-bag-shopping', budget: 4000, bucket: 'want', color: '#f97316' },
  { id: 'entertainment', g: 'lifestyle', name: 'বিনোদন', icon: 'fa-film', budget: 2000, bucket: 'want', color: '#e879f9' },
  { id: 'savings', g: 'lifestyle', name: 'সঞ্চয় ও বিনিয়োগ', icon: 'fa-piggy-bank', budget: 8000, bucket: 'saving', color: '#2dd4bf' },
];

export const INCOME_SOURCES: IncomeSource[] = [
  { id: 'salary', name: 'বেতন', icon: 'fa-briefcase' },
  { id: 'business', name: 'ব্যবসা', icon: 'fa-shop' },
  { id: 'freelance', name: 'ফ্রিল্যান্সিং', icon: 'fa-laptop' },
  { id: 'other_income', name: 'উপহার / অন্যান্য আয়', icon: 'fa-gift' },
];

export const CC_ICONS = [
  'fa-star',
  'fa-car',
  'fa-baby',
  'fa-paw',
  'fa-plane',
  'fa-dumbbell',
  'fa-book',
  'fa-mobile-screen',
  'fa-couch',
  'fa-screwdriver-wrench',
  'fa-hand-holding-heart',
  'fa-basketball',
];

export const LS_KEY = 'smm_data_v1';

const bnFmt = new Intl.NumberFormat('bn-BD', { maximumFractionDigits: 0 });

export const D2B = (n: string | number): string =>
  String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[+d]);

export const fmtMoney = (v: number): string => '৳ ' + bnFmt.format(Math.round(v || 0));

export const fmtPct = (v: number): string => bnFmt.format(Math.round(v || 0)) + '%';

export const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v));

export function currentMonthKey(): string {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

export function offsetMonthKey(key: string, diff: number): string {
  const [y, m] = key.split('-').map(Number);
  const dt = new Date(y, m - 1 + diff, 1);
  return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0');
}

export const bnDateFormatter = new Intl.DateTimeFormat('bn-BD', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
