interface PriceTickerProps {
  usdtPrice: number;
  isLoading: boolean;
  isConnected: boolean;
  lastUpdate: Date | null;
  error: string | null;
}

export function PriceTicker({ usdtPrice, isLoading, isConnected, lastUpdate, error }: PriceTickerProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(Math.round(price));
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* USDT Price */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
            <span className="text-white font-bold text-xl">₮</span>
          </div>
          <div>
            <p className="text-gray-400 text-sm">قیمت لحظه‌ای تتر (USDT)</p>
            <div className="flex items-baseline gap-2">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-400">در حال دریافت...</span>
                </div>
              ) : (
                <>
                  <span className="text-white text-3xl font-bold">{formatPrice(usdtPrice)}</span>
                  <span className="text-gray-400 text-sm">تومان</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-6">
          {/* WebSocket Status */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'متصل به WebSocket' : 'قطع اتصال'}
            </span>
          </div>

          {/* Last Update Time */}
          {lastUpdate && (
            <div className="text-gray-400 text-sm">
              <i className="fas fa-clock ml-1"></i>
              {lastUpdate.toLocaleTimeString('fa-IR')}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-amber-400 text-sm flex items-center gap-1">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Live Indicator */}
      <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center justify-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <span className="text-green-400 text-sm font-medium">LIVE - بروزرسانی هر ۵ ثانیه</span>
      </div>
    </div>
  );
}
