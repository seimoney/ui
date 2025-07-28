<script setup lang="ts">
import { useAuth } from '../../composables/useAuth';
import { useTheme } from '../../composables/useTheme';
import { useRouter } from 'vue-router';
import { useWalletStore } from '../../stores/wallet';

const { logout } = useAuth();
const walletStore = useWalletStore();
const { isDark, toggleTheme } = useTheme();

const router = useRouter();
const handleLogout = () => {
    logout();
    router.push('/login');
};
</script>

<template>
    <div class="account-container">
        <div class="account-header">
            <h1>Account Settings</h1>
            <button @click="router.go(-1)" class="btn btn-secondary">
                ← Back
            </button>
        </div>

        <div class="account-content">
            <div class="profile-section">
                <div class="profile-card">
                    <div class="profile-avatar">
                        <img :src="walletStore.account?.avatarURL || '/images/colors.png'"
                            :alt="walletStore.account?.name || 'User Avatar'" />
                    </div>
                    <div class="profile-info">
                        <h2>{{ walletStore.account?.name || 'Anonymous User' }}</h2>
                        <p class="email">{{ walletStore.account?.emailAddress }}</p>
                        <p class="address">{{ walletStore.account?.owner }}</p>
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <div class="settings-card">
                    <h3>Preferences</h3>

                    <div class="setting-item">
                        <div class="setting-info">
                            <h4>Theme</h4>
                            <p>Choose your preferred theme</p>
                        </div>
                        <button @click="toggleTheme" class="theme-toggle">
                            <span v-if="isDark">🌙</span>
                            <span v-else>☀️</span>
                            {{ isDark ? 'Dark' : 'Light' }}
                        </button>
                    </div>

                    <div class="setting-item">
                        <div class="setting-info">
                            <h4>Network</h4>
                            <p>Connected to Sei Network</p>
                        </div>
                        <div class="network-status">
                            <span class="status-dot"></span>
                            Connected
                        </div>
                    </div>
                </div>
            </div>

            <div class="actions-section">
                <button @click="handleLogout" class="btn btn-danger">
                    Sign Out
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.account-container {
    padding: 24px;
    max-width: 800px;
    margin: 0 auto;
}

.account-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
}

.account-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
}

.account-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.profile-card,
.settings-card {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 24px;
    border: 1px solid var(--border-color);
}

.profile-card {
    display: flex;
    align-items: center;
    gap: 20px;
}

.profile-avatar img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--border-color);
}

.profile-info h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.profile-info .email {
    color: var(--text-secondary);
    margin-bottom: 8px;
}

.profile-info .address {
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    color: var(--text-secondary);
    background: var(--bg-primary);
    padding: 4px 8px;
    border-radius: 4px;
    word-break: break-all;
}

.settings-card h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 20px;
}

.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid var(--border-color);
}

.setting-item:last-child {
    border-bottom: none;
}

.setting-info h4 {
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.setting-info p {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.theme-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s ease;
}

.theme-toggle:hover {
    background: var(--bg-tertiary);
}

.network-status {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #10b981;
    font-weight: 500;
}

.status-dot {
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    animation: pulse 2s infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-secondary {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

.btn-secondary:hover {
    background: var(--bg-tertiary);
}

.btn-danger {
    background: #ef4444;
    color: white;
}

.btn-danger:hover {
    background: #dc2626;
    transform: translateY(-1px);
}

@media (max-width: 768px) {
    .account-header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
    }

    .profile-card {
        flex-direction: column;
        text-align: center;
    }

    .setting-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
}
</style>