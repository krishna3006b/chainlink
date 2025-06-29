
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Building2, TrendingUp, Shield, History, Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RainbowKitConnectButton } from './RainbowKitConnectButton';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'RWA Tokenization', href: '/tokenization', icon: Building2 },
  { name: 'Risk Assessment', href: '/risk-assessment', icon: Shield },
  { name: 'Loan Approval', href: '/loan-approval', icon: TrendingUp },
  { name: 'Loan History', href: '/history', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const NavItems = () => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-accent',
              isActive 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="flex flex-col gap-4 pt-4">
                  <div className="px-4">
                    <h2 className="text-lg font-semibold">ChainVault</h2>
                    <p className="text-sm text-muted-foreground">DeFi RWA Platform</p>
                  </div>
                  <nav className="flex flex-col gap-2 px-2">
                    <NavItems />
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="font-bold text-xl">ChainVault</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-muted-foreground">Sepolia</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-muted-foreground">Fuji</span>
              </div>
            </div>
            <div className="min-w-[180px]">
              <RainbowKitConnectButton />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex w-72 min-h-[calc(100vh-4rem)] border-r bg-background/50">
          <div className="flex flex-col gap-4 p-6 w-full">
            <div>
              <h2 className="text-lg font-semibold mb-2">Navigation</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your RWA portfolio and lending activities
              </p>
            </div>
            <nav className="flex flex-col gap-2">
              <NavItems />
            </nav>
            
            {/* Chainlink Services Status */}
            <div className="mt-8 p-4 rounded-lg border bg-card">
              <h3 className="font-medium mb-3">Chainlink Services</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">CCIP</span>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-green-600">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Data Feeds</span>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-green-600">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Functions</span>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-green-600">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Automation</span>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                    <span className="text-yellow-600">Monitoring</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
};
