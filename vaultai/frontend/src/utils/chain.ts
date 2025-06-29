import { toast } from 'sonner';
import { ethers } from 'ethers';

export const FUJI_PARAMS = {
  chainId: '0xa869',
  chainName: 'Avalanche Fuji C-Chain',
  nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://testnet.snowtrace.io/']
};

export const SEPOLIA_PARAMS = {
  chainId: '0xaa36a7',
  chainName: 'Ethereum Sepolia',
  nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://rpc.sepolia.org'],
  blockExplorerUrls: ['https://sepolia.etherscan.io/']
};

export async function ensureCorrectChain(targetChainId: number, chainParams?: any): Promise<boolean> {
  if (!window.ethereum) {
    toast.error('MetaMask not detected');
    return false;
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== targetChainId) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + targetChainId.toString(16) }],
      });
      toast.success('Switched to correct network!');
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902 && chainParams) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [chainParams],
          });
          toast.success('Network added! Please try again.');
        } catch {
          toast.error('Please add the network to your wallet manually.');
        }
      } else {
        toast.error('Chain switch rejected or failed.');
      }
      return false;
    }
  }
  return true;
}
