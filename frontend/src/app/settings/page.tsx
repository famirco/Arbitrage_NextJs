'use client';

import { Card, Title, NumberInput, Button } from '@tremor/react';
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
  const [saving, setSaving] = useState(false);

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
    if (!settings) return;

    try {
      setSaving(true);
      await fetchApi<Settings>('/api/settings', {
        method: 'POST',
        body: JSON.stringify(settings)
      });
      // Show success message
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleNumberChange = (field: keyof Settings) => (value: number | undefined) => {
    if (value === undefined) return;
    
    setSettings(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: value
      };
    });
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Profit Percentage
              </label>
              <NumberInput
                value={settings.minProfitPercentage}
                onValueChange={handleNumberChange('minProfitPercentage')}
                min={0}
                step={0.1}
                className="w-full"
                disabled={saving}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gas Limit
              </label>
              <NumberInput
                value={settings.gasLimit}
                onValueChange={handleNumberChange('gasLimit')}
                min={0}
                className="w-full"
                disabled={saving}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slippage (%)
              </label>
              <NumberInput
                value={settings.slippage}
                onValueChange={handleNumberChange('slippage')}
                min={0}
                max={100}
                step={0.1}
                className="w-full"
                disabled={saving}
              />
            </div>
          </div>
          
          <div className="mt-6">
            <Button 
              type="submit" 
              color="blue"
              disabled={saving}
              loading={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}