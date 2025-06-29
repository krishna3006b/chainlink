
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings as SettingsIcon, 
  Wallet, 
  Shield, 
  Bell,
  Key,
  Globe,
  Zap,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const [notifications, setNotifications] = useState({
    loanAlerts: true,
    priceUpdates: false,
    liquidationWarnings: true,
    crossChainUpdates: true
  });

  const [walletConnected, setWalletConnected] = useState(false);

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success('Notification preferences updated');
  };

  const chainlinkServices = [
    { name: 'CCIP', status: 'Connected', description: 'Cross-chain interoperability' },
    { name: 'Data Feeds', status: 'Active', description: 'Real-time price data' },
    { name: 'Functions', status: 'Configured', description: 'AI risk assessment' },
    { name: 'Automation', status: 'Monitoring', description: 'Liquidation triggers' },
    { name: 'VRF', status: 'Available', description: 'Random audit selection' }
  ];

  const contractAddresses = {
    ethereum: {
      vaultCore: '0x742d35Cc6634C0532925a3b8D401FbF9DeD4316c',
      rwaRegistry: '0x8a3f42Bd4c7e9F2A1D5E8B923C4A7892F6E3D4A5',
      riskManager: '0x1b4c89Ef2A6D7C8E9F0B3A5C4D7E8F9A2B5C6D8E'
    },
    avalanche: {
      vaultCore: '0x9d5e82F4A3B6C7D8E9F0A2B3C4D5E6F7A8B9C0D1',
      ccipRouter: '0x2c6f94E3A5B7D8E9F0A1B2C3D4E5F6A7B8C9D0E1'
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your platform preferences and integrations</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <SettingsIcon className="h-4 w-4" />
          Configuration
        </Badge>
      </div>

      <Tabs defaultValue="wallet" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="chainlink">Chainlink</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="wallet" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Connection
              </CardTitle>
              <CardDescription>
                Connect and manage your wallet for cross-chain operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${walletConnected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <div>
                    <p className="font-medium">MetaMask</p>
                    <p className="text-sm text-muted-foreground">
                      {walletConnected ? '0x742d...316c' : 'Not connected'}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setWalletConnected(!walletConnected)}
                  variant={walletConnected ? "outline" : "default"}
                >
                  {walletConnected ? 'Disconnect' : 'Connect'}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="font-medium">Ethereum Sepolia</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Testnet connected</p>
                  <p className="text-xs text-muted-foreground mt-1">Balance: 2.45 ETH</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <span className="font-medium">Avalanche Fuji</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Testnet connected</p>
                  <p className="text-xs text-muted-foreground mt-1">Balance: 12.8 AVAX</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure alerts and updates for your lending activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Loan Health Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified when loan health drops</p>
                  </div>
                  <Switch 
                    checked={notifications.loanAlerts}
                    onCheckedChange={() => handleNotificationChange('loanAlerts')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Price Feed Updates</p>
                    <p className="text-sm text-muted-foreground">Real-time price change notifications</p>
                  </div>
                  <Switch 
                    checked={notifications.priceUpdates}
                    onCheckedChange={() => handleNotificationChange('priceUpdates')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Liquidation Warnings</p>
                    <p className="text-sm text-muted-foreground">Critical alerts before liquidation</p>
                  </div>
                  <Switch 
                    checked={notifications.liquidationWarnings}
                    onCheckedChange={() => handleNotificationChange('liquidationWarnings')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Cross-Chain Updates</p>
                    <p className="text-sm text-muted-foreground">CCIP transaction status updates</p>
                  </div>
                  <Switch 
                    checked={notifications.crossChainUpdates}
                    onCheckedChange={() => handleNotificationChange('crossChainUpdates')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chainlink" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Chainlink Services
              </CardTitle>
              <CardDescription>
                Status and configuration of Chainlink integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {chainlinkServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={
                        service.status === 'Connected' || service.status === 'Active' ? 
                        'bg-green-100 text-green-800' :
                        service.status === 'Monitoring' || service.status === 'Configured' ?
                        'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }
                    >
                      {service.status}
                    </Badge>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Compliance
              </CardTitle>
              <CardDescription>
                Manage security settings and compliance features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">KYC Verification</p>
                      <p className="text-sm text-muted-foreground">Identity verified and compliant</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Verified</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Multi-Signature</p>
                      <p className="text-sm text-muted-foreground">Time-locked transaction security</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Enabled</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Audit Trail</p>
                      <p className="text-sm text-muted-foreground">Immutable transaction logging</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Risk Monitoring</p>
                      <p className="text-sm text-muted-foreground">24/7 automated monitoring</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Monitoring</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Smart Contract Addresses
              </CardTitle>
              <CardDescription>
                Deployed contract addresses on testnet environments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  Ethereum Sepolia
                </h4>
                <div className="space-y-2">
                  {Object.entries(contractAddresses.ethereum).map(([name, address]) => (
                    <div key={name} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm font-medium capitalize">{name.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-xs font-mono">{address}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  Avalanche Fuji
                </h4>
                <div className="space-y-2">
                  {Object.entries(contractAddresses.avalanche).map(([name, address]) => (
                    <div key={name} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm font-medium capitalize">{name.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-xs font-mono">{address}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> These are testnet deployments for demonstration purposes. 
                  Production deployment would require additional security audits and mainnet deployment.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
