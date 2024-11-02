import { Card, Title } from '@tremor/react';
import { Line } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend,
  TimeScale
);

interface PricePoint {
  timestamp: number;
  price: number;
  rpc: string;
}

interface PriceHistoryChartProps {
  data: PricePoint[];
  token: string;
}

export default function PriceHistoryChart({ data, token }: PriceHistoryChartProps) {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const rpcs = [...new Set(data.map(point => point.rpc))];
    
    const datasets = rpcs.map(rpc => {
      const rpcData = data.filter(point => point.rpc === rpc);
      return {
        label: rpc,
        data: rpcData.map(point => ({
          x: point.timestamp,
          y: point.price
        })),
        borderColor: rpc === 'Alchemy' ? '#3B82F6' : '#10B981',
        tension: 0.1
      };
    });

    setChartData({
      datasets
    });
  }, [data]);

  const options = {
    responsive: true,
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'minute' as const
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: `${token} Price History`
      },
      legend: {
        position: 'top' as const
      }
    }
  };

  if (!chartData) return null;

  return (
    <Card>
      <Title>{token} Price History</Title>
      <div className="h-80 mt-4">
        <Line data={chartData} options={options} />
      </div>
    </Card>
  );
}
