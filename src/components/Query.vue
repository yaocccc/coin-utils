<template>
    <br />
    <n-grid x-gap="8" cols="12">
        <n-gi span="10" offset="1">
            <n-space vertical>
                <n-input v-model:value="addresses" type="textarea" placeholder="输入地址 按行分割" />
            </n-space>
        </n-gi>
    </n-grid>
    <br />
    <n-grid x-gap="8" cols="12">
        <n-gi span="2" offset="1">
            <n-select v-model:value="target" :options="options" />
        </n-gi>
        <n-gi span="3" v-if="target == '其他'">
            <n-input v-model:value="contract" placeholder="输入合约地址" />
        </n-gi>
        <n-gi>
            <n-button type="info" @click="show"> 查询 </n-button>
        </n-gi>
    </n-grid>
    <br />

    <n-grid x-gap="8" cols="12">
        <n-gi span="10" offset="1">
            <n-data-table :columns="columns" :data="rows" />
        </n-gi>
    </n-grid>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { NSelect, NSpace, NInput, NButton, NGi, NGrid, NDataTable } from 'naive-ui';
import { ethers } from 'ethers';

const sGet = (key: string) => {
    try {
        return typeof Storage !== 'undefined' ? localStorage.getItem(key) : null;
    } catch (e) {
        return null;
    }
};
const sSet = (key: string, value: any) => {
    try {
        typeof Storage !== 'undefined' && localStorage.setItem(key, value);
    } catch (e) {}
};

const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
const abi = [
    {
        inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    { inputs: [], name: 'decimals', outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }], stateMutability: 'view', type: 'function' },
];

export default defineComponent({
    name: 'Query',
    components: {
        NInput,
        NSpace,
        NGi,
        NGrid,
        NButton,
        NSelect,
        NDataTable,
    },
    setup() {
        return {
            addresses: ref(sGet('addresses') || ''),
            contract: ref(sGet('contract') || ''),
            target: ref('BNB'),
            options: [
                {
                    label: '只查BNB',
                    value: 'BNB',
                },
                {
                    label: 'USDT',
                    value: '0x55d398326f99059fF775485246999027B3197955',
                },
                {
                    label: 'BUSD',
                    value: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
                },
                {
                    label: '其他',
                    value: '其他',
                },
            ],
            rows: ref([] as { address: string; bnbbalance: string; balance: string }[]),
            columns: [
                {
                    title: '地址',
                    key: 'address',
                },
                {
                    title: 'BNB余额',
                    key: 'bnbbalance',
                },
                {
                    title: '余额',
                    key: 'balance',
                },
            ],
        };
    },
    methods: {
        show: function () {
            sSet('addresses', this.addresses);
            sSet('contract', this.contract);
            const addresses = this.addresses
                .split('\n')
                .map((item) => item.trim())
                .filter((item) => /0x[a-fA-F0-9]{40}/.test(item));
            this.rows = addresses.map((address) => {
                return {
                    address,
                    bnbbalance: 'loading...',
                    balance: this.target != 'BNB' ? 'loading...' : '--',
                };
            });
            this.getBalance();
        },
        getBalance: async function () {
            const contract = new ethers.Contract(this.target == '其他' ? this.contract : this.target, abi, provider);
            let decimals = 18;
            if (this.target != 'BNB') {
                decimals = await contract.decimals();
            }

            for (const item of this.rows) {
                try {
                    const bnbbalance = await provider.getBalance(item.address);
                    item.bnbbalance = ethers.utils.formatEther(bnbbalance);
                    if (this.target == 'BNB') continue;
                    const balance = await contract.balanceOf(item.address);
                    item.balance = String(balance / 10 ** decimals);
                } catch (e) {
                    alert('发生错误 请检查地址、合约');
                }
            }
        },
    },
});
</script>

<style scoped>
.light-green {
    height: 108px;
    background-color: rgba(0, 128, 0, 0.12);
}
.green {
    height: 108px;
    background-color: rgba(0, 128, 0, 0.24);
}
</style>
