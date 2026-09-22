# 🚀 کدگر (CODGAR) - Autonomous AI Coding Studio & Multi-Router Engine

کدگر (Codgar) یک محیط توسعه مستقل و پیشرفته (Autonomous AI Coding Agent & Full-Stack Architect) است که فرانت‌اند مدرن (React 19 + Tailwind CSS) و بک‌اند ماژولار قدرتمند (Node.js + Express) را به همراه ران‌تایم هوشمند، کامپایلر چندزبانه، و استخر بی‌نهایت توکن (Infinite Token Pool) در یک پکیج آماده و کامل ارائه می‌دهد.

---

## ⚡ راه‌اندازی سریع در هر سیستم با یک فرمان (Quick One-Command Setup)

برای اینکه پروژه روی هر کامپیوتر یا سرور دیگری (ویندوز، مک، لینوکس) با یک دستور از گیت‌هاب دانلود و اجرا شود:

### روش ۱: فرمان جادویی تک‌خطی (One-Liner)

```bash
git clone <آدرس_ریپازیتوری_گیتهاب> && cd codgar && npm run setup
```

یا اگر دستورات استاندارد را ترجیح می‌دهید:

```bash
# ۱. کلون کردن مخزن
git clone <YOUR_GITHUB_REPO_URL>
cd codgar

# ۲. نصب وابستگی‌های فرانت‌اند و بک‌اند
npm install

# ۳. تنظیم کلیدها (تنظیم حداقل یک کلید اختیاری یا اجباری)
cp .env.example .env

# ۴. اجرای هم‌زمان سرور بک‌اند و رابط فرانت‌اند
npm run dev
```

پروژه به صورت خودکار روی پورت **3000** بالا می‌آید:
👉 **http://localhost:3000**

---

## 🛠️ اسکریپت‌های موجود در پروژه (NPM Scripts)

| دستور | عملکرد |
| :--- | :--- |
| `npm run dev` | اجرای محیط توسعه کامل (بک‌اند با `tsx` + فرانت‌اند با `Vite` روی پورت 3000) |
| `npm run build` | کامپایل فرانت‌اند به استاتیک در `dist/` و باندل سرور با `esbuild` به `dist/server.cjs` |
| `npm start` | اجرای نسخه نهایی و پروداکشن (`node dist/server.cjs`) |
| `npm run lint` | بررسی کامل ساختار تایپ‌اسکریپت و بدون خطا بودن کدها |
| `npm run setup` | کپی خودکار `.env.example` به `.env` و نصب سریع وابستگی‌ها |

---

## 📦 پیش‌نیازهای سیستمی (Prerequisites)

- **Node.js**: نسخه 20 به بالا (توصیه شده: Node.js 20.x یا 22.x LTS)
- **NPM**: نسخه 10 به بالا (به همراه Node نصب می‌شود)
- **Git**: جهت کلون کردن مخزن

---

## 🔑 تنظیم کلیدهای API (اختیاری اما پیشنهادی)

فایل `.env` را باز کنید:
```env
GEMINI_API_KEY="کلید_جمنای_شما"
ANTHROPIC_API_KEY="کلید_کلود_اختیاری"
```
> **نکته مهم**: حتی بدون کلید اختصاصی، استخر توکن چندگانه کدگر (`InfiniteTokenPool`) به صورت خودکار از روترهای پشتیبان (OmniRoute, 9Router, VansRouter) برای اجرای دستورات استفاده می‌کند.

---

## 🏗️ ساختار پروژه (Architecture)

- `server.ts`: هسته اصلی سرور اکسپرس و ارکستراتور هوش مصنوعی و ترمینال.
- `server/`: ماژول‌های زیرساختی شامل KeyManager, InfiniteTokenPool, AgentRuntime, UniversalCompiler.
- `src/`: کامپوننت‌های فرانت‌اند (React 19, Motion, Lucide Icons, Tailwind CSS v4).
- `BACKEND_ARCHITECTURE.md`: مستند کامل ریزبه‌ریز تمامی اندپوینت‌های API و کارکرد روترها.
