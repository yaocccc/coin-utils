<template>
    <h2>参数设置</h2>
    <n-form ref="formRef" label-placement="left" label-width="auto" require-mark-placement="right-hanging">
        <n-form-item label="预售: ">
            <n-radio-group v-model:value="form.platform">
                <n-radio-button
                    v-for="platform in platforms"
                    :key="platform.value"
                    :value="platform.value"
                    :label="platform.label"
                    :status="validate.platform"
                />
            </n-radio-group>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <n-input v-model:value="form.token" type="text" placeholder="预售地址" style="paddin: 10px" :status="validate.token" />
            <n-input
                v-if="form.platform == 'rawdata'"
                v-model:value="form.rawdata"
                type="text"
                placeholder="16进制data"
                style="margin-left: 10px; in: 10px"
                :status="validate.rawdata"
            />
        </n-form-item>

        <n-form-item label="私钥列表: ">
            <n-input
                v-model:value="form.private_keys"
                type="textarea"
                placeholder="导入私钥 按行分割 仅在前端签名交易 不会与后端交互私钥(建议使用小号交易)"
                :status="validate.private_keys"
            />
        </n-form-item>

        <n-form-item label="交易参数: ">
            <n-form inline :label-width="80">
                <n-form-item label="gasLimit">
                    <n-input-number v-model:value="form.gasLimit" placeholder="gasLimit" :status="validate.gasLimit" />
                </n-form-item>
                <n-form-item label="gasPrice(GWei)">
                    <n-input-number v-model:value="form.gasPrice" placeholder="gasPrice" :status="validate.gasPrice" />
                </n-form-item>
                <n-form-item label="value(BNB)">
                    <n-input-number v-model:value="form.value" placeholder="value" :status="validate.value" />
                </n-form-item>
            </n-form>
        </n-form-item>

        <n-form-item label="任务参数: ">
            <n-form inline :label-width="80">
                <n-form-item label="开始时间(时区: Asia/Shanghai)">
                    <n-date-picker v-model:value="form.startTime" time-zone="Asia/Shanghai" type="datetime" :status="validate.startTime" />
                    <pre>{{ JSON.stringify(form.startTime) }}</pre>
                </n-form-item>
                <n-form-item label="最大重试次数">
                    <n-input-number v-model:value="form.retry" placeholder="retry" :status="validate.retry" />
                </n-form-item>
                <n-form-item label="重试间隔(毫秒)">
                    <n-input-number v-model:value="form.retryDelay" placeholder="retryDelay" :status="validate.retryDelay" />
                </n-form-item>
                <n-form-item label="提前交易(毫秒)(提前3秒 = -3000|延迟3秒 = 3000)">
                    <n-input-number v-model:value="form.timeDiff" placeholder="timeDiff" :status="validate.timeDiff" />
                </n-form-item>
            </n-form>
        </n-form-item>

        <n-form-item label=" ">
            <n-button type="primary" @click="submit" :loading="loading">提交</n-button>
        </n-form-item>
        <n-divider />
    </n-form>

    <h2>
        任务列表 &nbsp;&nbsp;
        <n-button tertiary type="error" @click="submit">清空任务列表</n-button>
        <n-button tertiary type="default" @click="syncTxs" style="margin-left: 10px">刷新列表</n-button>
    </h2>
    <n-data-table :columns="txTaskColumns" :data="txTaskData" />
    <h2>日志</h2>
    <n-timeline>
        <n-timeline-item v-for="log in logs" :content="log.content" :type="log.type" :time="new Date(log.time).toLocaleString()" />
    </n-timeline>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { PLATFORM } from '../types';
import { sGet, sSet, sleep } from '../js/utils';
import { getProvider, getWallet } from '../eth/provider';
import { ethers } from 'ethers';
import { api, TxRequest } from '../apis/tx';

// TODO 参数校验
// TODO 前端打包交易
// TODO 权限校验

type Tx = { address: string; private_key: string; bnb: string; signedTx: string; startTime: number; status: string };

