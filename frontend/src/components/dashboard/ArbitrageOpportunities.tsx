"use client";

import { useEffect, useState } from 'react';
import { Card, Title, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from '@tremor/react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { PriceComparison } from '@/types/price';

export default function ArbitrageOpportunities() {
  const [opportunities, setOpportunities] = useState<PriceComparison[]>([]);
  const { data } = useWebSocket<PriceComparison[]>('opportunities');

  useEffect(() => {
    if (data) {
      setOpportunities(data);
    }
  }, [data]);

  return (
    <Card>
      <Title>Arbitrage Opportunities</Title>
      <Table className="mt-4">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Token</TableHeaderCell>
            <TableHeaderCell>Buy RPC</TableHeaderCell>
            <TableHeaderCell>Sell RPC</TableHeaderCell>
            <TableHeaderCell>Price Difference</TableHeaderCell>
            <TableHeaderCell>Profit %</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {opportunities.map((opp, idx) => (
            <TableRow key={idx}>
              <TableCell>{opp.token}</TableCell>
              <TableCell>{opp.buyRpc}</TableCell>
              <TableCell>{opp.sellRpc}</TableCell>
              <TableCell>${opp.priceDiff}</TableCell>
              <TableCell>{opp.profitPercentage}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
