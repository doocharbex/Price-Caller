import { useState, useEffect, useCallback, useRef } from 'react';
import { Product } from './types';
import { initialProducts } from './data/products';
import { useUSDTPrice } from './hooks/useUSDTPrice';
import { ProductCard } from './components/ProductCard';
import { PriceTicker } from './components/PriceTicker';

function App() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const { usdtPrice, isLoading, error, lastUpdate, isConnected } = useUSDTPrice();
  const [filterLine, setFilterLine] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const basePricesRef = useRef<Record<string, number>>({});
  const priceHistoryRef = useRef<Record<string, number[]>>({});

  // محاسبه قیمت‌ها و بررسی حد کاهش
  const updatePrices = useCallback(() => {
    if (usdtPrice <= 0) return;

    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        const newPriceToman = product.priceUSD * usdtPrice;

        // ذخیره قیمت پایه (اولین قیمتی که ثبت شده)
        if (!basePricesRef.current[product.id]) {
          basePricesRef.current[product.id] = newPriceToman;
        }

        // ذخیره تاریخچه قیمت
        if (!priceHistoryRef.current[product.id]) {
          priceHistoryRef.current[product.id] = [];
        }
        priceHistoryRef.current[product.id].push(newPriceToman);
        // نگه داشتن فقط ۲۰ قیمت آخر
        if (priceHistoryRef.current[product.id].length > 20) {
          priceHistoryRef.current[product.id].shift();
        }

        const basePrice = basePricesRef.current[product.id];
        
        // محاسبه درصد تغییر از قیمت پایه
        const priceChangePercent = ((newPriceToman - basePrice) / basePrice) * 100;
        
        // بررسی حد کاهش: اگر قیمت به اندازه stopLoss% از قیمت پایه کاهش یافت
        const isSellingOpen = priceChangePercent > -product.stopLoss;

        return {
          ...product,
          previousPriceToman: product.currentPriceToman || newPriceToman,
          currentPriceToman: newPriceToman,
          isSellingOpen,
          lastUpdate: new Date(),
        };
      })
    );
  }, [usdtPrice]);

  useEffect(() => {
    updatePrices();
  }, [updatePrices]);

  // فیلتر محصولات
  const lines = ['all', ...new Set(initialProducts.map((p) => p.line))];

  const filteredProducts = products.filter((product) => {
    const matchesLine = filterLine === 'all' || product.line === filterLine;
    const matchesSearch =
      product.name.includes(searchQuery) ||
      product.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLine && matchesSearch;
  });

  // آمار کلی
  const openSellingCount = products.filter((p) => p.isSellingOpen).length;
  const closedSellingCount = products.filter((p) => !p.isSellingOpen).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" dir="rtl">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.15) 2px, transparent 0)`,
          backgroundSize: '50px 50px',
        }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl">☕</span>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">
                سیستم استعلام قیمت قهوه
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                بروزرسانی لحظه‌ای قیمت‌ها بر اساس نرخ تتر | WebSocket
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-4 md:gap-6 mt-6 flex-wrap">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 md:px-5 py-3 flex items-center gap-3">
              <span className="text-2xl">📦</span>
              <div>
                <p className="text-gray-400 text-xs">کل محصولات</p>
                <p className="text-white font-bold text-lg">{products.length}</p>
              </div>
            </div>
            <div className="bg-emerald-900/30 border border-emerald-700/30 rounded-xl px-4 md:px-5 py-3 flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="text-emerald-400/70 text-xs">فروش باز</p>
                <p className="text-emerald-400 font-bold text-lg">{openSellingCount}</p>
              </div>
            </div>
            <div className="bg-red-900/30 border border-red-700/30 rounded-xl px-4 md:px-5 py-3 flex items-center gap-3">
              <span className="text-2xl">🚫</span>
              <div>
                <p className="text-red-400/70 text-xs">فروش بسته</p>
                <p className="text-red-400 font-bold text-lg">{closedSellingCount}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Price Ticker */}
        <PriceTicker
          usdtPrice={usdtPrice}
          isLoading={isLoading}
          isConnected={isConnected}
          lastUpdate={lastUpdate}
          error={error}
        />

        {/* Filters */}
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <i className="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
              <input
                type="text"
                placeholder="جستجوی محصول..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl pr-11 pl-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
              />
            </div>

            {/* Line Filters */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {lines.map((line) => (
                <button
                  key={line}
                  onClick={() => setFilterLine(line)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filterLine === line
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-gray-600'
                  }`}
                >
                  {line === 'all' ? 'همه' : line}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              usdtPrice={usdtPrice}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">🔍</span>
            <p className="text-gray-400 text-lg">محصولی یافت نشد</p>
          </div>
        )}

        {/* Footer Info */}
        <footer className="mt-12 text-center border-t border-gray-800 pt-8">
          <div className="bg-gray-900/40 border border-gray-800/50 rounded-2xl p-6 max-w-2xl mx-auto">
            <h3 className="text-amber-400 font-bold mb-3 flex items-center justify-center gap-2">
              <i className="fas fa-info-circle"></i>
              راهنمای سیستم
            </h3>
            <div className="text-gray-400 text-sm space-y-2 text-right leading-relaxed">
              <p>📌 قیمت هر محصول بر اساس <strong className="text-white">قیمت دلاری × نرخ تتر</strong> محاسبه می‌شود.</p>
              <p>📌 <strong className="text-orange-400">حد کاهش (Stop Loss):</strong> اگر قیمت محصول به اندازه درصد تعیین شده از قیمت پایه کاهش یابد، فروش آن محصول بسته می‌شود.</p>
              <p>📌 قیمت تتر هر <strong className="text-green-400">۵ ثانیه</strong> از API نوبیتکس بروزرسانی می‌شود (شبیه‌سازی WebSocket).</p>
              <p>📌 وضعیت <strong className="text-emerald-400">سبز</strong> = فروش باز | وضعیت <strong className="text-red-400">قرمز</strong> = فروش بسته</p>
              <p>📌 برای اتصال به بک‌اند Django، از WebSocket URL مناسب استفاده کنید.</p>
            </div>
          </div>

          <p className="text-gray-600 text-xs mt-6">
            ساخته شده با ❤️ | سیستم مدیریت قیمت قهوه - نسخه ۱.۰
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
