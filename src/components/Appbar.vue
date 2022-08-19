<template>
    <n-page-header>
        <template #title> BC Utils (BSC链) </template>
        <template #extra>
            <n-space>
                <h3>{{ bus.address || 'Please connect you wallet!' }}</h3>
                <n-popover trigger="hover" :duration="500">
                    <template #trigger>
                        <n-icon size="30" @click="connectWallet()" style="margin-top: 10px">
                            <wallet-sharp />
                        </n-icon>
                    </template>
                    <span> 该鉴权基于你钱包地址是否已加入白名单 </span>
                </n-popover>
            </n-space>
        </template>
    </n-page-header>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { WalletSharp } from '@vicons/ionicons5';
import { connectWallet } from '../eth/wallet';
import { api } from '../apis/auth';
import { useMessage } from 'naive-ui';
import { useBus } from '../js/store';

export default defineComponent({
    components: {
        WalletSharp,
    },
    setup() {
        window.$message = useMessage();
        window.$bus = useBus();
        connectWallet().then((r) => api.checkAuth());
        return {
            bus: window.$bus,
        };
    },
    methods: {
        async connectWallet() {
            await connectWallet();
            await api.checkAuth();
        },
    },
});
</script>
