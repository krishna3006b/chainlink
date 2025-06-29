
import { useState, useEffect } from 'react';
import { ethers, BrowserProvider } from 'ethers';
import { ensureCorrectChain, FUJI_PARAMS } from '../utils/chain';
import VaultCoreABI from '../abi/VaultCore.json';
import { CONTRACT_ADDRESSES } from '../abi/addresses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  History, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';

const LoanHistory = () => {
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userAddress, setUserAddress] = useState<string>('');

  // Fetch loans function, now exported for refresh
  const fetchLoans = async () => {
    setLoading(true);
    try {
      if (!(await ensureCorrectChain(43113, FUJI_PARAMS))) {
        setLoading(false);
        return;
      }
      if (!window.ethereum) throw new Error('MetaMask not detected');
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setUserAddress(address);
      const vault = new ethers.Contract(
        CONTRACT_ADDRESSES.VaultCore,
        VaultCoreABI,
        provider
      );
      // Try to fetch first 100 loans (loanId: 0..99)
      const fetchedLoans = [];
      for (let i = 0; i < 100; i++) {
        try {
          const loan = await vault.loans(i);
          if (loan.borrower && loan.borrower.toLowerCase() === address.toLowerCase()) {
            fetchedLoans.push({
              id: `LOAN${i.toString().padStart(3, '0')}`,
              loanAmount: Number(loan.amount) / 1e18,
              currentBalance: loan.repaid ? 0 : Number(loan.amount) / 1e18,
              status: loan.repaid ? 'Completed' : 'Active',
              riskTier: ['C', 'B', 'A'][loan.riskTier - 1] || 'C',
              // The following fields are static/demo, as not available on-chain:
              interestRate: 'N/A',
              healthScore: 'N/A',
              nextPayment: 'N/A',
              paymentAmount: 'N/A',
              collateralRatio: 'N/A',
              chain: 'Avalanche',
              txHash: '',
              assetName: 'Asset',
            });
          }
        } catch {}
      }
      setLoans(fetchedLoans);
    } catch (err) {
      setLoans([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLoans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const liquidationAlerts = [
    {
      loanId: 'LOAN002',
      assetName: 'Industrial Warehouse',
      currentRatio: 125.30,
      threshold: 110,
      severity: 'Medium',
      action: 'Monitor closely'
    }
  ];

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalStats = {
    totalLoaned: loans.reduce((sum, loan) => sum + (typeof loan.loanAmount === 'number' ? loan.loanAmount : 0), 0),
    activeLoans: loans.filter(loan => loan.status === 'Active').length,
    totalOutstanding: loans.reduce((sum, loan) => sum + (typeof loan.currentBalance === 'number' ? loan.currentBalance : 0), 0),
    avgHealthScore: 'N/A',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Loan History & Monitoring</h1>
          <p className="text-muted-foreground">Track your lending portfolio and automated health monitoring</p>
        </div>
        <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
        <Button variant="outline" size="sm" onClick={fetchLoans} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Loaned</p>
                <p className="text-2xl font-bold">${totalStats.totalLoaned.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Loans</p>
                <p className="text-2xl font-bold">{totalStats.activeLoans}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold">${totalStats.totalOutstanding.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Health Score</p>
                <p className="text-2xl font-bold">{totalStats.avgHealthScore}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Loan Portfolio
              </CardTitle>
              <CardDescription>
                All your loans with real-time health monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading && (
                  <div className="text-center text-muted-foreground py-8">Loading loan history...</div>
                )}
                {!loading && loans.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">No loans found for your address.</div>
                )}
                {loans.map((loan) => (
                  <div 
                    key={loan.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedLoan === loan.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedLoan(selectedLoan === loan.id ? null : loan.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{loan.assetName} <span className="text-xs text-gray-400">(on-chain)</span></h4>
                        <p className="text-sm text-muted-foreground">ID: {loan.id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(loan.status)}>
                          {loan.status}
                        </Badge>
                        <Badge variant="outline">
                          {loan.chain}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Loan Amount</p>
                        <p className="font-semibold">{loan.loanAmount} AVAX</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Outstanding</p>
                        <p className="font-semibold">{loan.currentBalance} AVAX</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Risk Tier</p>
                        <Badge variant="outline" className="text-xs">
                          {loan.riskTier}
                        </Badge>
                      </div>
                    </div>

                    {loan.status === 'Active' && (
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{Math.round(((loan.loanAmount - loan.currentBalance) / loan.loanAmount) * 100)}% paid</span>
                        </div>
                        <Progress value={((loan.loanAmount - loan.currentBalance) / loan.loanAmount) * 100} />
                      </div>
                    )}

                    {selectedLoan === loan.id && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Interest Rate</p>
                            <p className="font-semibold">N/A (on-chain only)</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Collateral Ratio</p>
                            <p className="font-semibold">N/A (on-chain only)</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Borrower:</span>
                          <span className="font-mono">{userAddress}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Liquidation Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Liquidation Alerts
              </CardTitle>
              <CardDescription>
                Chainlink Automation monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              {liquidationAlerts.length > 0 ? (
                <div className="space-y-3">
                  {liquidationAlerts.map((alert, index) => (
                    <div key={index} className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-yellow-900">{alert.loanId}</span>
                        <Badge className="bg-yellow-200 text-yellow-800 text-xs">
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-yellow-800 mb-2">{alert.assetName}</p>
                      <div className="text-xs text-yellow-700">
                        <p>Current: {alert.currentRatio}%</p>
                        <p>Threshold: {alert.threshold}%</p>
                        <p className="font-semibold mt-1">{alert.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <p className="text-sm text-muted-foreground">All loans healthy</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Automation Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Automation Status</CardTitle>
              <CardDescription>
                Chainlink services monitoring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Health Monitoring</span>
                </div>
                <Badge variant="outline" className="text-xs">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Price Feed Updates</span>
                </div>
                <Badge variant="outline" className="text-xs">Live</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Liquidation Trigger</span>
                </div>
                <Badge variant="outline" className="text-xs">Standby</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Cross-Chain Sync</span>
                </div>
                <Badge variant="outline" className="text-xs">Connected</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                View Detailed Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export Transaction History
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                Request New Loan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoanHistory;
