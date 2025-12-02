
import React, { useState, useEffect, createContext, useContext } from 'react';
import { UserRole, GoldPrice, Transaction, AuthState, TransactionType, PaymentMethod, PaymentMethodInfo, TransactionStatus } from './types';
import { mockBackend } from './services/mockBackend';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';

// --- Context Definitions ---

interface DataContextType {
  goldPrice: GoldPrice | null;
  refreshPrice: () => Promise<void>;
  transactions: Transaction[];
  refreshTransactions: () => Promise<void>;
  paymentMethods: PaymentMethodInfo[];
  refreshPaymentMethods: () => Promise<void>;
}

const AuthContext = createContext<{
  auth: AuthState;
  login: (email: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string) => Promise<boolean>;
  updateProfile: (name: string, phone: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
} | null>(null);

const DataContext = createContext<DataContextType | null>(null);

// --- Views ---

const LoginView = () => {
  const auth = useContext(AuthContext);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let success;
      if (isRegistering) {
        success = await auth?.register(name, email, phone);
      } else {
        success = await auth?.login(email);
      }
      
      if (!success) {
        setError(isRegistering ? 'Registration failed' : 'User not found. Try admin@auro.com');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 -left-20 w-48 h-48 bg-gold-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="text-center mb-10 animate-fade-in">
        <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-gold-500/20 mb-4">
          <i className="fas fa-gem text-3xl text-dark-900"></i>
        </div>
        <h1 className="text-4xl font-serif font-bold text-white mb-2">Auro<span className="text-gold-500">Gold</span></h1>
        <p className="text-gray-400">Premium Digital Gold Investment</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl animate-slide-up">
        <h2 className="text-xl font-semibold text-white mb-6 text-center">
          {isRegistering ? 'Create Account' : 'Welcome Back'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <>
              <Input 
                placeholder="Full Name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                icon={<i className="fas fa-user"></i>}
                required
              />
              <Input 
                placeholder="Phone Number" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                icon={<i className="fas fa-phone"></i>}
                required
              />
            </>
          )}
          <Input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            icon={<i className="fas fa-envelope"></i>}
            required
          />
          
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <Button type="submit" isLoading={loading}>
            {isRegistering ? 'Start Investing' : 'Secure Login'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="ml-2 text-gold-400 hover:text-gold-300 font-medium"
            >
              {isRegistering ? 'Login' : 'Register'}
            </button>
          </p>
        </div>
      </div>
      
      {!isRegistering && (
        <div className="mt-8 text-center text-xs text-gray-600">
          <p>Demo Admin: admin@auro.com</p>
        </div>
      )}
    </div>
  );
};

const UserDashboard = () => {
  const { auth } = useContext(AuthContext)!;
  const { goldPrice } = useContext(DataContext)!;

  const portfolioValue = (auth.user?.walletBalanceGold || 0) * (goldPrice?.pricePerGram || 0);

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header */}
      <header className="flex justify-between items-center py-2">
        <div onClick={() => window.location.hash = 'profile'} className="cursor-pointer">
          <h2 className="text-gray-400 text-sm">Welcome back,</h2>
          <h1 className="text-xl font-bold text-white">{auth.user?.name}</h1>
        </div>
        <div onClick={() => window.location.hash = 'profile'} className="h-10 w-10 rounded-full bg-dark-700 border border-gold-500/30 flex items-center justify-center cursor-pointer hover:bg-dark-600 transition-colors">
          <i className="fas fa-user text-gold-500"></i>
        </div>
      </header>

      {/* Portfolio Card */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-gold-500/30 transition-colors duration-300">
        {/* Background Glow */}
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl group-hover:bg-gold-500/20 transition-all duration-500"></div>
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Total Gold Balance</h3>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-4xl font-bold text-white tracking-tight">
                {auth.user?.walletBalanceGold.toFixed(4)}
              </span>
              <span className="text-gold-500 font-bold mb-1.5 text-lg">g</span>
            </div>
          </div>

          {/* Premium 3D Gold Coin UI */}
          <div className="relative w-16 h-16 shrink-0 transform group-hover:scale-110 transition-transform duration-500">
            {/* Coin Outer Edge */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-300 via-gold-600 to-gold-800 shadow-lg shadow-gold-500/20 flex items-center justify-center">
              {/* Coin Face */}
              <div className="w-[90%] h-[90%] rounded-full bg-gradient-to-tl from-gold-500 via-gold-300 to-gold-100 flex items-center justify-center border border-gold-600/30 relative overflow-hidden">
                {/* Detail Ring */}
                <div className="absolute inset-1 rounded-full border border-dashed border-gold-700/40"></div>
                {/* Symbol */}
                <span className="font-serif font-black text-gold-900 text-xl relative z-10 drop-shadow-sm">Au</span>
                {/* Shine Effect */}
                <div className="absolute -top-6 -left-6 w-12 h-12 bg-white/40 blur-lg transform rotate-45"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-white/10 relative z-10">
          <div>
            <p className="text-xs text-gray-500">Current Value</p>
            <p className="text-lg font-semibold text-white">৳ {portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
          <div className="text-right">
             <p className="text-xs text-gray-500">Market Rate</p>
             <p className="text-sm text-gold-400 font-medium">৳ {goldPrice?.pricePerGram}/g</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h3 className="text-white font-semibold pt-2">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-dark-800 p-4 rounded-xl flex flex-col items-center gap-3 border border-gray-800 hover:border-gold-500/50 transition-colors" onClick={() => window.location.hash = 'buy'}>
          <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-500">
            <i className="fas fa-plus text-xl"></i>
          </div>
          <span className="text-white text-sm font-medium">Buy Gold</span>
        </button>
        <button className="bg-dark-800 p-4 rounded-xl flex flex-col items-center gap-3 border border-gray-800 hover:border-red-500/50 transition-colors" onClick={() => window.location.hash = 'sell'}>
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <i className="fas fa-minus text-xl"></i>
          </div>
          <span className="text-white text-sm font-medium">Sell Gold</span>
        </button>
      </div>
      <button className="w-full bg-dark-800 p-4 rounded-xl flex items-center justify-between border border-gray-800 hover:border-blue-500/50 transition-colors" onClick={() => window.location.hash = 'history'}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
              <i className="fas fa-history"></i>
            </div>
            <span className="text-white text-sm font-medium">Transaction History</span>
          </div>
          <i className="fas fa-chevron-right text-gray-600"></i>
      </button>
    </div>
  );
};

const BuyGoldView = () => {
  const { goldPrice, refreshTransactions, paymentMethods } = useContext(DataContext)!;
  const { auth } = useContext(AuthContext)!;
  
  const [amount, setAmount] = useState<number | ''>('');
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.BKASH);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [successTxn, setSuccessTxn] = useState<Transaction | null>(null);

  const price = goldPrice?.pricePerGram || 9500;
  const grams = amount ? (amount / price) : 0;

  const currentMethodDetails = paymentMethods.find(m => m.name === method)?.details || 'No details available';

  const handleQuickAmount = (val: number) => setAmount(val);

  const handleSubmit = async () => {
    if (!amount) return;
    setLoading(true);
    try {
      const currentUser = auth.user;
      if (!currentUser) return;

      const res = await mockBackend.createTransaction(
        currentUser.id, 
        amount, 
        method, 
        TransactionType.BUY,
        screenshot || undefined
      );
      
      if (res.success && res.data) {
        await refreshTransactions();
        setSuccessTxn(res.data);
        setAmount('');
        setScreenshot(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSuccessTxn(null);
    window.location.hash = 'home';
  };

  return (
    <div className="space-y-6 pb-40 animate-slide-up relative">
      {/* Confirmation Modal */}
      {successTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={handleCloseModal}></div>
          <div className="bg-dark-800 border border-gold-500/30 rounded-2xl p-6 w-full max-w-sm relative z-10 animate-slide-up shadow-2xl shadow-gold-500/10">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                <i className="fas fa-clock text-2xl text-blue-500"></i>
              </div>
              <h2 className="text-xl font-serif font-bold text-white mb-1">Submission Received!</h2>
              <p className="text-sm text-gray-400">Your purchase is pending approval.</p>
            </div>
            
            <div className="space-y-3 bg-dark-900/50 p-4 rounded-xl border border-white/5 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Amount Paid</span>
                <span className="text-white font-medium">৳ {successTxn.amountBDT.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Expected Gold</span>
                <span className="text-gold-400 font-bold">{successTxn.goldGrams.toFixed(4)} g</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-white/10 pt-2 mt-2">
                <span className="text-gray-500 text-xs">Status</span>
                <span className="text-blue-400 text-xs font-bold uppercase">{successTxn.status}</span>
              </div>
            </div>

            <Button onClick={handleCloseModal}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      )}

      <header className="flex items-center gap-4 py-2">
        <button onClick={() => window.location.hash = 'home'} className="text-gray-400 hover:text-white">
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-xl font-bold text-white">Buy Gold</h1>
      </header>

      {/* Live Rate Strip */}
      <div className="bg-gold-500/10 border border-gold-500/20 rounded-lg p-3 flex justify-between items-center">
        <span className="text-gold-500 text-sm font-medium"><i className="fas fa-chart-line mr-2"></i>Live Rate</span>
        <span className="text-white font-bold">৳ {price.toLocaleString()}/g</span>
      </div>

      {/* Calculator */}
      <div className="space-y-4">
        <label className="text-sm text-gray-400">Enter Amount (BDT)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500 font-bold text-lg">৳</span>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full bg-transparent border-b-2 border-gray-700 focus:border-gold-500 text-3xl font-bold text-white py-4 pl-10 outline-none transition-colors"
            placeholder="0"
          />
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">You receive approx</p>
          <p className="text-xl font-mono text-gold-400">{grams.toFixed(4)} g</p>
        </div>
      </div>

      {/* Quick Select */}
      <div className="grid grid-cols-4 gap-2">
        {[200, 500, 1000, 5000].map((val) => (
          <button 
            key={val}
            onClick={() => handleQuickAmount(val)}
            className={`py-2 rounded-lg text-sm font-medium transition-colors border ${amount === val ? 'bg-gold-500 text-dark-900 border-gold-500' : 'bg-dark-800 text-gray-400 border-gray-800 hover:border-gray-600'}`}
          >
            ৳{val}
          </button>
        ))}
      </div>

      {/* Payment Method */}
      <div className="space-y-4">
        <h3 className="text-white font-medium text-sm">Select Payment Method</h3>
        <div className="grid grid-cols-2 gap-3">
          {paymentMethods.map((m) => (
            <button
              key={m.name}
              onClick={() => setMethod(m.name)}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${method === m.name ? 'border-gold-500 bg-gold-500/10 text-white' : 'border-gray-800 bg-dark-800 text-gray-500'}`}
            >
              <i className={`fas ${m.name === PaymentMethod.BANK ? 'fa-university' : 'fa-mobile-alt'}`}></i>
              {m.name}
            </button>
          ))}
        </div>

        {/* Dynamic Payment Details */}
        <div className="bg-dark-800 p-4 rounded-xl border border-gray-700">
          <h4 className="text-xs text-gold-500 font-bold uppercase mb-2">Payment Instructions</h4>
          <p className="text-gray-300 text-sm whitespace-pre-line">{currentMethodDetails}</p>
        </div>

        {/* Upload Screenshot */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Upload Payment Screenshot (SS)</label>
          <div className="relative">
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files ? e.target.files[0] : null)}
              className="hidden"
              id="ss-upload"
            />
            <label htmlFor="ss-upload" className={`w-full py-3 px-4 rounded-xl border-dashed border-2 flex items-center justify-center gap-3 cursor-pointer transition-colors ${screenshot ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-gray-700 hover:border-gold-500/50 text-gray-400'}`}>
              <i className={`fas ${screenshot ? 'fa-check-circle' : 'fa-cloud-upload-alt'}`}></i>
              <span className="text-sm font-medium truncate">{screenshot ? screenshot.name : 'Tap to upload screenshot'}</span>
            </label>
          </div>
        </div>
      </div>

      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-40">
        <Button onClick={handleSubmit} isLoading={loading} disabled={!amount || amount <= 0 || !screenshot}>
          Submit for Review
        </Button>
      </div>
    </div>
  );
};

const SellGoldView = () => {
  const { goldPrice, refreshTransactions } = useContext(DataContext)!;
  const { refreshUser, auth } = useContext(AuthContext)!;
  
  const [amount, setAmount] = useState<number | ''>('');
  const [method, setMethod] = useState<string>('Bkash');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [successTxn, setSuccessTxn] = useState<Transaction | null>(null);
  const [error, setError] = useState('');

  const price = goldPrice?.pricePerGram || 9500;
  const grams = amount ? (amount / price) : 0;
  const maxSellableAmount = (auth.user?.walletBalanceGold || 0) * price;

  const handleMax = () => setAmount(Math.floor(maxSellableAmount));

  const handleSell = async () => {
    if (!amount) return;
    if (grams > (auth.user?.walletBalanceGold || 0)) {
      setError('Insufficient gold balance');
      return;
    }
    if (!paymentDetails.trim()) {
      setError('Please enter payment details');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const currentUser = auth.user;
      if (!currentUser) return;

      // Sell transactions also go to PENDING now, with details
      const res = await mockBackend.createTransaction(
        currentUser.id, 
        amount, 
        method as any, 
        TransactionType.SELL, 
        undefined, 
        paymentDetails
      );
      
      if (res.success && res.data) {
        await refreshUser();
        await refreshTransactions();
        setSuccessTxn(res.data);
        setAmount('');
        setPaymentDetails('');
      } else {
        setError(res.message || 'Transaction failed');
      }
    } catch (e) {
      console.error(e);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSuccessTxn(null);
    window.location.hash = 'home';
  };

  return (
    <div className="space-y-6 pb-40 animate-slide-up relative">
      {/* Confirmation Modal */}
      {successTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={handleCloseModal}></div>
          <div className="bg-dark-800 border border-gold-500/30 rounded-2xl p-6 w-full max-w-sm relative z-10 animate-slide-up shadow-2xl shadow-gold-500/10">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                <i className="fas fa-hourglass-half text-2xl text-blue-500"></i>
              </div>
              <h2 className="text-xl font-serif font-bold text-white mb-1">Sale Pending Review</h2>
              <p className="text-sm text-gray-400">Payment will be sent after admin approval</p>
            </div>
            
            <div className="space-y-3 bg-dark-900/50 p-4 rounded-xl border border-white/5 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">To Receive</span>
                <span className="text-white font-medium">৳ {successTxn.amountBDT.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Gold Deducted</span>
                <span className="text-red-400 font-bold">{successTxn.goldGrams.toFixed(4)} g</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Receive Via</span>
                <span className="text-white">{successTxn.method}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-white/10 pt-2 mt-2">
                <span className="text-gray-500 text-xs">Status</span>
                <span className="text-blue-400 text-xs font-bold uppercase">{successTxn.status}</span>
              </div>
            </div>

            <Button onClick={handleCloseModal} className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 text-white">
              Go to Dashboard
            </Button>
          </div>
        </div>
      )}

      <header className="flex items-center gap-4 py-2">
        <button onClick={() => window.location.hash = 'home'} className="text-gray-400 hover:text-white">
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-xl font-bold text-white">Sell Gold</h1>
      </header>

      {/* Balance Info */}
      <div className="bg-dark-800 rounded-xl p-4 border border-gray-800 flex justify-between items-center">
        <div>
           <p className="text-xs text-gray-500">Available Balance</p>
           <p className="text-white font-semibold">{auth.user?.walletBalanceGold.toFixed(4)} g</p>
        </div>
        <div className="text-right">
           <p className="text-xs text-gray-500">Est. Value</p>
           <p className="text-gold-500 font-semibold">৳ {maxSellableAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
      </div>

      {/* Calculator */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm text-gray-400">Amount to Receive (BDT)</label>
          <button onClick={handleMax} className="text-xs text-gold-500 font-semibold uppercase">Sell All</button>
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">৳</span>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full bg-transparent border-b-2 border-gray-700 focus:border-red-500 text-3xl font-bold text-white py-4 pl-10 outline-none transition-colors"
            placeholder="0"
          />
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">You sell approx</p>
          <p className="text-xl font-mono text-red-400">{grams.toFixed(4)} g</p>
        </div>
      </div>

      {/* Receive Method */}
      <div className="space-y-4">
        <h3 className="text-white font-medium text-sm">Receive Money Via</h3>
        <div className="grid grid-cols-2 gap-3">
          {['Bkash', 'Nagad', 'Rocket', 'Bank'].map((m) => (
            <button
              key={m}
              onClick={() => { setMethod(m); setPaymentDetails(''); }}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${method === m ? 'border-red-500 bg-red-500/10 text-white' : 'border-gray-800 bg-dark-800 text-gray-500'}`}
            >
              <i className={`fas ${m === 'Bank' ? 'fa-university' : 'fa-mobile-alt'}`}></i>
              {m}
            </button>
          ))}
        </div>
        
        {/* Payment Details Input */}
        <div className="animate-fade-in">
            <label className="block text-sm font-medium text-gray-400 mb-2">Enter {method} Account Details</label>
            <textarea
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
                placeholder={`e.g. ${method} Number: 01xxxxxxxxx`}
                className="w-full bg-dark-800 border border-gray-700 rounded-xl p-3 text-white focus:border-red-500 outline-none h-24 resize-none"
            ></textarea>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>

      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-40">
        <Button onClick={handleSell} isLoading={loading} disabled={!amount || amount <= 0 || !paymentDetails.trim()} variant="danger">
          Confirm Sale
        </Button>
      </div>
    </div>
  );
};

const HistoryView = () => {
  const { transactions } = useContext(DataContext)!;

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
       <header className="flex items-center gap-4 py-2">
        <button onClick={() => window.location.hash = 'home'} className="text-gray-400 hover:text-white">
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-xl font-bold text-white">Transaction History</h1>
      </header>

      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-10 text-gray-600">
            <i className="fas fa-receipt text-4xl mb-3 opacity-30"></i>
            <p>No transactions yet.</p>
          </div>
        ) : (
          transactions.map((t) => {
            const isBuy = t.type === TransactionType.BUY;
            const isPending = t.status === TransactionStatus.PENDING;
            const isFailed = t.status === TransactionStatus.FAILED;
            
            let statusColor = 'text-green-500';
            if(isPending) statusColor = 'text-yellow-500';
            if(isFailed) statusColor = 'text-red-500';

            return (
              <div key={t.id} className="bg-dark-800 rounded-xl p-4 flex justify-between items-center border border-gray-800/50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isBuy ? 'bg-gold-500/10 text-gold-500' : 'bg-red-500/10 text-red-500'}`}>
                    <i className={`fas ${isBuy ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                  </div>
                  <div>
                    <p className="text-white font-medium">{isBuy ? 'Buy Gold' : 'Sell Gold'} <span className={`text-[10px] ml-2 px-2 py-0.5 rounded-full border border-current ${statusColor}`}>{t.status}</span></p>
                    <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-mono font-medium ${isBuy ? 'text-gold-400' : 'text-red-400'}`}>
                    {isBuy ? '+' : '-'}{t.goldGrams.toFixed(4)} g
                  </p>
                  <p className="text-xs text-gray-500">
                    ৳{t.amountBDT.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const ProfileView = () => {
  const { auth, updateProfile, logout } = useContext(AuthContext)!;
  
  const [name, setName] = useState(auth.user?.name || '');
  const [phone, setPhone] = useState(auth.user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleUpdate = async () => {
    setLoading(true);
    setMsg({ text: '', type: '' });
    
    try {
      const success = await updateProfile(name, phone);
      if (success) {
        setMsg({ text: 'Profile updated successfully!', type: 'success' });
      } else {
        setMsg({ text: 'Failed to update profile.', type: 'error' });
      }
    } catch (e) {
      setMsg({ text: 'An unexpected error occurred.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
       <header className="flex items-center gap-4 py-2">
        <button onClick={() => window.location.hash = 'home'} className="text-gray-400 hover:text-white">
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-xl font-bold text-white">My Profile</h1>
      </header>

      {/* Profile Card */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-dark-700 border-2 border-gold-500/50 flex items-center justify-center mb-4 relative">
          <i className="fas fa-user text-4xl text-gold-500"></i>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-dark-800 rounded-full border border-gray-700 flex items-center justify-center text-xs text-gray-400 cursor-not-allowed">
            <i className="fas fa-camera"></i>
          </div>
        </div>
        <h2 className="text-xl font-bold text-white">{auth.user?.name}</h2>
        <p className="text-gray-500 text-sm">User ID: {auth.user?.id}</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Personal Information</h3>
        <Input 
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<i className="fas fa-user"></i>}
        />
        <Input 
          label="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          icon={<i className="fas fa-phone"></i>}
        />
        <Input 
          label="Email Address"
          value={auth.user?.email || ''}
          readOnly
          className="opacity-60 cursor-not-allowed"
          icon={<i className="fas fa-envelope"></i>}
        />

        {msg.text && (
          <p className={`text-sm text-center ${msg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{msg.text}</p>
        )}

        <Button onClick={handleUpdate} isLoading={loading}>
          Update Profile
        </Button>
      </div>

      <div className="pt-6 border-t border-gray-800 space-y-4">
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Security</h3>
        <button className="w-full bg-dark-800 p-4 rounded-xl flex items-center justify-between border border-gray-800 hover:border-gray-700 transition-colors">
          <div className="flex items-center gap-3">
            <i className="fas fa-lock text-gray-500"></i>
            <span className="text-gray-300">Change Password</span>
          </div>
          <i className="fas fa-chevron-right text-gray-600"></i>
        </button>

        <Button variant="danger" onClick={logout} className="mt-4">
          <i className="fas fa-sign-out-alt mr-2"></i> Logout
        </Button>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { auth, logout } = useContext(AuthContext)!;
  const { goldPrice, refreshPrice, transactions, refreshTransactions, paymentMethods, refreshPaymentMethods } = useContext(DataContext)!;
  const [newPrice, setNewPrice] = useState(goldPrice?.pricePerGram?.toString() || '');
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'settings'>('overview');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filter Pending Transactions
  const pendingTransactions = transactions.filter(t => t.status === TransactionStatus.PENDING);

  const handleUpdatePrice = async () => {
    setUpdating(true);
    await mockBackend.setGoldPrice(Number(newPrice), auth.user!.id);
    await refreshPrice();
    setUpdating(false);
  };

  const handleTransactionAction = async (txnId: string, action: 'APPROVE' | 'REJECT') => {
    setProcessingId(txnId);
    await mockBackend.processTransaction(txnId, action);
    await refreshTransactions();
    setProcessingId(null);
  };

  const handleUpdatePaymentDetail = async (method: PaymentMethod, detail: string) => {
    await mockBackend.updatePaymentMethod(method, detail);
    await refreshPaymentMethods();
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <header className="flex justify-between items-center py-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        <button onClick={logout} className="text-red-400 text-sm">Logout</button>
      </header>

      {/* Tabs */}
      <div className="flex bg-dark-800 p-1 rounded-xl">
        <button onClick={() => setActiveTab('overview')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-gold-500 text-dark-900' : 'text-gray-400'}`}>Overview</button>
        <button onClick={() => setActiveTab('approvals')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'approvals' ? 'bg-gold-500 text-dark-900' : 'text-gray-400'}`}>Approvals ({pendingTransactions.length})</button>
        <button onClick={() => setActiveTab('settings')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-gold-500 text-dark-900' : 'text-gray-400'}`}>Payment Config</button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Price Control */}
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-gray-400 text-sm mb-4">Set Today's Gold Price</h2>
            <div className="flex gap-4">
              <Input 
                type="number" 
                value={newPrice} 
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Price per gram"
                className="text-lg font-bold"
              />
              <Button className="w-auto" onClick={handleUpdatePrice} isLoading={updating}>
                Update
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Last updated: {new Date(goldPrice?.updatedAt || '').toLocaleString()}</p>
          </div>

          {/* Transaction List */}
          <div>
            <h2 className="text-white font-semibold mb-4">Recent Transactions</h2>
            <div className="space-y-3">
              {transactions.slice(0, 10).map(t => (
                <div key={t.id} className="bg-dark-800 p-4 rounded-lg flex justify-between border border-gray-800">
                   <div>
                     <p className="text-white text-sm">User ID: {t.userId}</p>
                     <p className="text-xs text-gray-500">{t.method} • <span className={t.status === 'PENDING' ? 'text-yellow-500' : t.status === 'SUCCESS' ? 'text-green-500' : 'text-red-500'}>{t.status}</span></p>
                   </div>
                   <div className="text-right">
                     <p className={`text-sm ${t.type === TransactionType.SELL ? 'text-red-400' : 'text-gold-500'}`}>
                        {t.type === TransactionType.SELL ? 'SELL' : 'BUY'} ৳ {t.amountBDT}
                     </p>
                     <p className="text-xs text-gray-400">{t.goldGrams.toFixed(4)} g</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <h2 className="text-white font-semibold">Pending Requests</h2>
          {pendingTransactions.length === 0 ? (
             <p className="text-gray-500 text-center py-10">No pending transactions.</p>
          ) : (
            pendingTransactions.map(t => (
              <div key={t.id} className="bg-dark-800 border border-gold-500/30 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                   <div>
                      <p className="text-white font-bold text-lg">
                        {t.type === TransactionType.SELL ? 'User Selling Gold' : 'User Buying Gold'}
                      </p>
                      <p className={`text-sm font-mono ${t.type === TransactionType.SELL ? 'text-red-400' : 'text-gold-400'}`}>
                        {t.type === TransactionType.SELL ? '-' : '+'}{t.goldGrams.toFixed(4)} g for ৳ {t.amountBDT.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Via {t.method} • {new Date(t.date).toLocaleDateString()}</p>
                   </div>
                   <span className="bg-yellow-500/20 text-yellow-500 text-xs px-2 py-1 rounded">Pending</span>
                </div>
                
                {/* Proof Viewer for BUY */}
                {t.type === TransactionType.BUY && (
                    t.screenshot ? (
                    <div className="bg-black/50 p-2 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Payment Proof:</p>
                        <a href={t.screenshot} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 text-sm hover:underline">
                        <i className="fas fa-image"></i> View Screenshot
                        </a>
                    </div>
                    ) : (
                    <p className="text-xs text-red-400 italic">No screenshot attached</p>
                    )
                )}

                {/* Payout Details for SELL */}
                {t.type === TransactionType.SELL && (
                    <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-lg">
                        <p className="text-xs text-red-300 font-bold uppercase mb-1">Action Required: Send Money</p>
                        <p className="text-sm text-white break-all">{t.userPaymentDetails}</p>
                        <p className="text-xs text-gray-400 mt-2">Send ৳ {t.amountBDT.toLocaleString()} to user then click Approve.</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                   <Button variant="danger" onClick={() => handleTransactionAction(t.id, 'REJECT')} isLoading={processingId === t.id} disabled={!!processingId}>
                     Reject
                   </Button>
                   <Button onClick={() => handleTransactionAction(t.id, 'APPROVE')} isLoading={processingId === t.id} disabled={!!processingId}>
                     {t.type === TransactionType.SELL ? 'Confirm Paid' : 'Approve'}
                   </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4">
          <h2 className="text-white font-semibold">Payment Instructions (For Buyers)</h2>
          {paymentMethods.map(method => (
            <div key={method.name} className="bg-dark-800 p-4 rounded-xl border border-gray-800">
               <div className="flex justify-between items-center mb-2">
                 <h3 className="text-gold-500 font-bold">{method.name}</h3>
               </div>
               <textarea 
                  className="w-full bg-dark-900 border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-gold-500 outline-none min-h-[80px]"
                  defaultValue={method.details}
                  onBlur={(e) => handleUpdatePaymentDetail(method.name, e.target.value)}
               />
               <p className="text-xs text-gray-500 mt-1">Click outside to save changes.</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main Layout & Logic ---

const AppContent = () => {
  const { auth } = useContext(AuthContext)!;
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      setCurrentView(hash || 'home');
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  if (!auth.isAuthenticated) {
    return <LoginView />;
  }

  if (auth.user?.role === UserRole.ADMIN) {
    return (
      <div className="min-h-screen bg-dark-900 px-4 max-w-md mx-auto relative">
        <AdminDashboard />
      </div>
    );
  }

  // User Views Router
  let content;
  switch (currentView) {
    case 'buy': content = <BuyGoldView />; break;
    case 'sell': content = <SellGoldView />; break;
    case 'history': content = <HistoryView />; break;
    case 'profile': content = <ProfileView />; break;
    case 'home':
    default: content = <UserDashboard />;
  }

  return (
    <div className="min-h-screen bg-dark-900 px-4 max-w-md mx-auto relative shadow-2xl shadow-black">
      {content}
      
      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-dark-800/90 backdrop-blur-md border-t border-gray-800 py-3 px-6 flex justify-between items-center z-50">
        <button onClick={() => window.location.hash = 'home'} className={`flex flex-col items-center gap-1 ${currentView === 'home' ? 'text-gold-500' : 'text-gray-600'}`}>
          <i className="fas fa-home text-xl"></i>
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button onClick={() => window.location.hash = 'buy'} className={`flex flex-col items-center gap-1 ${currentView === 'buy' ? 'text-gold-500' : 'text-gray-600'}`}>
          <div className="bg-gold-500 text-dark-900 w-10 h-10 rounded-full flex items-center justify-center -mt-8 border-4 border-dark-900 shadow-lg shadow-gold-500/20">
            <i className="fas fa-plus text-lg"></i>
          </div>
        </button>
        <button onClick={() => window.location.hash = 'history'} className={`flex flex-col items-center gap-1 ${currentView === 'history' ? 'text-gold-500' : 'text-gray-600'}`}>
          <i className="fas fa-wallet text-xl"></i>
          <span className="text-[10px] font-medium">History</span>
        </button>
        <button onClick={() => window.location.hash = 'profile'} className={`flex flex-col items-center gap-1 ${currentView === 'profile' ? 'text-gold-500' : 'text-gray-600'}`}>
          <i className="fas fa-user-circle text-xl"></i>
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default function App() {
  const [auth, setAuth] = useState<AuthState>({ user: null, isAuthenticated: false, isLoading: true });
  
  // Data State
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodInfo[]>([]);

  // --- Auth Actions ---
  const refreshUser = async () => {
    const user = await mockBackend.getCurrentUser();
    setAuth(prev => ({ ...prev, user, isAuthenticated: !!user, isLoading: false }));
  };

  const login = async (email: string) => {
    const res = await mockBackend.login(email);
    if (res.success && res.data) {
      setAuth({ user: res.data, isAuthenticated: true, isLoading: false });
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, phone: string) => {
    const res = await mockBackend.register(name, email, phone);
    if (res.success && res.data) {
      setAuth({ user: res.data, isAuthenticated: true, isLoading: false });
      return true;
    }
    return false;
  };

  const updateProfile = async (name: string, phone: string) => {
    if (!auth.user) return false;
    const res = await mockBackend.updateUser(auth.user.id, { name, phone });
    if (res.success && res.data) {
      setAuth(prev => ({ ...prev, user: res.data! }));
      return true;
    }
    return false;
  };

  const logout = () => {
    mockBackend.logout();
    setAuth({ user: null, isAuthenticated: false, isLoading: false });
  };

  // --- Data Actions ---
  const refreshPrice = async () => {
    const price = await mockBackend.getGoldPrice();
    setGoldPrice(price);
  };

  const refreshPaymentMethods = async () => {
    const methods = await mockBackend.getPaymentMethods();
    setPaymentMethods(methods);
  };

  const refreshTransactions = async () => {
    if (auth.user) {
      const txns = auth.user.role === UserRole.ADMIN 
        ? await mockBackend.getAllTransactions()
        : await mockBackend.getUserTransactions(auth.user.id);
      setTransactions(txns);
    }
  };

  // Init
  useEffect(() => {
    refreshUser();
    refreshPrice();
    refreshPaymentMethods();
  }, []);

  useEffect(() => {
    if (auth.isAuthenticated) {
      refreshTransactions();
    }
  }, [auth.isAuthenticated, auth.user?.role]);

  if (auth.isLoading) {
    return <div className="min-h-screen bg-dark-900 flex items-center justify-center text-gold-500"><i className="fas fa-spinner fa-spin text-3xl"></i></div>;
  }

  return (
    <AuthContext.Provider value={{ auth, login, register, updateProfile, logout, refreshUser }}>
      <DataContext.Provider value={{ goldPrice, refreshPrice, transactions, refreshTransactions, paymentMethods, refreshPaymentMethods }}>
        <AppContent />
      </DataContext.Provider>
    </AuthContext.Provider>
  );
}
