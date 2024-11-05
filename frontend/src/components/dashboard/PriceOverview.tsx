"use client";

import { useEffect, useState } from 'react';
import { Card, Title } from '@tremor/react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { TokenPrice } from '@/types/price';

export default function PriceOverview() {
  const [prices, setPrices] = useState<TokenPrice[]>([]);
  const { data } = useWebSocket<TokenPrice[]>('prices');

  useEffect(() => {
    if (data) {
      setPrices(data);
    }
  }, [data]);

  return (
    <Card>
      <Title>Real-time Token Prices</Title>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {prices.map((price) => (
          <div
            key={`${price.symbol}-${price.rpc}`}
            className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{price.symbol}</h3>
              <span className="text-sm text-gray-500">{price.rpc}</span>
            </div>
            <p className="text-2xl font-bold mt-2">${price.price}</p>
            <p className="text-sm text-gray-500">
              Last update: {new Date(price.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
