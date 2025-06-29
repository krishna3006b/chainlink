import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ensureCorrectChain, FUJI_PARAMS } from '../utils/chain';
import VaultCoreABI from '../abi/VaultCore.json';
import { CONTRACT_ADDRESSES } from '../abi/addresses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  ArrowRightLeft, 
  Shield, 
  Zap,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Globe,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';

const LoanApproval = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loanApproved, setLoanApproved] = useState(false);
  const [assetId, setAssetId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [txHash, setTxHash] = useState<string | null>(null);



  // Enhanced UX: fetch and show risk tier and new loan details after approval
  const [userRiskTier, setUserRiskTier] = useState<string | null>(null);
  const [newLoanDetails, setNewLoanDetails] = useState<any | null>(null);

  const handleApproval = async () => {
    if (!assetId || !amount) {
      toast.error('Please enter both asset ID and amount.');
      return;
    }
    setIsProcessing(true);
    setTxHash(null);
    setUserRiskTier(null);
    setNewLoanDetails(null);
    try {
      if (!(await ensureCorrectChain(43113, FUJI_PARAMS))) {
        setIsProcessing(false);
        return;
      }
      if (!window.ethereum) throw new Error('MetaMask not detected');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      // Fetch and show user risk tier before approval
      try {
        const riskManager = new ethers.Contract(CONTRACT_ADDRESSES.AIRiskManager, require('../abi/AIRiskManager.json'), provider);
        const riskTierNum = await riskManager.getRiskScore(await signer.getAddress());
        const riskTierMap = ['NONE', 'C', 'B', 'A'];
        setUserRiskTier(riskTierMap[Number(riskTierNum)] || 'NONE');
      } catch (e) {
        setUserRiskTier('Unknown');
      }
      const vault = new ethers.Contract(CONTRACT_ADDRESSES.VaultCore, VaultCoreABI, signer);
      // Simulate call
      let parsedAmount;
      try {
        parsedAmount = ethers.parseUnits(amount, 18);
      } catch {
        toast.error('Invalid amount format.');
        setIsProcessing(false);
        return;
      }
      try {
        await vault.getFunction('receiveLoanApproval').staticCall(assetId, parsedAmount);
      } catch (simError) {
        toast.error('Simulation failed: ' + (simError?.reason || simError?.message || simError));
        setIsProcessing(false);
        return;
      }
      // Send real tx
      const tx = await vault.getFunction('receiveLoanApproval')(assetId, parsedAmount);
      const receipt = await tx.wait();
      setTxHash(tx.hash);
      setLoanApproved(true);
      setCurrentStep(4);
      toast.success('Loan approved and funds transferred via CCIP!');
      // Fetch and show new loan details (find latest loan for user)
      try {
        // Find the latest loanId by scanning backwards (assume user can only have a few outstanding loans)
        const maxLoans = 20;
        let found = false;
        for (let i = 0; i < maxLoans; i++) {
          const loan = await vault.loans((await vault.loanId()) - 1n - BigInt(i));
          if (loan.borrower && loan.borrower.toLowerCase() === (await signer.getAddress()).toLowerCase()) {
            setNewLoanDetails({
              id: (await vault.loanId()) - 1n - BigInt(i),
              amount: ethers.formatUnits(loan.amount, 18),
              repaid: loan.repaid,
              riskTier: ['NONE', 'C', 'B', 'A'][Number(loan.riskTier)] || 'NONE',
            });
            found = true;
            break;
          }
        }
        if (!found) setNewLoanDetails(null);
      } catch {}
    } catch (e) {
      toast.error('Failed to approve loan: ' + (e?.reason || e?.message || e));
    }
    setIsProcessing(false);
  };



  const crossChainSteps = [
    { id: 1, title: 'Risk Assessment', chain: 'Ethereum', status: 'completed' },
    { id: 2, title: 'Loan Approval', chain: 'Ethereum', status: loanApproved ? 'completed' : 'current' },
    { id: 3, title: 'CCIP Transfer', chain: 'Cross-Chain', status: loanApproved ? 'completed' : 'pending' },
    { id: 4, title: 'Fund Delivery', chain: 'Avalanche', status: loanApproved ? 'completed' : 'pending' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cross-Chain Loan Approval</h1>
          <p className="text-muted-foreground">Seamless lending across Ethereum and Avalanche via Chainlink CCIP</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Cross-Chain
          </Badge>
          <Badge variant="outline" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            CCIP Enabled
          </Badge>
        </div>
      </div>

      {/* Cross-Chain Process Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Cross-Chain Process Flow
          </CardTitle>
          <CardDescription>
            Loan approval on Ethereum → Fund delivery on Avalanche
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            {crossChainSteps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
                  step.status === 'completed' ? 'bg-green-600 text-white' :
                  step.status === 'current' ? 'bg-blue-600 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.chain}</p>
                </div>
                {index < crossChainSteps.length - 1 && (
                  <div className={`absolute w-20 h-0.5 mt-5 ml-20 ${
                    step.status === 'completed' ? 'bg-green-600' : 'bg-gray-200'
                  }`} style={{ transform: 'translateX(10px)' }} />
                )}
              </div>
            ))}
          </div>
          <Progress value={loanApproved ? 100 : 50} className="mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            {loanApproved ? 'Process Complete' : 'Processing on Fuji'}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Loan Application Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 space-y-4">
                <label className="block font-medium">Asset ID</label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={assetId}
                  onChange={e => setAssetId(e.target.value)}
                  disabled={isProcessing || loanApproved}
                  placeholder="Enter asset ID (uint256)"
                />
                <label className="block font-medium mt-4">Amount (AVAX)</label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  disabled={isProcessing || loanApproved}
                  placeholder="Enter amount (e.g. 1.5)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Approval Action (new, contract-driven) with risk tier display */}
          {!loanApproved && (
            <Card>
              <CardHeader>
                <CardTitle>Loan Approval</CardTitle>
                <CardDescription>
                  Enter asset ID and amount, then approve for cross-chain fund delivery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userRiskTier !== null && (
                  <div className="mb-2">
                    <span className="font-semibold">Your Risk Tier: </span>
                    <span className={`inline-block px-2 py-1 rounded text-xs ml-2 ${userRiskTier === 'A' ? 'bg-green-100 text-green-700' : userRiskTier === 'B' ? 'bg-yellow-100 text-yellow-700' : userRiskTier === 'C' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{userRiskTier}</span>
                  </div>
                )}
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Ready for Approval</span>
                  </div>
                  <p className="text-sm text-blue-800">
                    Enter your asset ID and desired loan amount, then approve to execute the cross-chain transfer.
                  </p>
                </div>
                <Button 
                  onClick={handleApproval}
                  disabled={isProcessing || !assetId || !amount}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Processing Cross-Chain Transfer...
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="h-4 w-4 mr-2" />
                      Approve & Execute Cross-Chain Transfer
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Success State with new loan details */}
          {loanApproved && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-900">Loan Approved!</h3>
                    <p className="text-green-800">Funds successfully transferred to Avalanche Fuji</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg space-y-2">
                    <p className="text-sm font-mono">Transaction Hash:</p>
                    <p className="text-xs font-mono text-muted-foreground">{txHash || 'N/A'}</p>
                    {newLoanDetails && (
                      <>
                        <p className="text-sm font-mono">Loan ID: <span className="font-semibold">{newLoanDetails.id.toString()}</span></p>
                        <p className="text-sm font-mono">Amount: <span className="font-semibold">{newLoanDetails.amount} AVAX</span></p>
                        <p className="text-sm font-mono">Risk Tier: <span className="font-semibold">{newLoanDetails.riskTier}</span></p>
                        <p className="text-sm font-mono">Status: <span className="font-semibold">{newLoanDetails.repaid ? 'Repaid' : 'Active'}</span></p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Network Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Ethereum Sepolia</span>
                </div>
                <Badge variant="outline" className="text-xs">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Avalanche Fuji</span>
                </div>
                <Badge variant="outline" className="text-xs">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm">Chainlink CCIP</span>
                </div>
                <Badge variant="outline" className="text-xs">Connected</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Price Feeds</CardTitle>
              <CardDescription>Real-time Chainlink data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">ETH/USD</span>
                <div className="text-right">
                  <p className="font-semibold">$2,847.32</p>
                  <p className="text-xs text-green-600">+2.4%</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">USDC/USD</span>
                <div className="text-right">
                  <p className="font-semibold">$1.0001</p>
                  <p className="text-xs text-muted-foreground">0.0%</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">AVAX/USD</span>
                <div className="text-right">
                  <p className="font-semibold">$42.18</p>
                  <p className="text-xs text-red-600">-1.2%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Multi-sig Validation</p>
                  <p className="text-xs text-muted-foreground">Time-locked execution</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Automated Monitoring</p>
                  <p className="text-xs text-muted-foreground">24/7 health checks</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Audit Trail</p>
                  <p className="text-xs text-muted-foreground">Immutable records</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Add a simple error boundary wrapper for this page
import React from 'react';

class LoanApprovalErrorBoundary extends React.Component<any, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    // You can log errorInfo to an error reporting service here
    // eslint-disable-next-line no-console
    console.error('LoanApproval error boundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Something went wrong in Loan Approval</h2>
          <pre className="bg-red-100 p-4 rounded text-left overflow-x-auto text-xs">{String(this.state.error)}</pre>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function LoanApprovalWithBoundary() {
  return (
    <LoanApprovalErrorBoundary>
      <LoanApproval />
    </LoanApprovalErrorBoundary>
  );
}