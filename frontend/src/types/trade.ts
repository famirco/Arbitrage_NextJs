export interface Trade {
  id: number;
  status: 'PENDING' | 'BUYING' | 'SELLING' | 'SUCCESS' | 'FAILED';
  token: string;
  buyRpc: string;
  sellRpc: string;
  amount: string;
  profit: string | null;
  gasUsed: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}
