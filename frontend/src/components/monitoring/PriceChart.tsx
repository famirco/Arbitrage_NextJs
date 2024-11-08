"use client";

import { Card, Title } from '@tremor/react';
import { Line } from 'react-chartjs-2';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
);

interface PriceData {
  timestamp: number;
  prices: Record<string, string>;
}

interface ChartDataType {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    tension: number;
  }[];
}

export default function PriceChart() {
  const [chartData, setChartData] = useState<ChartDataType | null>(null);
  const { data } = useWebSocket<PriceData>('price-history');

  useEffect(() => {
    if (data) {
      // Transform data for chart
      const transformedData: ChartDataType = {
        labels: [],
        datasets: []
      };
      setChartData(transformedData);
    }
  }, [data]);

  if (!chartData) return null;

  return (
    <Card>
      <Title>Price History</Title>
      <div className="h-80 mt-4">
        <Line data={chartData} options={{ maintainAspectRatio: false }} />
      </div>
    </Card>
  );
}
