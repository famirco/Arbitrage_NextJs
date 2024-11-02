import { Card, Title, List, ListItem, Badge } from '@tremor/react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface RPCStatus {
  name: string;
  status: 'online' | 'offline';
  latency: number;
  lastSync: string;
}

export default function RPCStatus() {
  const { data } = useWebSocket<RPCStatus[]>('rpc-status');

  if (!data) return null;

  return (
    <Card>
      <Title>RPC Status</Title>
      <List className="mt-4">
        {data.map((rpc) => (
          <ListItem key={rpc.name}>
            <div className="flex justify-between items-center w-full">
              <div>
                <span className="font-medium">{rpc.name}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {rpc.latency}ms
                </span>
              </div>
              <Badge color={rpc.status === 'online' ? 'green' : 'red'}>
                {rpc.status}
              </Badge>
            </div>
          </ListItem>
        ))}
      </List>
    </Card>
  );
}
