export interface Product {
  id: string;
  name: string;
  nameEn: string;
  line: string;
  priceUSD: number; // قیمت دلاری هر کیلو
  stopLoss: number; // حد کاهش (درصد)
  currentPriceToman: number;
  previousPriceToman: number;
  isSellingOpen: boolean;
  lastUpdate: Date | null;
  image?: string;
}

export interface PriceUpdate {
  productId: string;
  usdtRate: number;
  timestamp: Date;
}
