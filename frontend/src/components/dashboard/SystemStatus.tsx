import { useEffect, useState } from 'react';
import { Card, Title, Grid, Text, Metric, List, ListItem } from '@tremor/react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { SystemStatus as SystemStatusType } from '@/types/system';

export default function SystemStatus() {
  const [status, setStatus] = useState<SystemStatusType | null>(null);
  const { data } = useWebSocket<SystemStatusType>('system-status');

  useEffect(() => {
    if (data) {
      setStatus(data);
    }
  }, [data]);

  if (!status) return null;

  return (
    <Card>
      <Title>System Status</Title>
      <Grid numItems={2} className="gap-4 mt-4">
        <div>
          <Text>Status</Text>
          <Metric className={status.isRunning ? 'text-green-500' : 'text-red-500'}>
            {status.isRunning ? 'Running' : 'Stopped'}
          </Metric>
        </div>
        <div>
          <Text>Uptime</Text>
          <Metric>{Math.floor(status.uptime / 3600)}h {Math.floor((status.uptime % 3600) / 60)}m</Metric>
        </div>
        <div>
          <Text>Total Trades</Text>
          <Metric>{status.totalTrades}</Metric>
        </div>
        <div>
          <Text>Successful Trades</Text>
          <Metric>{status.successfulTrades}</Metric>
        </div>
      </Grid>
      <div className="mt-4">
        <Text>Active RPCs</Text>
        <List className="mt-2">
          {status.activeRpcs.map((rpc) => (
            <ListItem key={rpc}>{rpc}</ListItem>
          ))}
        </List>
      </div>
      <div className="mt-4">
        <Text>Active Tokens</Text>
        <List className="mt-2">
          {status.activeTokens.map((token) => (
            <ListItem key={token}>{token}</ListItem>
          ))}
        </List>
      </div>
    </Card>
  );
}
