import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  usdtPrice: number;
}

export function ProductCard({ product, usdtPrice }: ProductCardProps) {
  const priceToman = product.priceUSD * usdtPrice;
  const stopLossPrice = priceToman * (1 - product.stopLoss / 100);
  const priceDiff = product.currentPriceToman > 0 ? product.currentPriceToman - product.previousPriceToman : 0;
  const priceChangePercent = product.previousPriceToman > 0
    ? ((priceToman - product.previousPriceToman) / product.previousPriceToman) * 100
    : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(Math.round(price));
  };

  const getLineBadgeColor = (line: string) => {
    switch (line) {
      case 'پریمیوم': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'ترکیبی': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'کلاسیک': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'ویژه': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'تک‌خاستگاه': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getCoffeeEmoji = (line: string) => {
    switch (line) {
      case 'پریمیوم': return '☕';
      case 'ترکیبی': return '🫘';
      case 'کلاسیک': return '🍵';
      case 'ویژه': return '✨';
      case 'تک‌خاستگاه': return '🌍';
      default: return '☕';
    }
  };

  return (
    <div
      className={`relative rounded-2xl border backdrop-blur-sm p-5 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl ${
        product.isSellingOpen
          ? 'bg-gray-900/60 border-gray-700/50 hover:border-emerald-500/50'
          : 'bg-red-950/40 border-red-700/50 hover:border-red-500/50'
      }`}
    >
      {/* Status Badge */}
      <div className="absolute top-3 left-3">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
            product.isSellingOpen
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${product.isSellingOpen ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
          {product.isSellingOpen ? 'فروش باز' : 'فروش بسته'}
        </span>
      </div>

      {/* Coffee Icon & Line Badge */}
      <div className="flex items-center justify-between mt-8 mb-3">
        <span className="text-3xl">{getCoffeeEmoji(product.line)}</span>
        <span className={`text-xs px-2.5 py-1 rounded-full border ${getLineBadgeColor(product.line)}`}>
          {product.line}
        </span>
      </div>

      {/* Product Name */}
      <h3 className="text-white font-bold text-base mb-1 leading-relaxed">
        {product.name}
      </h3>
      <p className="text-gray-400 text-xs mb-4 font-mono">{product.nameEn}</p>

      {/* Price Section */}
      <div className="space-y-2.5">
        {/* USD Price */}
        <div className="flex items-center justify-between bg-gray-800/50 rounded-xl px-4 py-2.5">
          <span className="text-gray-400 text-sm">قیمت دلاری (هر کیلو)</span>
          <span className="text-white font-bold">${product.priceUSD.toFixed(2)}</span>
        </div>

        {/* Toman Price */}
        <div className={`flex items-center justify-between rounded-xl px-4 py-2.5 transition-colors duration-300 ${
          priceDiff > 0 ? 'bg-emerald-900/30' : priceDiff < 0 ? 'bg-red-900/30' : 'bg-gray-800/50'
        }`}>
          <span className="text-gray-400 text-sm">قیمت تومانی</span>
          <div className="text-right">
            <span className={`font-bold text-lg ${priceDiff > 0 ? 'text-emerald-400' : priceDiff < 0 ? 'text-red-400' : 'text-white'}`}>
              {formatPrice(priceToman)}
            </span>
            <span className="text-gray-400 text-xs mr-1">تومان</span>
            {priceDiff !== 0 && (
              <div className={`text-xs mt-0.5 ${priceDiff > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {priceDiff > 0 ? '▲' : '▼'} {Math.abs(priceChangePercent).toFixed(2)}%
              </div>
            )}
          </div>
        </div>

        {/* Stop Loss */}
        <div className="flex items-center justify-between bg-orange-900/20 border border-orange-700/30 rounded-xl px-4 py-2.5">
          <span className="text-orange-300/80 text-sm flex items-center gap-1">
            <i className="fas fa-shield-alt text-xs"></i>
            حد کاهش ({product.stopLoss}%)
          </span>
          <span className="text-orange-300 font-bold text-sm">{formatPrice(stopLossPrice)} ت</span>
        </div>
      </div>

      {/* Visual Indicator */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>وضعیت فروش</span>
          <span className={product.isSellingOpen ? 'text-emerald-400' : 'text-red-400'}>
            {product.isSellingOpen ? 'فعال ✓' : 'متوقف ✗'}
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              product.isSellingOpen
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                : 'bg-gradient-to-r from-red-700 to-red-500'
            }`}
            style={{ width: `${product.isSellingOpen ? 100 : 0}%` }}
          ></div>
        </div>
      </div>

      {/* Last Update */}
      {product.lastUpdate && (
        <div className="mt-3 text-center text-xs text-gray-500 flex items-center justify-center gap-1">
          <i className="fas fa-sync-alt text-[10px]"></i>
          {product.lastUpdate.toLocaleTimeString('fa-IR')}
        </div>
      )}
    </div>
  );
}
