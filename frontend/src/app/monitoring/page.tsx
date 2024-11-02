import PriceChart from "@/components/monitoring/PriceChart";
import RPCStatus from "@/components/monitoring/RPCStatus";
import TokenMonitor from "@/components/monitoring/TokenMonitor";

export default function MonitoringPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Monitoring</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RPCStatus />
        <TokenMonitor />
      </div>
      
      <PriceChart />
    </div>
  );
}
