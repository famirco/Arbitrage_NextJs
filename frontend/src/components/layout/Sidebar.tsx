"use client";

import { HomeIcon, ChartBarIcon, CogIcon, ClockIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Trades', href: '/trades', icon: ChartBarIcon },
  { name: 'Monitoring', href: '/monitoring', icon: ClockIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white w-64">
      <div className="p-4">
        <h1 className="text-xl font-bold">Arbitrage Bot</h1>
      </div>
      <nav className="mt-8">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
