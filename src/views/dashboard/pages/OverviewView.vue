<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Analytics } from '../../../types';
import { createSeiMoneySDK } from '@seimoney/sdk/src/sdk';

const isLoading = ref(true);
const analytics = ref<Analytics | null>(null);
const sdk = createSeiMoneySDK({ apiUrl: import.meta.env.VITE_API_URL });

const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        minute: '2-digit',
        hour: '2-digit',
        hour12: false
    });
};


onMounted(async () => {
    try {
        analytics.value = await sdk.analytics.getAnalytics();
    } catch (error) {
    } finally {
        isLoading.value = false;
    }
});
</script>

<template>
    <div class="overview-container">
        <div class="overview-header">
            <h1>Dashboard Overview</h1>
            <p>Welcome back! Here's what's happening with your SeiMoney account.</p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading your dashboard...</p>
        </div>

        <!-- Dashboard Content -->
        <div v-else class="dashboard-content" v-if="analytics">
            <!-- Stats Grid -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="mdi mdi-credit-card stat-icon">
                        <i class="stat.icon"></i>
                    </div>
                    <div class="stat-content">
                        <h3 class="stat-value">${{ analytics?.totalRevenueUSD?.toFixed(2) }}</h3>
                        <p class="stat-label">Total Revenue</p>
                        <!-- <span class="stat-change positive"></span> -->
                    </div>
                </div>
                <div class="stat-card">
                    <div class="mdi mdi-credit-card stat-icon">
                        <i class="stat.icon"></i>
                    </div>
                    <div class="stat-content">
                        <h3 class="stat-value">{{ analytics.totalPaymentLinks.active }}</h3>
                        <p class="stat-label">Active Links</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="mdi mdi-credit-card stat-icon">
                        <i class="stat.icon"></i>
                    </div>
                    <div class="stat-content">
                        <h3 class="stat-value">{{ analytics.totalFiles.active }}</h3>
                        <p class="stat-label">Active Files</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="mdi mdi-credit-card stat-icon">
                        <i class="stat.icon"></i>
                    </div>
                    <div class="stat-content">
                        <h3 class="stat-value">{{ analytics?.totalContracts.active }}</h3>
                        <p class="stat-label">Active Contracts</p>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="charts-section">
                <div class="chart-card">
                    <h3>Revenue Overview</h3>
                    <div class="chart-container">
                        <div class="chart-placeholder">
                            <div class="chart-bars">
                                <div v-for="(value, index) in Object.values(analytics.recentRevenues)" :key="index"
                                    class="chart-bar"
                                    :style="{ height: `${(value / Object.values(analytics.recentRevenues).reduce((a, b) => a + b, 0)) * 100}%` }">
                                </div>
                            </div>
                            <div class="chart-labels">
                                <span v-for="label in Object.keys(analytics.recentRevenues)" :key="label">{{ label
                                    }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="chart-card">
                    <h3>Active Contracts</h3>
                    <div class="chart-container">
                        <div class="chart-placeholder">
                            <div class="chart-bars">
                                <div v-for="(value, index) in Object.values(analytics.activeContracts)" :key="index"
                                    class="chart-bar secondary"
                                    :style="{ height: `${(value / Object.values(analytics.activeContracts).reduce((a, b) => a + b, 0)) * 100}%` }">
                                </div>
                            </div>
                            <div class="chart-labels">
                                <span v-for="label in Object.keys(analytics.activeContracts)" :key="label">{{ label
                                    }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="activity-section">
                <div class="activity-card">
                    <h3>Recent Activity</h3>
                    <div class="activity-list">
                        <div v-for="activity in analytics.recentsActivities" :key="activity.description"
                            class="activity-item">
                            <div class="activity-icon">
                                <i v-if="activity.type === 'link'" class="mdi mdi-link"></i>
                                <i v-else-if="activity.type === 'contract'" class="mdi mdi-file-document"></i>
                                <i v-else-if="activity.type === 'file'" class="mdi mdi-folder"></i>
                                <i v-else class="mdi mdi-link-variant"></i>
                            </div>
                            <div class="activity-content">
                                <p class="activity-description">{{ activity.description }}</p>
                                <span class="activity-time">{{ formatDate(new Date(activity.createdAt || 0)) }}</span>
                            </div>
                            <div class="activity-amount">{{ activity.amount.amount }} {{ activity.amount.token.symbol }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="actions-section">
                <h3>Quick Actions</h3>
                <div class="actions-grid">
                    <router-link to="/dashboard/links/create" class="action-card">
                        <div class="action-icon">
                            <i class="mdi mdi-link-variant"></i>
                        </div>
                        <h4>Create Payment Link</h4>
                        <p>Generate a new payment link</p>
                    </router-link>

                    <router-link to="/dashboard/contracts/create" class="action-card">
                        <div class="action-icon">
                            <i class="mdi mdi-file-document"></i>
                        </div>
                        <h4>New Contract</h4>
                        <p>Create a payroll contract</p>
                    </router-link>

                    <router-link to="/dashboard/files/upload" class="action-card">
                        <div class="action-icon">
                            <i class="mdi mdi-folder-upload"></i>
                        </div>
                        <h4>Upload File</h4>
                        <p>Gate premium content</p>
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.overview-container {
    max-width: 1200px;
    margin: 0 auto;
}

.overview-header {
    margin-bottom: 32px;
}

.overview-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.overview-header p {
    color: var(--text-secondary);
    font-size: 1.1rem;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    text-align: center;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-color);
    border-top: 3px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.dashboard-content {
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}

.stat-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.2s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
    font-size: 2rem;
    background: var(--bg-primary);
    padding: 12px;
    border-radius: 10px;
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6366f1;
}

.stat-content {
    flex: 1;
}

.stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.stat-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 8px;
}

.stat-change {
    font-size: 0.8rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 12px;
}

.stat-change.positive {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
}

.charts-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;
}

.chart-card,
.activity-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
}

.chart-card h3,
.activity-card h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 20px;
}

.chart-container {
    height: 200px;
}

.chart-placeholder {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.chart-bars {
    flex: 1;
    display: flex;
    align-items: end;
    gap: 8px;
    padding: 0 8px;
}

.chart-bar {
    flex: 1;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 4px 4px 0 0;
    min-height: 20px;
    transition: all 0.3s ease;
}

.chart-bar.secondary {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.chart-bar:hover {
    opacity: 0.8;
    transform: scaleY(1.05);
}

.chart-labels {
    display: flex;
    justify-content: space-between;
    padding: 12px 8px 0;
    font-size: 0.8rem;
    color: var(--text-secondary);
}

.activity-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.activity-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: var(--bg-primary);
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

.activity-icon {
    font-size: 1.5rem;
    background: var(--bg-secondary);
    padding: 8px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6366f1;
}

.activity-content {
    flex: 1;
}

.activity-description {
    color: var(--text-primary);
    font-weight: 500;
    margin-bottom: 4px;
}

.activity-time {
    color: var(--text-secondary);
    font-size: 0.8rem;
}

.activity-amount {
    font-weight: 600;
    color: #10b981;
}

.actions-section h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 20px;
}

.actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
}

.action-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 20px;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s ease;
    text-align: center;
}

.action-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
}

.action-icon {
    font-size: 2rem;
    margin-bottom: 12px;
    color: #6366f1;
}

.action-card h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.action-card p {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

@media (max-width: 768px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }

    .charts-section {
        grid-template-columns: 1fr;
    }

    .actions-grid {
        grid-template-columns: 1fr;
    }

    .activity-item {
        flex-direction: column;
        text-align: center;
        gap: 12px;
    }
}
</style>