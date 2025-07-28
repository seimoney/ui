<script setup lang="ts">
import { ref } from 'vue';
import { useTheme } from '../../composables/useTheme';
import { useWalletStore } from '../../stores/wallet';
import { useRoute } from 'vue-router';

const route = useRoute();
const walletStore = useWalletStore();
const sidebarCollapsed = ref(false);

const { isDark, toggleTheme } = useTheme();

const navigation = [
    { name: 'Overview', path: '/dashboard', icon: 'mdi mdi-view-dashboard' },
    { name: 'Payment Links', path: '/dashboard/links', icon: 'mdi mdi-link-variant' },
    { name: 'Files', path: '/dashboard/files', icon: 'mdi mdi-folder-lock' },
    { name: 'Checkout', path: '/dashboard/checkout', icon: 'mdi mdi-cart' },
    { name: 'Payrolls', path: '/dashboard/contracts', icon: 'mdi mdi-file-document' },
    { name: 'Smart Account', path: '/dashboard/smart-account', icon: 'mdi mdi-robot' }
];

const toggleSidebarCollapse = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
};
</script>

<template>
    <div class="dashboard-layout">
        <!-- Sidebar -->
        <aside class="sidebar" :class="{ 'sidebar-open': true, 'sidebar-collapsed': sidebarCollapsed }">
            <div class="sidebar-header">
                <h2 class="logo" v-show="!sidebarCollapsed">SeiMoney</h2>
                <button @click="toggleSidebarCollapse" class="collapse-btn desktop-only">
                    <i :class="sidebarCollapsed ? 'mdi mdi-chevron-right' : 'mdi mdi-chevron-left'"></i>
                </button>
            </div>

            <nav class="sidebar-nav">
                <router-link v-for="item in navigation" :key="item.name" :to="item.path" class="nav-item"
                    :class="{ 'active': route.path === item.path }">
                    <span class="nav-icon"><i :class="item.icon"></i></span>
                    <span class="nav-text" v-show="!sidebarCollapsed">{{ item.name }}</span>
                </router-link>
            </nav>

            <div class="sidebar-footer">
                <div class="user-info">
                    <img :src="walletStore.account?.avatarURL || '/images/colors.png'" :alt="walletStore.account?.name"
                        class="user-avatar" />
                    <div class="user-details" v-show="!sidebarCollapsed">
                        <p class="user-name">{{ walletStore.account?.name }}</p>
                        <p class="user-email">{{ walletStore.account?.emailAddress }}</p>
                    </div>
                </div>
                <router-link to="/account" class="settings-link"><i class="mdi mdi-cog"></i></router-link>
            </div>
        </aside>

        <!-- Main Content -->
        <div class="main-content">
            <!-- Top Bar -->
            <header class="top-bar">
                <button @click="toggleSidebarCollapse" class="sidebar-toggle desktop-hidden">
                    <i class="mdi mdi-menu"></i>
                </button>

                <div class="top-bar-actions">
                    <button @click="toggleTheme" class="theme-toggle">
                        <i :class="isDark ? 'mdi mdi-weather-night' : 'mdi mdi-weather-sunny'"></i>
                    </button>
                </div>
            </header>

            <!-- Page Content -->
            <main class="page-content">
                <router-view />
            </main>
        </div>

    </div>
</template>

<style scoped>
.dashboard-layout {
    display: flex;
    height: 100vh;
    background: var(--bg-primary);
}

.sidebar {
    width: 280px;
    height: 100vh;
    transition: width 0.3s ease;
    border-right: 1px solid var(--border-color);
}

.sidebar.sidebar-collapsed {
    width: 80px;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 80px;
    top: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
}

.sidebar-open {
    transform: translateX(0);
}

.sidebar-header {
    padding: 0 24px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 64px;
}

.logo {
    font-size: 1.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.collapse-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: var(--text-primary);
    padding: 8px;
    border-radius: 6px;
    transition: background 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.sidebar-toggle {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: var(--text-primary);
    padding: 8px;
    border-radius: 6px;
    transition: background 0.2s ease;
}

.collapse-btn:hover,
.sidebar-toggle:hover {
    background: var(--bg-tertiary);
}

.sidebar-nav {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 48px;
    padding: 12px 16px;
    border-radius: 8px;
    color: var(--text-secondary);
    text-decoration: none;
    transition: all 0.2s ease;
}

.sidebar-collapsed .nav-item {
    justify-content: center;
}

.nav-item:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
}

.nav-item.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.nav-icon {
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
}

.nav-text {
    font-weight: 500;
}

.sidebar-footer {
    padding: 16px;
    border-top: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: absolute;
    bottom: 0;
}

.sidebar-collapsed .sidebar-footer {
    justify-content: center;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
}

.sidebar-collapsed .user-info {
    display: none;
}


.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}

.user-details {
    flex: 1;
    min-width: 0;
}

.user-name {
    font-weight: 500;
    color: var(--text-primary);
    font-size: 0.9rem;
    margin-bottom: 2px;
}

.user-email {
    color: var(--text-secondary);
    font-size: 0.8rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.settings-link {
    padding: 8px;
    border-radius: 6px;
    color: var(--text-secondary);
    text-decoration: none;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}

.settings-link:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.sidebar-collapsed+.main-content {
    margin-left: 80px;
}

.top-bar {
    height: 64px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 60px;
    position: sticky;
    top: 0;
    z-index: 100;
    justify-content: flex-end;
}

.top-bar-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.theme-toggle {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-primary);
    transition: all 0.2s ease;
}

.theme-toggle:hover {
    background: var(--bg-tertiary);
}

.page-content {
    flex: 1;
    padding: 32px;
    overflow-y: auto;
}

.mobile-only {
    display: none;
}

.desktop-hidden {
    display: block;
}

/* Desktop Styles */
@media (min-width: 768px) {
    .sidebar {
        position: static;
        transform: translateX(0);
    }

    .sidebar-collapsed {
        width: 280px;
    }

    .sidebar-overlay {
        display: none;
    }

    .mobile-only {
        display: block;
    }

    .desktop-hidden {
        display: none;
    }
}

/* Mobile Styles */
@media (max-width: 767px) {
    .main-content {
        margin-left: 0;
    }

    .page-content {
        padding: 20px;
    }

    .user-details {
        display: none;
    }
}
</style>