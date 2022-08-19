export const connectWallet = async () => {
    const { ethereum } = window as any;
    if (!ethereum) {
        alert('Please install MetaMask');
        return;
    }
    const address = await ethereum.request({ method: 'eth_requestAccounts' }).then((r: string[]) => r[0]);
    window.$bus.login(address);
};
