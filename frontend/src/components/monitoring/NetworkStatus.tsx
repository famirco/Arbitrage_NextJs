import { Card, Title, List, ListItem, Badge, Text } from '@tremor/react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface NetworkStats {
  name: string;
  blockNumber: number;
  gasPrice: string;
  status: 'normal' | 'congested' | 'error';
  peers: number;
}

export default function NetworkStatus() {
  const { data } = useWebSocket<NetworkStats[]>('network-status');

  if (!data) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'green';
      case 'congested': return 'yellow';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Card>
      <Title>Network Status</Title>
      <List className="mt-4">
        {data.map((network) => (
          <ListItem key={network.name}>
            <div className="flex flex-col w-full">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="font-medium">{network.name}</span>
                  <Badge color={getStatusColor(network.status)} className="ml-2">
                    {network.status}
                  </Badge>
                </div>
                <Text>{network.gasPrice} Gwei</Text>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Block: {network.blockNumber} | Peers: {network.peers}
              </div>
            </div>
          </ListItem>
        ))}
      </List>
    </Card>
  );
}
