import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Star, ShieldCheck, Truck, Sparkles, Heart, Check, Plus, Minus, Trash2, Tag, Percent, ArrowLeft, X, Flame, Smartphone, Laptop, Headphones, Watch, Tv, RefreshCw } from 'lucide-react';

export default function DigikalaStore() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{ id: number; name: string; price: number; oldPrice: number; qty: number; image: string }[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 24, seconds: 45 });
  const [likedItems, setLikedItems] = useState<Record<number, boolean>>({});

  // Countdown timer for incredible offers
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const products = [
    {
      id: 1,
      name: 'گوشی موبایل سامسونگ Galaxy S24 Ultra دو سیم کارت',
      category: 'mobile',
      price: 68500000,
      oldPrice: 74900000,
      discount: 9,
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
      tag: 'شگفت‌انگیز ویژه',
      rating: 4.9,
      reviews: 1420,
      seller: 'دیجی‌کالا',
      isSpecial: true,
      specs: 'حافظه 256 رم 12 | دوربین 200 مگاپیکسل | تراشه Snapdragon 8 Gen 3'
    },
    {
      id: 2,
      name: 'لپ تاپ 13.6 اینچی اپل مدل MacBook Air M2 2023',
      category: 'laptop',
      price: 58900000,
      oldPrice: 64500000,
      discount: 8,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
      tag: 'پرفروش‌ترین',
      rating: 4.8,
      reviews: 890,
      seller: 'دیجی‌پلاس',
      isSpecial: true,
      specs: 'پردازنده Apple M2 | رم 8GB | حافظه 256GB SSD'
    },
    {
      id: 3,
      name: 'هدفون بلوتوثی سامسونگ Galaxy Buds2 Pro بی سیم',
      category: 'audio',
      price: 5400000,
      oldPrice: 6900000,
      discount: 22,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
      tag: 'پیشنهاد روز',
      rating: 4.7,
      reviews: 2150,
      seller: 'دیجی‌کالا',
      isSpecial: true,
      specs: 'نویز کنسلینگ فعال ANC | صدای ۲۴ بیتی Hi-Fi | ضد آب IPX7'
    },
    {
      id: 4,
      name: 'ساعت هوشمند اپل مدل Watch Series 9 Aluminum 45mm',
      category: 'wearable',
      price: 18400000,
      oldPrice: 20900000,
      discount: 12,
      image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
      tag: 'ضمانت اصالت کالا',
      rating: 4.9,
      reviews: 640,
      seller: 'دیجی‌کالا',
      isSpecial: false,
      specs: 'سنسور اکسیژن خون و نوار قلب | نمایشگر همیشه روشن Retina'
    },
    {
      id: 5,
      name: 'کنسول بازی سونی PlayStation 5 Slim با ظرفیت 1 ترابایت',
      category: 'gaming',
      price: 32800000,
      oldPrice: 35500000,
      discount: 7,
      image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80',
      tag: 'شگفت‌انگیز اصلی',
      rating: 4.9,
      reviews: 3100,
      seller: 'دیجی‌کالا',
      isSpecial: true,
      specs: 'دسته DualSense | رزولوشن 4K/120Hz | حافظه SSD سفارشی 1TB'
    },
    {
      id: 6,
      name: 'تلویزیون هوشمند 55 اینچ 4K Ultra HD ال‌جی OLED',
      category: 'tv',
      price: 49000000,
      oldPrice: 55000000,
      discount: 11,
      image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=80',
      tag: 'ارسال رایگان اکسپرس',
      rating: 4.8,
      reviews: 420,
      seller: 'بازرگانی مادیران',
      isSpecial: false,
      specs: 'پنل OLED 120Hz | دالبی ویژن و دالبی اتموس | هوش مصنوعی AI Sound'
    }
  ];

  const categories = [
    { id: 'all', name: 'همه دسته‌ها', icon: Sparkles },
    { id: 'mobile', name: 'موبایل و تبلت', icon: Smartphone },
    { id: 'laptop', name: 'لپ‌تاپ و کامپیوتر', icon: Laptop },
    { id: 'audio', name: 'صوتی و هندزفری', icon: Headphones },
    { id: 'wearable', name: 'ساعت هوشمند', icon: Watch },
    { id: 'gaming', name: 'کنسول و گیمینگ', icon: Flame },
  ];

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.specs.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: typeof products[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, oldPrice: product.oldPrice, image: product.image, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean) as typeof cart);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalDiscount = cart.reduce((sum, item) => sum + ((item.oldPrice - item.price) * item.qty), 0);

  const formatPrice = (p: number) => new Intl.NumberFormat('fa-IR').format(p) + ' تومان';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-rose-500 selection:text-white pb-24" dir="rtl">
      
      {/* Top Banner */}
      <div className="bg-rose-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 shadow-sm">
        <Percent className="w-4 h-4 text-amber-300" />
        <span>جشنواره تخفیف شگفت‌انگیز دیجی‌کالا | ارسال رایگان سفارش‌های بالای ۵۰۰ هزار تومان</span>
      </div>

      {/* Main Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-rose-600 text-white px-3.5 py-1.5 rounded-2xl font-black text-xl tracking-tighter shadow-md shadow-rose-600/20">
              <span>دیجی‌کالا</span>
            </div>
            <span className="hidden sm:inline-block text-[11px] font-bold text-slate-400 border-r border-slate-200 pr-3">
              فروشگاه اینترنتی آنلاین
            </span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در بین بیش از ۴,۰۰۰,۰۰۰ کالا در دیجی‌کالا..."
              className="w-full bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-slate-800 text-xs sm:text-sm rounded-2xl py-3 pr-11 pl-4 border border-transparent focus:border-rose-500 outline-none transition-all shadow-inner"
            />
            <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* User & Cart Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCart(true)}
              className="relative p-3 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200/80 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-rose-600 text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>
            <button className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm cursor-pointer">
              <span>ورود / ثبت‌نام</span>
            </button>
          </div>
        </div>

        {/* Category Navigation Bar */}
        <div className="border-t border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none">
            {categories.map(cat => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Incredible Offers Showcase Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 my-6">
        <div className="rounded-3xl bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 z-10 text-center md:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
              <Flame className="w-4 h-4 text-amber-300 fill-current" />
              <span>پیشنهاد شگفت‌انگیز اختصاصی</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">تخفیف‌های استثنایی دیجی‌کالا</h2>
            <p className="text-xs sm:text-sm text-rose-100 max-w-xl">
              فرصت محدود برای خرید جدیدترین کالاهای دیجیتال و گجت‌های هوشمند با ضمانت بازگشت ۷ روزه.
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg px-5 py-3 rounded-2xl border border-white/20 z-10">
            <div className="text-center">
              <span className="text-xl sm:text-2xl font-black block font-mono">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-[10px] text-rose-200">ساعت</span>
            </div>
            <span className="font-bold text-lg">:</span>
            <div className="text-center">
              <span className="text-xl sm:text-2xl font-black block font-mono">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-[10px] text-rose-200">دقیقه</span>
            </div>
            <span className="font-bold text-lg">:</span>
            <div className="text-center">
              <span className="text-xl sm:text-2xl font-black block font-mono">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-[10px] text-rose-200">ثانیه</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-600" />
            <span>منتخب محصولات دیجی‌کالا</span>
          </h3>
          <span className="text-xs text-slate-500 font-bold">
            نمایش {filteredProducts.length} کالا
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => {
            const isLiked = likedItems[product.id];
            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-rose-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group p-5"
              >
                <div>
                  {/* Image & Badges */}
                  <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-4/3 mb-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.discount > 0 && (
                      <span className="absolute top-3 right-3 bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded-xl shadow-md">
                        {product.discount}٪ تخفیف
                      </span>
                    )}
                    <button
                      onClick={() => setLikedItems(prev => ({ ...prev, [product.id]: !prev[product.id] }))}
                      className="absolute top-3 left-3 w-8 h-8 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-600 hover:text-rose-600 transition shadow-sm"
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-rose-600' : ''}`} />
                    </button>
                  </div>

                  {/* Title & Specs */}
                  <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2 mb-2">
                    {product.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                    {product.specs}
                  </p>
                </div>

                {/* Rating & Seller */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{product.rating}</span>
                      <span className="text-slate-400 font-normal">({product.reviews})</span>
                    </div>
                    <span className="text-slate-400 font-medium">{product.seller}</span>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      {product.oldPrice > product.price && (
                        <span className="text-[11px] text-slate-400 line-through block">
                          {formatPrice(product.oldPrice)}
                        </span>
                      )}
                      <span className="text-sm sm:text-base font-black text-rose-600 block">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 active:scale-95 transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>افزودن</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Cart Drawer Modal */}
      {showCart && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 animate-in slide-in-from-left duration-300">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-rose-600" />
                  <h3 className="font-extrabold text-base text-slate-900">سبد خرید شما</h3>
                  <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-md">
                    {totalItems} کالا
                  </span>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30 text-rose-600" />
                    <p className="text-sm font-bold">سبد خرید شما خالی است</p>
                    <p className="text-xs mt-1">کالاهای مورد نظر خود را به سبد اضافه کنید.</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-xs text-slate-900 truncate mb-1">{item.name}</h5>
                        <span className="text-xs font-black text-rose-600 block mb-2">{formatPrice(item.price)}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black px-1">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.id, 1)}
                            className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Checkout Section */}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-200 space-y-3">
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600 font-bold">
                    <span>سود شما از این خرید:</span>
                    <span>{formatPrice(totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900">
                  <span>مبلغ قابل پرداخت:</span>
                  <span className="text-rose-600">{formatPrice(totalPrice)}</span>
                </div>
                <button
                  onClick={() => {
                    setOrderComplete(true);
                    setCart([]);
                    setShowCart(false);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-lg shadow-rose-600/30 transition cursor-pointer"
                >
                  تکمیل فرآیند خرید و پرداخت
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Notification */}
      {orderComplete && (
        <div className="fixed bottom-6 left-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <Check className="w-5 h-5 bg-white/20 rounded-full p-1" />
          <div>
            <span className="font-bold text-sm block">سفارش شما با موفقیت ثبت گردید!</span>
            <span className="text-[11px] text-emerald-100">فاکتور و کد پیگیری به زودی ارسال خواهد شد.</span>
          </div>
        </div>
      )}

    </div>
  );
}
