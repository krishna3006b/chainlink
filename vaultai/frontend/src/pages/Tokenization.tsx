
import { useState } from 'react';
import { ethers, BrowserProvider } from 'ethers';
import { ensureCorrectChain, SEPOLIA_PARAMS } from '../utils/chain';
import RWARegistryABI from '../abi/RWARegistry.json';
import MockRealEstateABI from '../abi/MockRealEstate.json';
import { CONTRACT_ADDRESSES } from '../abi/addresses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileText,
  Camera,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

const Tokenization = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    assetType: '',
    assetName: '',
    location: '',
    value: '',
    description: '',
    documents: [],
    images: []
  });

  // Register asset and mint NFT using ethers v6
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);
  const [registeredAssetId, setRegisteredAssetId] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (!(await ensureCorrectChain(11155111, SEPOLIA_PARAMS))) {
        setIsLoading(false);
        return;
      }
      if (!window.ethereum) throw new Error('MetaMask not detected');
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Register asset on RWARegistry
      const rwaRegistry = new ethers.Contract(
        CONTRACT_ADDRESSES.RWARegistry,
        RWARegistryABI,
        signer
      );
      const tx1 = await rwaRegistry.registerAsset(
        formData.assetName || 'ipfs://mock-metadata',
        ethers.parseUnits(formData.value || '0', 0)
      );
      const receipt1 = await tx1.wait();
      // Try to get assetId from event logs
      let assetId = null;
      if (receipt1 && receipt1.logs && receipt1.logs.length > 0) {
        for (const log of receipt1.logs) {
          try {
            // Try to decode log for assetId (assume event AssetRegistered(address,uint256))
            if (log.topics && log.topics.length > 1) {
              assetId = BigInt(log.topics[2] || log.topics[1]).toString();
              break;
            }
          } catch {}
        }
      }
      setRegisteredAssetId(assetId);
      toast.success('Asset registered on-chain!');

      // Mint NFT on MockRealEstate
      const mockRealEstate = new ethers.Contract(
        CONTRACT_ADDRESSES.MockRealEstate,
        MockRealEstateABI,
        signer
      );
      const tx2 = await mockRealEstate.mint(await signer.getAddress());
      const receipt2 = await tx2.wait();
      // Try to get tokenId from event logs
      let tokenId = null;
      if (receipt2 && receipt2.logs && receipt2.logs.length > 0) {
        for (const log of receipt2.logs) {
          try {
            // Try to decode log for tokenId (assume event Transfer(address,address,uint256))
            if (log.topics && log.topics.length > 2) {
              tokenId = BigInt(log.topics[3]).toString();
              break;
            }
          } catch {}
        }
      }
      setMintedTokenId(tokenId);
      toast.success('NFT minted successfully!');

      setStep(4);
    } catch (err: any) {
      toast.error('On-chain tokenization failed: ' + (err?.message || err));
    }
    setIsLoading(false);
  };

  const assetTypes = [
    { value: 'real-estate', label: 'Real Estate', icon: '🏠' },
    { value: 'commodity', label: 'Commodity', icon: '🌾' },
    { value: 'equipment', label: 'Equipment', icon: '⚙️' },
    { value: 'vehicle', label: 'Vehicle', icon: '🚗' },
    { value: 'artwork', label: 'Artwork', icon: '🎨' },
  ];

  const steps = [
    { id: 1, title: 'Asset Details', description: 'Basic information about your asset' },
    { id: 2, title: 'Documentation', description: 'Upload required documents and images' },
    { id: 3, title: 'Verification', description: 'KYC and compliance checks' },
    { id: 4, title: 'Tokenization', description: 'Mint your RWA token' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">RWA Tokenization</h1>
          <p className="text-muted-foreground">Transform your real-world assets into blockchain tokens</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Ethereum Sepolia
        </Badge>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  s.id <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {s.id < step ? <CheckCircle className="h-4 w-4" /> : s.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-20 h-1 mx-4 ${s.id < step ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h3 className="font-semibold">{steps[step - 1]?.title}</h3>
            <p className="text-sm text-muted-foreground">{steps[step - 1]?.description}</p>
          </div>
          <Progress value={(step / steps.length) * 100} className="mt-4" />
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {step === 1 && <Building2 className="h-5 w-5" />}
                {step === 2 && <Upload className="h-5 w-5" />}
                {step === 3 && <Shield className="h-5 w-5" />}
                {step === 4 && <CheckCircle className="h-5 w-5" />}
                Step {step}: {steps[step - 1]?.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="assetType">Asset Type</Label>
                    <Select onValueChange={(value) => setFormData({...formData, assetType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset type" />
                      </SelectTrigger>
                      <SelectContent>
                        {assetTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <span className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              {type.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="assetName">Asset Name</Label>
                    <Input 
                      id="assetName"
                      placeholder="e.g., Downtown Commercial Property"
                      value={formData.assetName}
                      onChange={(e) => setFormData({...formData, assetName: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location"
                      placeholder="e.g., 123 Main St, New York, NY"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="value">Estimated Value (USD)</Label>
                    <Input 
                      id="value"
                      type="number"
                      placeholder="e.g., 500000"
                      value={formData.value}
                      onChange={(e) => setFormData({...formData, value: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description"
                      placeholder="Detailed description of the asset..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <Tabs defaultValue="documents" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="images">Images</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="documents" className="space-y-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">Upload Legal Documents</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Title deeds, ownership certificates, appraisal reports
                      </p>
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="images" className="space-y-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                      <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">Upload Asset Images</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        High-quality photos showing the asset condition
                      </p>
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Images
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">KYC Verification</p>
                        <p className="text-sm text-muted-foreground">Identity verified</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium">Asset Valuation</p>
                        <p className="text-sm text-muted-foreground">Professional appraisal in progress</p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Legal Review</p>
                        <p className="text-sm text-muted-foreground">Document verification</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">In Review</Badge>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="text-center space-y-6">
                  <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-green-600">Token Minted Successfully!</h3>
                    <p className="text-muted-foreground">Your RWA token has been created on Ethereum Sepolia</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-mono">Registered Asset ID:</p>
                    <p className="font-mono text-sm">{registeredAssetId || 'N/A'}</p>
                    <p className="text-sm font-mono mt-2">Minted NFT Token ID:</p>
                    <p className="font-mono text-sm">{mintedTokenId || 'N/A'}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(Math.max(1, step - 1))}
                  disabled={step === 1}
                >
                  Previous
                </Button>
                {step < 4 ? (
                  <Button 
                    onClick={() => {
                      if (step === 3) {
                        handleSubmit();
                      } else {
                        setStep(step + 1);
                      }
                    }}
                    disabled={isLoading}
                  >
                    {step === 3 ? (isLoading ? 'Minting...' : 'Mint Token') : 'Next'}
                  </Button>
                ) : (
                  <Button onClick={() => setStep(1)}>
                    Tokenize Another Asset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Token Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-16 w-16 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">{formData.assetName || 'Asset Name'}</p>
                <p className="text-sm text-muted-foreground">{formData.assetType || 'Asset Type'}</p>
                <p className="text-lg font-bold mt-2">${formData.value || '0'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tokenization Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Increased Liquidity</p>
                  <p className="text-xs text-muted-foreground">Access to global DeFi markets</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Fractional Ownership</p>
                  <p className="text-xs text-muted-foreground">Lower barrier to entry</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Transparent Records</p>
                  <p className="text-xs text-muted-foreground">Immutable blockchain history</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Tokenization;
