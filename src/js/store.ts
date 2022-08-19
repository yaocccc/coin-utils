import { defineStore, acceptHMRUpdate, Store, StoreDefinition } from 'pinia';

export type Bus = {
    address: string;
    auth: boolean;
    login: (address: string) => void;
    logout: () => void;
    setAuth: (auth: boolean) => void;
}
export const useBus= defineStore({
    id: 'bus',
    state: () => ({
        address: '',
        auth: false as boolean,
    }),

    actions: {
        login(address: string) {
            this.$patch({ address });
        },
        logout() {
            this.$patch({
                address: ''
            });
        },
        setAuth(auth: boolean) {
            this.$patch({ auth });
        }
    },
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useBus, import.meta.hot));
}
