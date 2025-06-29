import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  Zap,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { ethers } from 'ethers';
import { ensureCorrectChain, FUJI_PARAMS } from '../utils/chain';
import AIRiskManagerABI from '../abi/AIRiskManager.json';
import { CONTRACT_ADDRESSES } from '../abi/addresses';

const RiskAssessment = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [riskScore, setRiskScore] = useState<string | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [onChainRisk, setOnChainRisk] = useState<string | null>(null);

  const [borrowerData, setBorrowerData] = useState({
    credit_score: '',
    income: '',
    asset_value: ''
  });

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    const inputPayload = {
      credit_score: Number(borrowerData.credit_score),
      income: Number(borrowerData.income),
      asset_value: Number(borrowerData.asset_value)
    };
    console.log('RiskAssessment: Sending payload to API:', inputPayload);
    try {
      const response = await fetch('https://chainlink-6x82.vercel.app/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputPayload)
      });
      console.log('RiskAssessment: API response status:', response.status);
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      console.log('RiskAssessment: API response data:', data);
      setRiskScore((data.risk_tier || data.riskTier || 'C').toUpperCase());
      toast.success('Risk assessment completed successfully!');
    } catch (e) {
      console.error('RiskAssessment: Error during API call:', e);
      setRiskScore('C');
      toast.error('Risk assessment failed. Using fallback.');
    }
    setIsAnalyzing(false);
    setAnalysisComplete(true);
  };

  const getRiskColor = (tier: string) => {
    switch (tier) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-yellow-600 bg-yellow-100';
      case 'C': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskDescription = (tier: string) => {
    switch (tier) {
      case 'A': return 'Low Risk - Excellent creditworthiness';
      case 'B': return 'Medium Risk - Good creditworthiness';
      case 'C': return 'High Risk - Requires careful consideration';
      default: return 'Unknown';
    }
  };

  const riskFactors = [
    { 
      name: 'Credit Score', 
      value: borrowerData.credit_score, 
      weight: 30,
      status: parseInt(borrowerData.credit_score) >= 700 ? 'good' : parseInt(borrowerData.credit_score) >= 600 ? 'medium' : 'poor'
    },
    { 
      name: 'Annual Income', 
      value: `$${borrowerData.income}`, 
      weight: 25,
      status: parseInt(borrowerData.income) >= 75000 ? 'good' : parseInt(borrowerData.income) >= 50000 ? 'medium' : 'poor'
    },
    { 
      name: 'Asset Value', 
      value: `$${borrowerData.asset_value}`,
      weight: 20,
      status: parseInt(borrowerData.asset_value) >= 300000 ? 'good' : parseInt(borrowerData.asset_value) >= 100000 ? 'medium' : 'poor'
    }
  ];

  // Helper: map risk tier letter to uint8 for contract
  const riskTierToUint = (tier: string) => {
    switch (tier) {
      case 'A': return 3;
      case 'B': return 2;
      case 'C': return 1;
      default: return 0;
    }
  };

  // Helper: map uint8 to risk tier letter
  const uintToRiskTier = (val: number) => {
    switch (val) {
      case 3: return 'A';
      case 2: return 'B';
      case 1: return 'C';
      default: return null;
    }
  };

  // Fetch on-chain risk score for connected user
  const fetchOnChainRisk = async () => {
    try {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const riskManager = new ethers.Contract(CONTRACT_ADDRESSES.AIRiskManager, AIRiskManagerABI, provider);
      const score = await riskManager.getRiskScore(await signer.getAddress());
      setOnChainRisk(uintToRiskTier(Number(score)));
    } catch {}
  };

  // Save risk score on-chain with validation
  const handleSaveOnChain = async () => {
    if (!riskScore) {
      toast.error('No risk score to save.');
      return;
    }
    // Only allow A, B, or C
    if (!['A', 'B', 'C'].includes(riskScore)) {
      toast.error('Invalid risk score. Only A, B, or C are allowed.');
      console.error('Attempted to save invalid risk score:', riskScore);
      return;
    }
    const riskUint = riskTierToUint(riskScore);
    if (![1, 2, 3].includes(riskUint)) {
      toast.error('Invalid risk score value. Only 1, 2, or 3 are allowed.');
      console.error('Attempted to save invalid risk score value:', riskUint);
      return;
    }
    setIsSaving(true);
    try {
      if (!(await ensureCorrectChain(43113, FUJI_PARAMS))) {
        setIsSaving(false);
        return;
      }
      if (!window.ethereum) throw new Error('MetaMask not detected');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const network = await provider.getNetwork();
      console.log('Frontend debug:', { userAddress, riskUint, riskScore, network });
      toast.info(`Network: ${network.name} (${network.chainId}), Account: ${userAddress}`);

      const riskManager = new ethers.Contract(CONTRACT_ADDRESSES.AIRiskManager, AIRiskManagerABI, signer);

      // Show current on-chain risk score
      let currentScore = null;
      try {
        currentScore = await riskManager.getRiskScore(userAddress);
        toast.info(`Current on-chain risk score: ${currentScore} (uint8)`);
      } catch (e) {
        toast.error('Could not fetch current on-chain risk score.');
      }
      if (Number(currentScore) === riskUint) {
        toast.info('This risk score is already set on-chain.');
        setIsSaving(false);
        return;
      }

      // Try callStatic to simulate the transaction
      try {
        await riskManager.getFunction('setRiskScore').staticCall(userAddress, riskUint);
      } catch (simError) {
        toast.error('Simulation failed: ' + (simError?.reason || simError?.message || simError));
        console.error('Simulation error:', simError);
        setIsSaving(false);
        return;
      }

      // Send the real transaction
      const tx = await riskManager.getFunction('setRiskScore')(userAddress, riskUint);
      await tx.wait();
      toast.success('Risk score saved on-chain!');
      fetchOnChainRisk();
    } catch (e: any) {
      toast.error('Failed to save risk score: ' + (e?.reason || e?.message || e));
      console.error('Error saving risk score on-chain:', e);
    }
    setIsSaving(false);
  };

  // Fetch on-chain risk score when analysis is complete or on mount
  useEffect(() => {
    if (analysisComplete) fetchOnChainRisk();
  }, [analysisComplete]);

  useEffect(() => {
    fetchOnChainRisk();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Risk Assessment</h1>
          <p className="text-muted-foreground">Advanced risk scoring powered by Chainlink Functions & AWS Lambda</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Powered
          </Badge>
          <Badge variant="outline" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Chainlink Functions
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Borrower Information
              </CardTitle>
              <CardDescription>
                Provide borrower details for AI-powered risk assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="credit_score">Credit Score</Label>
                  <Input
                    id="credit_score"
                    type="number"
                    placeholder="e.g., 750"
                    value={borrowerData.credit_score}
                    onChange={(e) => setBorrowerData({ ...borrowerData, credit_score: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="income">Annual Income ($)</Label>
                  <Input
                    id="income"
                    type="number"
                    placeholder="e.g., 85000"
                    value={borrowerData.income}
                    onChange={(e) => setBorrowerData({ ...borrowerData, income: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="asset_value">Asset Value ($)</Label>
                  <Input
                    id="asset_value"
                    type="number"
                    placeholder="e.g., 500000"
                    value={borrowerData.asset_value}
                    onChange={(e) => setBorrowerData({ ...borrowerData, asset_value: e.target.value })}
                  />
                </div>
              </div>

              <Button 
                onClick={handleAnalyze} 
                disabled={
                  isAnalyzing ||
                  !borrowerData.credit_score ||
                  !borrowerData.income ||
                  !borrowerData.asset_value
                }
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze Risk Score
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Risk Factors Analysis */}
          {analysisComplete && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Risk Factor Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskFactors.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{factor.name}</span>
                          <span className="text-sm text-muted-foreground">Weight: {factor.weight}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{factor.value}</span>
                          <Badge 
                            className={`text-xs ${
                              factor.status === 'good' ? 'bg-green-100 text-green-800' :
                              factor.status === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {factor.status === 'good' ? 'Good' : factor.status === 'medium' ? 'Fair' : 'Poor'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Save Risk Score On-Chain Button & Status */}
          {analysisComplete && riskScore && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Save Risk Score On-Chain
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-2">
                  <Button onClick={handleSaveOnChain} disabled={isSaving || !['A','B','C'].includes(riskScore)} className="w-full max-w-xs" size="lg">
                    {isSaving ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Saving to Blockchain...
                      </>
                    ) : (
                      <>Save Risk Score On-Chain</>
                    )}
                  </Button>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-green-700">On-chain risk score: <b>{onChainRisk ? `Tier ${onChainRisk}` : 'Not set'}</b></span>
                    <Button variant="outline" size="sm" onClick={fetchOnChainRisk} disabled={isSaving}>
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Assessment Result</CardTitle>
            </CardHeader>
            <CardContent>
              {!analysisComplete ? (
                <div className="text-center py-12">
                  <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Submit borrower information to get AI risk assessment</p>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold ${getRiskColor(riskScore!)}`}>
                    {riskScore}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Risk Tier {riskScore}</h3>
                    <p className="text-sm text-muted-foreground">{getRiskDescription(riskScore!)}</p>
                  </div>
                  <Badge className={getRiskColor(riskScore!)}>
                    {riskScore === 'A' ? 'Approved for Lending' : 
                     riskScore === 'B' ? 'Conditional Approval' : 
                     'Requires Manual Review'}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Processing Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Data Collection</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Chainlink Functions Call</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>AWS Lambda Processing</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>ML Model Inference</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Risk Score Generation</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {riskScore === 'A' && (
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Proceed to Loan Approval</p>
                    <p className="text-xs text-muted-foreground">Excellent risk profile qualifies for best rates</p>
                  </div>
                </div>
              )}
              {riskScore === 'B' && (
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Additional Review Required</p>
                    <p className="text-xs text-muted-foreground">May proceed with adjusted terms</p>
                  </div>
                </div>
              )}
              {riskScore === 'C' && (
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Manual Underwriting</p>
                    <p className="text-xs text-muted-foreground">Requires human review before approval</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RiskAssessment;
