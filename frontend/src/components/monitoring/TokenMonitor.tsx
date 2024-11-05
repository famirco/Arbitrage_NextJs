"use client";

import { Card, Title, BarList } from '@tremor/react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface TokenStats {
  name: string;
  trades: number;
  volume: string;
}

export default function TokenMonitor() {
  const { data } = useWebSocket<TokenStats[]>('token-stats');

  if (!data) return null;

  const chartData = data.map(token => ({
    name: token.name,
    value: token.trades,
    text: `Volume: $${token.volume}`,
  }));

  return (
    <Card>
      <Title>Token Activity</Title>
      <BarList data={chartData} className="mt-4" />
    </Card>
  );
}
