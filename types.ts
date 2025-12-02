
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  walletBalanceGold: number; // in grams
  createdAt: string;
}

export interface GoldPrice {
  id: string;
  pricePerGram: number; // BDT
  updatedAt: string;
  updatedBy: string;
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum PaymentMethod {
  BKASH = 'Bkash',
  NAGAD = 'Nagad',
  ROCKET = 'Rocket',
  BANK = 'Bank Transfer',
}

export interface PaymentMethodInfo {
  name: PaymentMethod;
  details: string; // Admin set instructions (e.g., "Send to 017...")
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amountBDT: number;
  goldPriceAtMoment: number;
  goldGrams: number;
  method: PaymentMethod;
  status: TransactionStatus;
  date: string;
  screenshot?: string; // URL or Base64 of the uploaded proof (BUY only)
  userPaymentDetails?: string; // User provided details for receiving money (SELL only)
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Simulated API Responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}