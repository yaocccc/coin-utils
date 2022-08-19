import { ethers } from 'ethers';

export const getProvider = (rpc?: string) => {
    return rpc && rpc.startsWith('ws') ? new ethers.providers.WebSocketProvider(rpc) : new ethers.providers.JsonRpcProvider(rpc || 'https://bsc-dataseed.binance.org/');
}

export const getWallet = (private_key: string, provider?: ethers.providers.Provider): ethers.Wallet => new ethers.Wallet(private_key, provider);
