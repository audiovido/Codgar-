import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Star, Shield, Zap, Globe, Smartphone, Send } from 'lucide-react';

export default function Website() {
  const [likes, setLikes] = useState(254);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white pb-20">
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">یه سایت میوه فروشی برام بساز</span>
          </div>
          <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition cursor-pointer">
            شروع پروژه
          </button>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>طراحی مدرن و کاملاً واکنش‌گرا</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
          یه سایت میوه فروشی برام بساز
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          طراحی شده بر پایه مدرن‌ترین استانداردهای وب با تعاملات زنده و سرعت بالا.
        </p>
        <button
          onClick={() => setLikes(l => l + 1)}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition flex items-center gap-2 mx-auto cursor-pointer"
        >
          <Star className="w-4 h-4 fill-current" />
          <span>پسندیدن ({likes})</span>
        </button>
      </section>
    </div>
  );
}