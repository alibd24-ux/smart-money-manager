export type BucketType = 'need' | 'want' | 'saving';

export interface CategoryGroup {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Category {
  id: string;
  g: string; // group id
  name: string;
  icon: string;
  budget: number;
  bucket: BucketType;
  color: string;
}

export interface IncomeSource {
  id: string;
  name: string;
  icon: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  catId: string;
  amount: number;
  note: string;
  date: string; // YYYY-MM-DD
}

export interface MonthData {
  income: number;
  categories: Category[];
  transactions: Transaction[];
  flags: Record<string, number>;
}

export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export interface AppSettings {
  alarmMuted: boolean;
  userName: string;
  firebaseConfig: FirebaseConfig | null;
  lastBackup: string | null;
}

export interface AppState {
  months: Record<string, MonthData>;
  settings: AppSettings;
  cur: string; // YYYY-MM
}

export interface MonthStats {
  income: number;
  totalExp: number;
  expByCat: Record<string, number>;
  net: number;
  rate: number;
  totalBudget: number;
  savingExp: number;
  needExp: number;
  wantExp: number;
}
