"use client";

import { useState, useEffect } from 'react';
import { Card, Title, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge } from '@tremor/react';
import { fetchApi } from '@/utils/api';
import { Trade } from '@/types/trade';

export default function TradeList() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrades = async () => {
      try {
        const data = await fetchApi<Trade[]>('/api/trades');
        setTrades(data);
      } catch (error) {
        console.error('Failed to load trades:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrades();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'green';
      case 'FAILED': return 'red';
      case 'PENDING': return 'yellow';
      default: return 'blue';
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card>
      <Title>Recent Trades</Title>
      <Table className="mt-4">
        <TableHead>
          <TableRow>
            <TableHeaderCell>ID</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Token</TableHeaderCell>
            <TableHeaderCell>Buy RPC</TableHeaderCell>
            <TableHeaderCell>Sell RPC</TableHeaderCell>
            <TableHeaderCell>Amount</TableHeaderCell>
            <TableHeaderCell>Profit</TableHeaderCell>
            <TableHeaderCell>Time</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {trades.map((trade) => (
            <TableRow key={trade.id}>
              <TableCell>{trade.id}</TableCell>
              <TableCell>
                <Badge color={getStatusColor(trade.status)}>{trade.status}</Badge>
              </TableCell>
              <TableCell>{trade.token}</TableCell>
              <TableCell>{trade.buyRpc}</TableCell>
              <TableCell>{trade.sellRpc}</TableCell>
              <TableCell>{trade.amount}</TableCell>
              <TableCell>{trade.profit || '-'}</TableCell>
              <TableCell>{new Date(trade.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
