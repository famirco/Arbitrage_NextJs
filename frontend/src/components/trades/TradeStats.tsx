"use client";

import { Card, Grid, Metric, Text } from '@tremor/react';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';

interface TradeStats {
  totalTrades: number;
  successfulTrades: number;
  failedTrades: number;
  totalProfit: string;
  averageProfit: string;
}

export default function TradeStats() {
  const [stats, setStats] = useState<TradeStats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchApi<TradeStats>('/api/trades/stats');
        setStats(data);
      } catch (error) {
        console.error('Failed to load trade stats:', error);
      }
    };

    loadStats();
  }, []);

  if (!stats) return null;

  return (
    <Grid numItems={1} numItemsSm={2} numItemsLg={5} className="gap-4">
      <Card>
        <Text>Total Trades</Text>
        <Metric>{stats.totalTrades}</Metric>
      </Card>
      <Card>
        <Text>Successful Trades</Text>
        <Metric className="text-green-500">{stats.successfulTrades}</Metric>
      </Card>
      <Card>
        <Text>Failed Trades</Text>
        <Metric className="text-red-500">{stats.failedTrades}</Metric>
      </Card>
      <Card>
        <Text>Total Profit</Text>
        <Metric>${stats.totalProfit}</Metric>
      </Card>
      <Card>
        <Text>Average Profit</Text>
        <Metric>${stats.averageProfit}</Metric>
      </Card>
    </Grid>
  );
}
