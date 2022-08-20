import axios from 'axios';
import qs from 'qs';

var instance = axios.create({
    // baseURL: import.meta.env.VITE_RES_URL, //接口统一域名
    timeout: 60000,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
});

instance.interceptors.request.use(
    (config: any) => {
        if (window.$bus.address) config.headers.address = window.$bus.address;
        console.log(config.method)
        if (config.method === 'post' || config.method === 'put') {
            config.data = qs.stringify(config.data);
            console.log(config.data)
        }
        return config;
    },
    (error) => Promise.reject(error)
);

instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        //响应错误
        if (error.response && error.response.status) {
            const status = error.response.status;
            console.log(status);
            if (status === 401) {
                window.$message.error(`${status}: 授权失败`);
            } else {
                window.$message.error(`${status}: ${error.response.data}`);
            }
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

export default instance;
