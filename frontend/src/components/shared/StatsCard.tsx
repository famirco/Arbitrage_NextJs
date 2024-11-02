import { Card, Text, Metric, Color } from '@tremor/react';

interface StatsCardProps {
  title: string;
  metric: string | number;
  description?: string;
  color?: Color;
}

export default function StatsCard({ title, metric, description, color = "blue" }: StatsCardProps) {
  return (
    <Card decoration="top" decorationColor={color}>
      <Text>{title}</Text>
      <Metric>{metric}</Metric>
      {description && (
        <Text className="mt-2 text-gray-500">{description}</Text>
      )}
    </Card>
  );
}
