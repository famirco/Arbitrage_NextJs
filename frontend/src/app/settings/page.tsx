'use client';

import { Card, Title, TextInput, NumberInput, Button, Select, SelectItem } from '@tremor/react';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';

interface Settings {
  minProfitPercentage: number;
  gasLimit: number;
  slippage: number;
  activeTokens: string[];
  activeRpcs: string[];
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await fetchApi<Settings>('/api/settings');
        setSettings(data);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation for saving settings
  };

  if (loading || !settings) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <Title>Trading Parameters</Title>
          <div className="space-y-4 mt-4">
            <div>
              <label>Minimum Profit Percentage</label>
              <NumberInput
                value={settings.minProfitPercentage}
                onChange={(value) => setSettings(prev => prev ? {...prev, minProfitPercentage: value} : null)}
                min={0}
                step={0.1}
              />
            </div>
            
            <div>
              <label>Gas Limit</label>
              <NumberInput
                value={settings.gasLimit}
                onChange={(value) => setSettings(prev => prev ? {...prev, gasLimit: value} : null)}
                min={0}
              />
            </div>
            
            <div>
              <label>Slippage (%)</label>
              <NumberInput
                value={settings.slippage}
                onChange={(value) => setSettings(prev => prev ? {...prev, slippage: value} : null)}
                min={0}
                max={100}
                step={0.1}
              />
            </div>
          </div>
          
          <div className="mt-6">
            <Button type="submit" color="blue">
              Save Settings
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
