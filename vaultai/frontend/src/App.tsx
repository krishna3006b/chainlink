import Navbar from './components/Navbar'
import Home from './pages/Home'
import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const config = getDefaultConfig({
  appName: 'VaultAI',
  projectId: '29fa5b8dbe55e7aaa7a0ef6baa46156bx', // Replace with your WalletConnect Project ID
  chains: [mainnet],
  ssr: false,
})

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="bg-gray-50 min-h-screen">
            <Navbar />
            <Home />
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