export default defineComponent({
    name: 'Presale',
    mounted() {
        const syncTxs = async () => {
            await this.syncTxs();
            await sleep(this.txTaskData.find((tx) => ['RUNNING', 'PENDING'].includes(tx.status)) ? 3000 : 30000);
            syncTxs();
        };
        syncTxs();
    },
    setup() {
        let form = {
            platform: 'pinksale' as PLATFORM,
            private_keys: '',
            token: '',
            gasLimit: 500000,
            gasPrice: 5,
            value: 0,
            rawdata: '',
            startTime: Date.now(),
            retry: 3,
            retryDelay: 500,
            timeDiff: 0,
        };
        let validate = {
            platform: 'success',
            private_keys: 'success',
            token: 'success',
            gasLimit: 'success',
            gasPrice: 'success',
            value: 'success',
            rawdata: 'success',
            startTime: 'success',
            retry: 'success',
            retryDelay: 'success',
            timeDiff: 'success',
        };
        try {
            if (sGet('presale_form')) form = JSON.parse(sGet('presale_form') as any);
        } catch (e) {}
        return {
            loading: ref(false),
            form: ref(form),
            validate: ref(validate),
            platforms: [
                { label: 'PinkSale', value: 'pinksale' },
                { label: 'MapleSale', value: 'maplesale' },
                { label: '16进制', value: 'rawdata' },
            ] as { label: string; value: PLATFORM }[],
            txTaskData: ref([] as Tx[]),
            txTaskColumns: [
                { title: '地址', key: 'address' },
                { title: '私钥', key: 'private_key' },
                { title: 'BNB余额', key: 'bnb' },
                { title: '已签名交易', key: 'signedTx' },
                { title: '开始时间', key: 'startTime' },
                { title: '状态', key: 'status' },
                { title: '操作' },
            ],
            logs: ref([{ time: Date.now(), content: '登入', type: '' }] as { time: number; content: string; type: '' | 'success' | 'error' }[]),
        };
    },
    methods: {
        async syncTxs() {
            this.txTaskData = await api.getTxs().then((r) => {
                return r.map((tx) => {
                    tx.signedTx = tx.signedTx.substring(0, 10) + '...';
                    return tx;
                }) as any;
            });
        },
        async submit() {
            this.loading = true;
            try {
                this.logs.push({ time: Date.now(), content: '提交交易', type: '' });
                if (this.txTaskData.length) {
                    const ok = confirm('已有交易正在等待，是否先清空原有的交易再继续？');
                    if (ok) {
                    } else {
                        this.logs.push({ time: Date.now(), content: '提交交易取消', type: 'error' });
                        this.loading = false;
                        window.$message.error('已取消提交动作');
                        return;
                    }
                }
                const clone = { ...this.form };
                // clone.private_keys = ''; // 脱敏
                sSet('presale_form', JSON.stringify(clone));
                const txs = await this.signTxs();
                const res = await api.putTxs(txs);
                this.txTaskData = res.map((tx) => {
                    tx.signedTx = '';
                    return tx;
                }) as any;
                this.logs.push({ time: Date.now(), content: '提交交易完成', type: 'success' });
            } catch (e: any) {
                this.logs.push({ time: Date.now(), content: '提交交易发生错误', type: 'error' });
                window.$message.error(e.message);
            }
            this.loading = false;
        },
        async signTxs() {
            this.logs.push({ time: Date.now(), content: '开始签名交易', type: '' });
            const dataByPlatform: any = {
                pinksale: '0xd7bb99ba',
                maplesale: '0x73e888fd0000000000000000000000000000000000000000000000000000000000000000',
            };
            const txs: TxRequest[] = [];
            const private_keys = this.form.private_keys
                .split('\n')
                .map((p) => p.trim())
                .filter((p) => !!p);
            const addresses = private_keys.map((p) => new ethers.Wallet(p).address);
            const nonces = await api.getNonces(addresses);
            for (const private_key of private_keys) {
                const wallet = getWallet(private_key);
                const tx: TxRequest = {
                    address: wallet.address,
                    signedTx: '',
                    startTime: this.form.startTime,
                    endTime: this.form.startTime + 1000 * 300,
                    retry: this.form.retry,
                    retryDelay: this.form.retryDelay,
                    timeDiff: this.form.timeDiff,
                };

                const txParams = {
                    nonce: nonces.find((n) => n.address === wallet.address)?.nonce || 0,
                    gasPrice: this.form.gasPrice * 1e9,
                    gasLimit: this.form.gasLimit,
                    to: this.form.token,
                    value: ethers.utils.parseEther(this.form.value.toString()),
                    data: dataByPlatform[this.form.platform] || this.form.rawdata, // DATA的获取逻辑
                };
                tx.signedTx = await wallet.signTransaction(txParams);
                console.log(tx);
                txs.push(tx);
            }

            this.logs.push({ time: Date.now(), content: '签名交易完成', type: 'success' });
            return txs;
        },
    },
    watch: {
        'form.platform': { deep: true, handler: function (n, o) {} },
        'form.private_keys': { deep: true, handler: function (n, o) {} },
        'form.token': { deep: true, handler: function (n, o) {} },
        'form.gasLimit': { deep: true, handler: function (n, o) {} },
        'form.gasPrice': { deep: true, handler: function (n, o) {} },
        'form.value': { deep: true, handler: function (n, o) {} },
        'form.rawdata': { deep: true, handler: function (n, o) {} },
        'form.startTime': { deep: true, handler: function (n, o) {} },
        'form.retry': { deep: true, handler: function (n, o) {} },
        'form.retryDelay': { deep: true, handler: function (n, o) {} },
        'form.timeDiff': { deep: true, handler: function (n, o) {} },
    },
});
</script>
