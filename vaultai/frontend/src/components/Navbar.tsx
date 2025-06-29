import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-white shadow mb-8">
      <div className="text-xl font-bold text-blue-700">VaultAI</div>
      <div>
        <ConnectButton />
      </div>
    </nav>
  );
}
