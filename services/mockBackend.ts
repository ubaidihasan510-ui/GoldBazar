
import { User, UserRole, GoldPrice, Transaction, TransactionStatus, TransactionType, PaymentMethod, PaymentMethodInfo, ApiResponse } from '../types';

// Constants for LocalStorage keys
const LS_USERS = 'auro_users';
const LS_TRANSACTIONS = 'auro_transactions';
const LS_PRICE = 'auro_gold_price';
const LS_SESSION = 'auro_session';
const LS_PAYMENT_METHODS = 'auro_payment_methods';

// Seed Data
const DEFAULT_ADMIN: User = {
  id: 'admin-1',
  name: 'System Admin',
  email: 'admin@auro.com',
  phone: '01700000000',
  role: UserRole.ADMIN,
  walletBalanceGold: 0,
  createdAt: new Date().toISOString(),
};

const INITIAL_PRICE: GoldPrice = {
  id: 'price-1',
  pricePerGram: 9500,
  updatedAt: new Date().toISOString(),
  updatedBy: 'admin-1',
};

const DEFAULT_PAYMENT_METHODS: PaymentMethodInfo[] = [
  { name: PaymentMethod.BKASH, details: "Send Money to Personal: 01700000000\nReference: Your Phone Number" },
  { name: PaymentMethod.NAGAD, details: "Send Money to Merchant: 01800000000\nCounter: 1" },
  { name: PaymentMethod.ROCKET, details: "Send Money to: 01900000000-8" },
  { name: PaymentMethod.BANK, details: "City Bank\nA/C: 123456789\nAuro Gold Ltd." },
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class MockBackendService {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(LS_USERS)) {
      localStorage.setItem(LS_USERS, JSON.stringify([DEFAULT_ADMIN]));
    }
    if (!localStorage.getItem(LS_PRICE)) {
      localStorage.setItem(LS_PRICE, JSON.stringify(INITIAL_PRICE));
    }
    if (!localStorage.getItem(LS_TRANSACTIONS)) {
      localStorage.setItem(LS_TRANSACTIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(LS_PAYMENT_METHODS)) {
      localStorage.setItem(LS_PAYMENT_METHODS, JSON.stringify(DEFAULT_PAYMENT_METHODS));
    }
  }

  // --- Auth ---

  async login(email: string): Promise<ApiResponse<User>> {
    await delay(800);
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const user = users.find((u: User) => u.email === email);
    
    if (user) {
      localStorage.setItem(LS_SESSION, JSON.stringify(user));
      return { success: true, data: user };
    }
    return { success: false, message: 'User not found. Try admin@auro.com or register.' };
  }

  async register(name: string, email: string, phone: string): Promise<ApiResponse<User>> {
    await delay(1000);
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    
    if (users.find((u: User) => u.email === email)) {
      return { success: false, message: 'Email already exists' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      phone,
      role: UserRole.USER,
      walletBalanceGold: 0,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    localStorage.setItem(LS_SESSION, JSON.stringify(newUser));
    
    return { success: true, data: newUser };
  }

  async updateUser(userId: string, data: { name?: string; phone?: string }): Promise<ApiResponse<User>> {
    await delay(800);
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const index = users.findIndex((u: User) => u.id === userId);
    
    if (index !== -1) {
      const updatedUser = { ...users[index], ...data };
      users[index] = updatedUser;
      localStorage.setItem(LS_USERS, JSON.stringify(users));
      
      // Update session if it's the current user
      const session = JSON.parse(localStorage.getItem(LS_SESSION) || '{}');
      if (session.id === userId) {
        localStorage.setItem(LS_SESSION, JSON.stringify(updatedUser));
      }
      
      return { success: true, data: updatedUser };
    }
    return { success: false, message: 'User not found' };
  }

  async logout(): Promise<void> {
    localStorage.removeItem(LS_SESSION);
  }

  async getCurrentUser(): Promise<User | null> {
    const session = localStorage.getItem(LS_SESSION);
    if (session) {
      // Re-fetch from DB to get latest wallet balance
      const userSession = JSON.parse(session);
      const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
      return users.find((u: User) => u.id === userSession.id) || null;
    }
    return null;
  }

  // --- Gold Price ---

  async getGoldPrice(): Promise<GoldPrice> {
    await delay(500); // Faster read
    return JSON.parse(localStorage.getItem(LS_PRICE) || JSON.stringify(INITIAL_PRICE));
  }

  async setGoldPrice(price: number, adminId: string): Promise<ApiResponse<GoldPrice>> {
    await delay(1000);
    const newPrice: GoldPrice = {
      id: `price-${Date.now()}`,
      pricePerGram: price,
      updatedAt: new Date().toISOString(),
      updatedBy: adminId,
    };
    localStorage.setItem(LS_PRICE, JSON.stringify(newPrice));
    return { success: true, data: newPrice };
  }

  // --- Payment Methods ---

  async getPaymentMethods(): Promise<PaymentMethodInfo[]> {
    await delay(300);
    return JSON.parse(localStorage.getItem(LS_PAYMENT_METHODS) || JSON.stringify(DEFAULT_PAYMENT_METHODS));
  }

  async updatePaymentMethod(methodName: PaymentMethod, newDetails: string): Promise<ApiResponse<null>> {
    await delay(500);
    const methods = JSON.parse(localStorage.getItem(LS_PAYMENT_METHODS) || '[]');
    const idx = methods.findIndex((m: PaymentMethodInfo) => m.name === methodName);
    if (idx !== -1) {
      methods[idx].details = newDetails;
      localStorage.setItem(LS_PAYMENT_METHODS, JSON.stringify(methods));
      return { success: true };
    }
    return { success: false, message: 'Method not found' };
  }

  // --- Transactions ---

  async createTransaction(userId: string, amountBDT: number, method: PaymentMethod, type: TransactionType, screenshotFile?: File, userPaymentDetails?: string): Promise<ApiResponse<Transaction>> {
    await delay(1500); // Simulate upload/processing
    
    const priceData = await this.getGoldPrice();
    const goldGrams = amountBDT / priceData.pricePerGram;
    
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const userIndex = users.findIndex((u: User) => u.id === userId);
    
    if (userIndex === -1) return { success: false, message: "User not found" };

    // Validate Sell Balance
    if (type === TransactionType.SELL) {
      if (users[userIndex].walletBalanceGold < goldGrams) {
        return { success: false, message: "Insufficient gold balance" };
      }
      
      // Lock/Deduct Gold immediately for SELL
      users[userIndex].walletBalanceGold -= goldGrams;
      localStorage.setItem(LS_USERS, JSON.stringify(users));
      
      // Update session
      const currentUser = await this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        localStorage.setItem(LS_SESSION, JSON.stringify(users[userIndex]));
      }
    }

    // Simulate Screenshot URL (In real app, upload to S3/Cloudinary)
    const screenshotUrl = screenshotFile ? URL.createObjectURL(screenshotFile) : undefined;

    const transaction: Transaction = {
      id: `txn-${Date.now()}`,
      userId,
      type,
      amountBDT,
      goldPriceAtMoment: priceData.pricePerGram,
      goldGrams,
      method,
      status: TransactionStatus.PENDING, // Both BUY and SELL start as PENDING now
      date: new Date().toISOString(),
      screenshot: screenshotUrl,
      userPaymentDetails: userPaymentDetails
    };

    // Save Transaction
    const txns = JSON.parse(localStorage.getItem(LS_TRANSACTIONS) || '[]');
    txns.unshift(transaction); // Add to top
    localStorage.setItem(LS_TRANSACTIONS, JSON.stringify(txns));

    return { success: true, data: transaction };
  }

  async processTransaction(txnId: string, action: 'APPROVE' | 'REJECT'): Promise<ApiResponse<Transaction>> {
    await delay(1000);
    const txns = JSON.parse(localStorage.getItem(LS_TRANSACTIONS) || '[]');
    const txnIndex = txns.findIndex((t: Transaction) => t.id === txnId);
    
    if (txnIndex === -1) return { success: false, message: "Transaction not found" };
    
    const txn = txns[txnIndex];
    
    if (txn.status !== TransactionStatus.PENDING) {
      return { success: false, message: "Transaction is not pending" };
    }

    const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
    const userIndex = users.findIndex((u: User) => u.id === txn.userId);
    
    if (userIndex === -1) return { success: false, message: "User associated with transaction not found" };

    if (action === 'REJECT') {
      // If it was a SELL transaction, we must REFUND the gold we locked
      if (txn.type === TransactionType.SELL) {
        users[userIndex].walletBalanceGold += txn.goldGrams;
        localStorage.setItem(LS_USERS, JSON.stringify(users));
      }

      txn.status = TransactionStatus.FAILED;
      txns[txnIndex] = txn;
      localStorage.setItem(LS_TRANSACTIONS, JSON.stringify(txns));
      
      return { success: true, data: txn };
    }

    if (action === 'APPROVE') {
      // Logic for BUY: Credit Gold
      if (txn.type === TransactionType.BUY) {
        users[userIndex].walletBalanceGold += txn.goldGrams;
        localStorage.setItem(LS_USERS, JSON.stringify(users));
      } 
      // Logic for SELL: Gold already deducted, just mark success (Payment Confirmed)
      
      txn.status = TransactionStatus.SUCCESS;
      txns[txnIndex] = txn;
      
      localStorage.setItem(LS_TRANSACTIONS, JSON.stringify(txns));

      // Update session if it's the current user
      const currentUser = await this.getCurrentUser();
      if (currentUser && currentUser.id === txn.userId) {
         localStorage.setItem(LS_SESSION, JSON.stringify(users[userIndex]));
      }

      return { success: true, data: txn };
    }

    return { success: false };
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    await delay(600);
    const txns = JSON.parse(localStorage.getItem(LS_TRANSACTIONS) || '[]');
    return txns.filter((t: Transaction) => t.userId === userId);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    await delay(600);
    return JSON.parse(localStorage.getItem(LS_TRANSACTIONS) || '[]');
  }
}

export const mockBackend = new MockBackendService();
