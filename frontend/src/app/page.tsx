import PriceOverview from "@/components/dashboard/PriceOverview";
import ArbitrageOpportunities from "@/components/dashboard/ArbitrageOpportunities";
import SystemStatus from "@/components/dashboard/SystemStatus";

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemStatus />
        <PriceOverview />
      </div>
      
      <ArbitrageOpportunities />
    </div>
  );
}
