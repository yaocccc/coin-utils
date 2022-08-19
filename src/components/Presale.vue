<template>
    <h2>参数设置</h2>
    <n-form ref="formRef" label-placement="left" label-width="auto" require-mark-placement="right-hanging">
        <n-form-item label="预售: ">
            <n-radio-group v-model:value="form.platform">
                <n-radio-button v-for="platform in platforms" :key="platform.value" :value="platform.value" :label="platform.label" />
            </n-radio-group>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <n-input v-model:value="form.token" type="text" placeholder="预售地址" style="paddin: 10px" />
            <n-input v-if="form.platform == 'rawdata'" v-model:value="form.rawdata" type="text" placeholder="16进制data" style="margin-left: 10px; in: 10px" />
        </n-form-item>
        <n-form-item label="私钥列表: ">
            <n-input v-model:value="form.private_keys" type="textarea" placeholder="导入私钥 按行分割" />
        </n-form-item>

        <n-form-item label="交易参数: ">
            <n-form inline :label-width="80">
                <n-form-item label="gasLimit">
                    <n-input-number v-model:value="form.gasLimit" placeholder="gasLimit" />
                </n-form-item>
                <n-form-item label="gasPrice(GWei)">
                    <n-input-number v-model:value="form.gasPrice" placeholder="gasLimit" />
                </n-form-item>
                <n-form-item label="value(BNB)">
                    <n-input-number v-model:value="form.value" placeholder="value" />
                </n-form-item>
            </n-form>
        </n-form-item>

        <n-form-item label=" ">
            <n-button type="primary" @click="submit">提交</n-button>
        </n-form-item>
        <n-divider />
    </n-form>

    <template v-if="form.platform != 'rawdata'">
        <h2>预售信息</h2>
        <n-spin :show="loading">
            <n-card>
                预售名称: {{ presale.name }} &nbsp;&nbsp;&nbsp;&nbsp; 预售状态: {{ presale.status }} <br />
                预售地址: {{ presale.presaleAddress }} <br />
                代币地址: {{ presale.tokenAddress }} <br />
                预售开始时间: {{ new Date(presale.startTime).toLocaleString() }} <br />
                软顶: {{ presale.softCap }} &nbsp;&nbsp;&nbsp;&nbsp; 硬顶: {{ presale.hardCap }} <br />
            </n-card>
        </n-spin>
    </template>

    <h2>
        任务列表 &nbsp;&nbsp;
        <n-button type="info" @click="submit">清空任务列表</n-button>
    </h2>
    <n-data-table :columns="addressesColumns" :data="addressesData" />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { PLATFORM } from '../types';
import { getPresaleInfo, PresaleInfo } from '../eth/presale';
import { sGet, sSet } from '../js/utils';
import axios from 'axios';

// TODO 参数校验
// TODO 前端打包交易
// TODO 权限校验

export default defineComponent({
    name: 'Presale',
    setup() {
        let form = {
            platform: 'pinksale' as PLATFORM,
            private_keys: '',
            token: '',
            gasLimit: 500000,
            gasPrice: 5,
            value: 0,
            rawdata: '',
        };
        try {
            console.log(sGet('presale_form'));
            if (sGet('presale_form')) form = JSON.parse(sGet('presale_form') as any);
            console.log(form);
        } catch (e) {}
        return {
            loading: ref(false),
            presale: ref({} as PresaleInfo),
            form: ref(form),
            platforms: [
                { label: 'PinkSale', value: 'pinksale' },
                { label: 'MapleSale', value: 'maplesale' },
                { label: '16进制', value: 'rawdata' },
            ] as { label: string; value: PLATFORM }[],
            addressesData: ref([] as { address: string; private_key: string; bnb: string }[]),
            addressesColumns: [
                {
                    title: '地址',
                    key: 'address',
                },
                {
                    title: '私钥',
                    key: 'private_key',
                },
                {
                    title: 'BNB余额',
                    key: 'bnb',
                },
            ],
        };
    },
    methods: {
        async submit() {
            this.loading = true;
            const headers = {
                address: '42feba13647352747bec09a25b49a1a9',
            };
            const res = await axios.get('/api/tx', { headers });
            console.log(res.data);

            sSet('presale_form', JSON.stringify(this.form));
            this.loading = false;
        },
    },
});
</script>
