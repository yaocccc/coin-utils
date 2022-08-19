import { ethers, providers } from 'ethers';
import { PLATFORM } from '../types';
import { getProvider } from './provider';
import { tokenAbi, pinksaleAbi, maplesaleAbi } from '../abis';

export type PresaleInfo = {
    platform: PLATFORM;
    name: string;
    presaleAddress: string;
    tokenAddress: string;
    startTime: number;
    status: string;
    softCap: number;
    hardCap: number;
};

const statusByPlatform = {
    pinksale: {
        0: '未开始',
        1: '进行中',
        2: '已结束',
        3: '已结束',
    },
    maplesale: {
        0: '未开始',
        1: '进行中',
        2: '已结束',
        3: '已结束',
    },
} as any;

const abisByPlatform: any = {
    pinksale: pinksaleAbi,
    maplesale: maplesaleAbi,
};

const funcByPlatform: any = {
    pinksale: {
        status: 'getUpdatedState',
        softCap: 'softCap',
        hardCap: 'hardCap',
    },
    maplesale: {
        status: 'getState',
        softCap: 'minCap',
        hardCap: 'maxCap',
    },
};

export const getPresaleInfo = async (presaleAddress: string, platform: PLATFORM, rpc?: string): Promise<PresaleInfo> => {
    const provider = getProvider(rpc);
    const contract = new ethers.Contract(presaleAddress, abisByPlatform[platform], provider);

    const tokenAddress = await contract.token();
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);

    const [name, startTime, status, softCap, hardCap] = await Promise.all([
        tokenContract.name(),
        contract.startTime().then((t: BigInt) => Number(t) * 1000),
        contract[funcByPlatform[platform].status](),
        contract[funcByPlatform[platform].softCap]().then((t: BigInt) => Number(t) / 1e18),
        contract[funcByPlatform[platform].hardCap]().then((t: BigInt) => Number(t) / 1e18),
    ]);
    return { platform, name, startTime, status: statusByPlatform[platform][status], presaleAddress, tokenAddress, hardCap, softCap };
};
