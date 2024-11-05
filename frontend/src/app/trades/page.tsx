import TradeList from "@/components/trades/TradeList";
import TradeStats from "@/components/trades/TradeStats";

export default function TradesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Trades History</h1>
      
      <TradeStats />
      <TradeList />
    </div>
  );
}
