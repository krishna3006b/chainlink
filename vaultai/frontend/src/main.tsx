import { createRoot } from 'react-dom/client'

import App from './App.tsx';
import './index.css';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { sepolia, avalancheFuji } from 'wagmi/chains';

const config = getDefaultConfig({
  appName: 'ChainVault',
  projectId: '29fa5b8dbe55e7aaa7a0ef6baa46156b', // TODO: Replace with your WalletConnect project ID
  chains: [sepolia, avalancheFuji],
  ssr: false,
});

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <App />
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
