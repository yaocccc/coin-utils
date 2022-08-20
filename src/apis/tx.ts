import axios from './common';

export type TxRequest = {
    address: string;
    signedTx: string;
    startTime: number;
    endTime: number;
    retry: number;
    retryDelay: number;
    timeDiff: number;
};

type TxTaskConfig = {
    startTime: number; // 执行开始时间
    endTime: number; // 执行结束时间
    retry: number; // 最大重试次数
    retryDelay: number; // 失败重试的间隔
    timeDiff: number; // -5000: 提前五秒开始 5000: 延后五秒开始
};
type TxTaskStatus = 'PENDING' | 'RUNNING' | 'FAILED' | 'COMPLETED' | 'OVERTIME' | 'ABORTED';
type Tx = {
    uuid: string;
    ower: string;
    address: string; // 地址
    signedTx: string; // 已签名的交易
    taskConfig: TxTaskConfig;
    createTime: number;
    logs: string[];
    status: TxTaskStatus;
};

export const api = {
    getTxs: async (): Promise<Tx[]> => {
        const res = await axios.get(`/api/tx`);
        return res.data;
    },
    getNonces: async (addresses: string[]): Promise<{ address: string, nonce: number }[]> => { 
        const res = await axios.post('/api/nonce', { addresses });
        return res.data;
    },
    putTxs: async (txs: TxRequest[]): Promise<Tx[]> => {
        const res = await axios.put(`/api/tx`, { txs });
        return res.data;
    },
    // abortTxs: async (): Promise<Tx[]> => {},
};
