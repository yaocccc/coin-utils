import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { MessageApiInjection } from 'naive-ui/es/message/src/MessageProvider';
import { Bus } from './js/store';

createApp(App).use(createPinia()).mount('#app');

declare global {
    interface Window {
        $message: MessageApiInjection;
        $bus: Bus;
    }
}
