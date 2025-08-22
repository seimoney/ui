<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuth } from './composables/useAuth';
import { useTheme } from './composables/useTheme';
import { config } from './utils/wallet-config';
import { useWalletStore } from './stores/wallet';
import { createWeb3Modal } from '@web3modal/wagmi/vue';
import { watchAccount } from '@wagmi/core';

import 'vue3-toastify/dist/index.css';

const { initAuth } = useAuth();
const { initTheme } = useTheme();
const walletStore = useWalletStore();

createWeb3Modal({
    wagmiConfig: config,
    projectId: import.meta.env.VITE_REOWN_PROJECT_ID,
    enableAnalytics: true,
    themeMode: 'dark'
});

onMounted(() => {
    initAuth();
    initTheme();
    watchAccount(config, {
        onChange(account) {
            if (account.address) {
                walletStore.setAddress(account.address);
            }
        }
    });
});
</script>

<template template>
    <div class="app">
        <router-view />
    </div>
</template>

<style style scoped>
.app {
    min-height: 100vh;
}
</style>;