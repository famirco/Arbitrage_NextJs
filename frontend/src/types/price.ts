export interface TokenPrice {
  symbol: string;
  price: string;
  timestamp: number;
  rpc: string;
}

export interface PriceComparison {
  token: string;
  buyRpc: string;
  sellRpc: string;
  priceDiff: string;
  profitPercentage: string;
}
