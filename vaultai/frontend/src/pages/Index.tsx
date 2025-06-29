
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Shield, 
  TrendingUp, 
  Zap, 
  ArrowRight, 
  DollarSign,
  BarChart3,
  Globe,
  Lock
} from 'lucide-react';

const Index = () => {
  const stats = [
    { label: 'Total Value Locked', value: '$2.4M', change: '+12.5%', icon: DollarSign },
    { label: 'Active Loans', value: '847', change: '+8.2%', icon: TrendingUp },
    { label: 'RWA Tokens', value: '156', change: '+15.3%', icon: Building2 },
    { label: 'Risk Score Avg', value: 'B+', change: 'Stable', icon: Shield },
  ];

  const features = [
    {
      title: 'RWA Tokenization',
      description: 'Transform real-world assets into blockchain tokens with comprehensive verification',
      icon: Building2,
      href: '/tokenization',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'AI Risk Assessment',
      description: 'Advanced AI-powered risk scoring using Chainlink Functions and AWS Lambda',
      icon: Shield,
      href: '/risk-assessment',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Cross-Chain Lending',
      description: 'Seamless lending across Ethereum and Avalanche using Chainlink CCIP',
      icon: Globe,
      href: '/loan-approval',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Automated Monitoring',
      description: 'Real-time loan health monitoring with Chainlink Automation',
      icon: Zap,
      href: '/history',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Zap className="h-4 w-4" />
          Powered by Chainlink Infrastructure
        </div>
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
          The Future of
          <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            RWA Lending
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Tokenize real-world assets, leverage AI risk assessment, and access cross-chain liquidity 
          with the most advanced DeFi lending platform.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline">
            Watch Demo
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-gradient-to-br from-white to-slate-50 border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <Badge variant={stat.change.startsWith('+') ? 'default' : 'secondary'} className="mt-1">
                      {stat.change}
                    </Badge>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Features Grid */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Platform Features</h2>
          <p className="text-muted-foreground">Everything you need for RWA lending in one platform</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardHeader className="pb-4">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r ${feature.color} mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to={feature.href}>
                    <Button className="w-full group-hover:bg-primary/90 transition-colors">
                      Explore Feature
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Chainlink Integration Highlight */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Secured by Chainlink</h3>
              <p className="text-muted-foreground">Enterprise-grade infrastructure</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="font-semibold text-blue-600">CCIP</div>
              <div className="text-sm text-muted-foreground">Cross-Chain</div>
            </div>
            <div>
              <div className="font-semibold text-blue-600">Functions</div>
              <div className="text-sm text-muted-foreground">AI Integration</div>
            </div>
            <div>
              <div className="font-semibold text-blue-600">Automation</div>
              <div className="text-sm text-muted-foreground">Liquidations</div>
            </div>
            <div>
              <div className="font-semibold text-blue-600">Price Feeds</div>
              <div className="text-sm text-muted-foreground">Real-time Data</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
