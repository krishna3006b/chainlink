import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">VaultAI Day 3 UI</h1>
      <p className="text-lg text-gray-600 mb-8">Welcome! Connect your wallet to get started.</p>
      <ConnectButton />
    </div>
  );
}
