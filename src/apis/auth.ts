import axios from './common';

export const api = {
    checkAuth: async () => {
        const bus = window.$bus;
        const address = bus.address;
        if (address === '') window.$message.error('Please connect wallet first');

        try {
            const headers = { address };
            const res = await axios.get('/api/auth', { headers });
            if (res.data != true) {
                window.$message.error('你的帐号不属于白名单帐号');
            } else {
                window.$message.success('鉴权成功');
                bus.setAuth(true);
                return;
            }
        } catch (e: any) {
            window.$message.error('鉴权失败:' + e.message);
        }

        bus.setAuth(false);
    },
};
