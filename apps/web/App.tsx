import React, { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Plus, Trash2, Filter, ArrowUpRight, ArrowDownLeft, PieChart, Shield, Calendar, Tag, AlertCircle, CheckCircle2, ChevronDown, DollarSign, Sparkles } from 'lucide-react';

interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

export default function FinanceDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, title: 'حقوق و دستمزد ماهانه', amount: 38000000, type: 'income', category: 'سرمایه‌گذاری', date: '۱۴۰۳/۰۶/۰۱' },
    { id: 2, title: 'خرید مواد غذایی و سوپرمارکت', amount: 4500000, type: 'expense', category: 'خوراک', date: '۱۴۰۳/۰۶/۰۳' },
    { id: 3, title: 'اجاره‌بهای ماهانه آپارتمان', amount: 12000000, type: 'expense', category: 'مسکن', date: '۱۴۰۳/۰۶/۰۵' },
    { id: 4, title: 'بنزین و سرویس دوره‌ای خودرو', amount: 1850000, type: 'expense', category: 'حمل‌ونقل', date: '۱۴۰۳/۰۶/۰۸' },
    { id: 5, title: 'سود سهام و صندوق سرمایه‌گذاری', amount: 5200000, type: 'income', category: 'سرمایه‌گذاری', date: '۱۴۰۳/۰۶/۱۰' },
    { id: 6, title: 'اشتراک فیلیمو و سینما', amount: 650000, type: 'expense', category: 'سرگرمی', date: '۱۴۰۳/۰۶/۱۴' },
  ]);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');
  const [newCategory, setNewCategory] = useState('خوراک');

  const monthlyBudgetLimit = 25000000;

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const totalBalance = totalIncome - totalExpense;

  const budgetUsagePercent = Math.min(100, Math.round((totalExpense / monthlyBudgetLimit) * 100));

  const formatToman = (val: number) => new Intl.NumberFormat('fa-IR').format(val) + ' تومان';

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount || Number(newAmount) <= 0) return;

    const newTx: Transaction = {
      id: Date.now(),
      title: newTitle.trim(),
      amount: Number(newAmount),
      type: newType,
      category: newCategory,
      date: '۱۴۰۳/۰۶/۱۸',
    };

    setTransactions([newTx, ...transactions]);
    setNewTitle('');
    setNewAmount('');
    setShowAddModal(false);
  };

  const handleDeleteTransaction = (id: number) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const filteredTransactions = transactions
    .filter(t => filterCategory === 'all' || t.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'amount') return b.amount - a.amount;
      return b.id - a.id;
    });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white p-4 sm:p-8" dir="rtl">
      
      {/* Top Header */}
      <header className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">داشبورد مدیریت مالی و بودجه‌بندی هوشمند</h1>
            <p className="text-xs text-slate-400 font-medium">کنترل درآمدها، مخارج ماهانه و پایش هوشمند مصرف سقف بودجه</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 active:scale-95 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>ثبت تراکنش جدید</span>
        </button>
      </header>

      {/* 3 Metric Cards */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 my-8">
        {/* Card 1: Balance */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800/90 p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400">موجودی کل قابل استفاده</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mb-2">{formatToman(totalBalance)}</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+۱۴.۵٪ نسبت به ماه گذشته</span>
          </div>
        </div>

        {/* Card 2: Total Income */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800/90 p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400">مجموع دریافتی و درآمد ماه</span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-400 mb-2">{formatToman(totalIncome)}</div>
          <div className="flex items-center gap-1.5 text-xs text-teal-400 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+۸.۲٪ افزایش درآمد</span>
          </div>
        </div>

        {/* Card 3: Total Expenses */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800/90 p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400">مجموع هزینه‌ها و مخارج</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 mb-2">{formatToman(totalExpense)}</div>
          <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-۴.۱٪ کاهش هزینه‌ها</span>
          </div>
        </div>
      </section>

      {/* Budget Progress Bar */}
      <section className="max-w-6xl mx-auto rounded-3xl bg-slate-900/80 border border-slate-800/90 p-6 mb-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span>نوار کنترل و پایش بودجه ماهانه</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">سقف تعیین‌شده بودجه مصرفی: {formatToman(monthlyBudgetLimit)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black px-3 py-1 rounded-xl border ${
              budgetUsagePercent > 80
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}>
              {budgetUsagePercent}٪ مصرف شده
            </span>
          </div>
        </div>

        {/* Progress Fill */}
        <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              budgetUsagePercent > 80 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-teal-500 to-emerald-400'
            }`}
            style={{ width: `${budgetUsagePercent}%` }}
          />
        </div>

        {budgetUsagePercent > 80 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-rose-400 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>هشدار بودجه: شما بیش از ۸۰ درصد از سقف بودجه ماهانه خود را مصرف کرده‌اید!</span>
          </div>
        )}
      </section>

      {/* Transaction List Section */}
      <section className="max-w-6xl mx-auto rounded-3xl bg-slate-900/80 border border-slate-800/90 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-6">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>ریز تراکنش‌های اخیر</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">نمایش {filteredTransactions.length} تراکنش ثبت شده</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">همه دسته‌بندی‌ها</option>
              <option value="خوراک">خوراک</option>
              <option value="مسکن">مسکن</option>
              <option value="حمل‌ونقل">حمل‌ونقل</option>
              <option value="سرگرمی">سرگرمی</option>
              <option value="سرمایه‌گذاری">سرمایه‌گذاری</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="date">مرتب‌سازی: جدیدترین</option>
              <option value="amount">مرتب‌سازی: بیشترین مبلغ</option>
            </select>
          </div>
        </div>

        {/* Transactions Table/List */}
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-xs">هیچ تراکنشی در این دسته‌بندی یافت نشد.</p>
            </div>
          ) : (
            filteredTransactions.map(tx => {
              const isIncome = tx.type === 'income';
              return (
                <div
                  key={tx.id}
                  className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 p-4 rounded-2xl flex items-center justify-between gap-4 transition group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome ? 'bg-teal-500/10 text-teal-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-white group-hover:text-emerald-400 transition">{tx.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span className="bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 text-slate-300">{tx.category}</span>
                        <span>•</span>
                        <span>{tx.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`font-black text-xs sm:text-sm ${isIncome ? 'text-teal-400' : 'text-rose-400'}`}>
                      {isIncome ? '+' : '-'} {formatToman(tx.amount)}
                    </span>
                    <button
                      onClick={() => handleDeleteTransaction(tx.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                      title="حذف تراکنش"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-black text-lg text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              <span>ثبت تراکنش جدید</span>
            </h3>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5">عنوان تراکنش:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: خرید مواد خوراکی، پاداش..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl p-3 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5">مبلغ به تومان:</label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="مثال: 500000"
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl p-3 text-xs text-white outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">نوع تراکنش:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewType('expense')}
                      className={`py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        newType === 'expense' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-950 border border-slate-800 text-slate-400'
                      }`}
                    >
                      هزینه
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewType('income')}
                      className={`py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        newType === 'income' ? 'bg-teal-600 text-white shadow-md' : 'bg-slate-950 border border-slate-800 text-slate-400'
                      }`}
                    >
                      درآمد
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">دسته‌بندی:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-2xl p-3 outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="خوراک">خوراک</option>
                    <option value="مسکن">مسکن</option>
                    <option value="حمل‌ونقل">حمل‌ونقل</option>
                    <option value="سرگرمی">سرگرمی</option>
                    <option value="سرمایه‌گذاری">سرمایه‌گذاری</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 font-bold text-xs hover:text-white cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  ثبت تراکنش
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
