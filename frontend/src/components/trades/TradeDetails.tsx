"use client";

import { Card, Title, Grid, Text, Metric, Badge, List, ListItem } from '@tremor/react';
import { Trade } from '@/types/trade';

interface TradeDetailsProps {
  trade: Trade;
}

export default function TradeDetails({ trade }: TradeDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'green';
      case 'FAILED': return 'red';
      case 'PENDING': return 'yellow';
      default: return 'blue';
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-start">
        <Title>Trade #{trade.id}</Title>
        <Badge color={getStatusColor(trade.status)}>{trade.status}</Badge>
      </div>

      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4 mt-4">
        <Card>
          <Text>Token</Text>
          <Metric>{trade.token}</Metric>
        </Card>
        <Card>
          <Text>Amount</Text>
          <Metric>{trade.amount}</Metric>
        </Card>
        <Card>
          <Text>Profit</Text>
          <Metric className={trade.profit && parseFloat(trade.profit) > 0 ? 'text-green-500' : ''}>
            {trade.profit || '-'}
          </Metric>
        </Card>
        <Card>
          <Text>Gas Used</Text>
          <Metric>{trade.gasUsed || '-'}</Metric>
        </Card>
      </Grid>

      <div className="mt-6">
        <Text>Transaction Details</Text>
        <List className="mt-2">
          <ListItem>
            <span>Buy RPC:</span>
            <span>{trade.buyRpc}</span>
          </ListItem>
          <ListItem>
            <span>Sell RPC:</span>
            <span>{trade.sellRpc}</span>
          </ListItem>
          <ListItem>
            <span>Created At:</span>
            <span>{new Date(trade.createdAt).toLocaleString()}</span>
          </ListItem>
          <ListItem>
            <span>Updated At:</span>
            <span>{new Date(trade.updatedAt).toLocaleString()}</span>
          </ListItem>
          {trade.error && (
            <ListItem>
              <span>Error:</span>
              <span className="text-red-500">{trade.error}</span>
            </ListItem>
          )}
        </List>
      </div>
    </Card>
  );
}
