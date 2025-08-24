<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Link as PaymentLink, Activity } from '../../../../types';
import { createSeiMoneySDK } from '@seimoney/sdk/src/sdk';
import { toast } from 'vue3-toastify';

const route = useRoute();
const router = useRouter();
const sdk = createSeiMoneySDK({ apiUrl: import.meta.env.VITE_API_URL });

const isLoading = ref(true);
const link = ref<PaymentLink | null>(null);
const activities = ref<Activity[]>([]);

const linkId = route.params.id as string;

const getLink = async () => {
    isLoading.value = true;
    try {
        link.value = await sdk.paymentLinks.getPaymentLink(linkId);
        activities.value = await sdk.analytics.getActivitiesFor(linkId);
    } catch (error) {
        console.error('Error fetching link:', error);
    }
    isLoading.value = false;
};


const getStatusColor = (status: string) => {
    switch (status) {
        case 'active': return '#10b981';
        case 'paid': return '#6366f1';
        case 'expired': return '#ef4444';
        case 'pending': return '#f59e0b';
        default: return '#6b7280';
    }
};

const getActivityStatusColor = (status: string) => {
    switch (status) {
        case 'success': return '#10b981';
        case 'failed': return '#ef4444';
        default: return '#6b7280';
    }
};

const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        toast('Copied', { autoClose: 3000 });
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
    }
};

const copyPaymentLink = () => {
    if (!link.value) return;
    const url = `${window.location.origin}/pay/${link.value.paymentId}`;
    copyToClipboard(url);
};

const shareLink = () => {
    if (!link.value) return;
    const url = `${window.location.origin}/pay/${link.value.paymentId}`;
    if (navigator.share) {
        navigator.share({
            title: link.value.description,
            text: `Payment link for ${link.value.description}`,
            url: url
        });
    } else {
        copyPaymentLink();
    }
};

onMounted(() => {
    getLink();
});
</script>

<template>
    <div class="link-detail-container">
        <!-- Back Navigation -->
        <div class="back-nav">
            <button @click="router.back()" class="back-btn">
                <span class="back-icon">←</span>
                Back to Payment Links
            </button>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading link details...</p>
        </div>

        <div v-else-if="link" class="link-detail-content">
            <!-- Link Header -->
            <div class="link-header">
                <div class="header-info">
                    <div class="link-title-section">
                        <div>
                            <h1>{{ link.description }}</h1>
                            <div class="link-status-badge" :style="{
                                color: getStatusColor(link.status),
                                background: `${getStatusColor(link.status)}15`,
                                border: `1px solid ${getStatusColor(link.status)}30`
                            }">
                                <span class="status-dot" :style="{ background: getStatusColor(link.status) }"></span>
                                {{ link.status.charAt(0).toUpperCase() + link.status.slice(1) }}
                                <span v-if="link.status === 'active'" class="nonce-info">({{ link.nonce }})</span>
                            </div>
                        </div>
                    </div>
                    <div class="link-amount">
                        <span class="amount">{{ link.amount.amount }} {{ link.amount.token.symbol }}</span>
                        <img :src="link.amount.token.icon" :alt="link.amount.token.symbol" class="token-icon" />
                    </div>
                </div>

                <div class="header-actions">
                    <button @click="copyPaymentLink" class="btn btn-primary">
                        📋 Copy Link
                    </button>
                    <button @click="shareLink" class="btn btn-outline">
                        📤 Share
                    </button>
                </div>
            </div>

            <!-- Link Details Grid -->
            <div class="details-grid">
                <!-- Basic Information -->
                <div class="detail-card">
                    <h3>Basic Information</h3>
                    <div class="detail-rows">
                        <div class="detail-row">
                            <span class="label">Payment ID:</span>
                            <span class="value monospace">{{ link.paymentId }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Type:</span>
                            <span class="value">{{ link.oneTime ? 'One-time' : 'Reusable' }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Nonce:</span>
                            <span class="value">{{ link.nonce }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Network:</span>
                            <span class="value">{{ link.network }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Created:</span>
                            <span class="value">{{ formatDate(link.createdAt) }}</span>
                        </div>
                        <div class="detail-row" v-if="link.updatedAt">
                            <span class="label">Last Updated:</span>
                            <span class="value">{{ formatDate(link.updatedAt) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Payment Information -->
                <div class="detail-card">
                    <h3>Payment Details</h3>
                    <div class="detail-rows">
                        <div class="detail-row">
                            <span class="label">Amount:</span>
                            <span class="value payment-amount">
                                {{ link.amount.amount }} {{ link.amount.token.symbol }}
                            </span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Recipient:</span>
                            <div class="address-field">
                                <span class="value monospace">{{ formatAddress(link.recipientAddress) }}</span>
                                <button @click="copyToClipboard(link.recipientAddress)" class="copy-btn"
                                    title="Copy recipient address">
                                    📋
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Link Information -->
                <div class="detail-card">
                    <h3>Link Information</h3>
                    <div class="detail-rows">
                        <div class="detail-row">
                            <span class="label">Payment URL:</span>
                            <div class="url-field">
                                <span class="value url-text">{{ `https://seimoney.link/pay/${link.paymentId}`
                                    }}</span>
                                <button @click="copyPaymentLink" class="copy-btn" title="Copy payment link">
                                    📋
                                </button>
                            </div>
                        </div>
                        <div class="detail-row" v-if="link.imageURL">
                            <span class="label">Image:</span>
                            <a :href="link.imageURL" target="_blank" class="value link">View Image</a>
                        </div>
                    </div>
                </div>

                <!-- Attributes -->
                <div class="detail-card" v-if="Object.keys(link.attributes).length > 0">
                    <h3>Attributes</h3>
                    <div class="detail-rows">
                        <div class="detail-row" v-for="(value, key) in link.attributes" :key="key">
                            <span class="label">{{ key }}:</span>
                            <span class="value">{{ value }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Transaction History -->
            <div class="activity-section">
                <h3>Transaction History</h3>
                <div v-if="activities.length === 0" class="empty-activities">
                    <p>No transactions yet</p>
                </div>
                <div v-else class="activities-list">
                    <div v-for="activity in activities" :key="activity.id" class="activity-item"
                        :class="{ 'failed': activity.status === 'failed' }">
                        <div class="activity-info">
                            <div class="activity-header">
                                <div class="activity-type">
                                    <span class="type-icon">
                                        {{ activity.type === 'contract' ? '📋' : activity.type === 'file' ? '📄' : '🔗'
                                        }}
                                    </span>
                                    <span class="type-text">{{ activity.type }}</span>
                                </div>
                                <div class="activity-status"
                                    :style="{ color: getActivityStatusColor(activity.status) }">
                                    <span class="status-dot"
                                        :style="{ background: getActivityStatusColor(activity.status) }"></span>
                                    {{ activity.status }}
                                </div>
                            </div>

                            <p class="activity-description">{{ activity.description }}</p>

                            <div class="activity-details">
                                <div class="activity-amount">
                                    {{ activity.amount.amount }} {{ activity.amount.token.symbol }}
                                </div>
                                <div class="activity-date" v-if="activity.createdAt">
                                    {{ formatDate(activity.createdAt) }}
                                </div>
                            </div>

                            <div v-if="activity.transaction" class="activity-transaction">
                                <span class="label">Transaction:</span>
                                <div class="address-field">
                                    <span class="value monospace">{{ formatAddress(activity.transaction) }}</span>
                                    <button @click="copyToClipboard(activity.transaction)" class="copy-btn"
                                        title="Copy transaction hash">
                                        📋
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="error-state">
            <h2>Payment link not found</h2>
            <p>The requested payment link could not be found.</p>
            <button @click="router.push('/links')" class="btn btn-primary">
                Back to Links
            </button>
        </div>
    </div>
</template>

<style scoped>
.link-detail-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.back-nav {
    margin-bottom: 24px;
}

.back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 8px 0;
    transition: color 0.2s ease;
}

.back-btn:hover {
    color: var(--text-primary);
}

.back-icon {
    font-size: 1.2rem;
}

.loading-state,
.error-state {
    text-align: center;
    padding: 80px 20px;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-color);
    border-top: 3px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.link-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    padding: 24px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
}

.link-title-section {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 12px;
}

.link-image {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
}

.preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.header-info h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 12px;
}

.link-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.nonce-info {
    opacity: 0.7;
    font-weight: 400;
}

.link-amount {
    display: flex;
    align-items: center;
    gap: 8px;
}

.amount {
    font-size: 1.5rem;
    font-weight: 700;
    color: #10b981;
}

.token-icon {
    width: 24px;
    height: 24px;
    border-radius: 12px;
    object-fit: cover;
}

.header-actions {
    display: flex;
    gap: 12px;
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-outline {
    background: transparent;
    color: #667eea;
    border: 1px solid #667eea;
}

.btn-outline:hover:not(:disabled) {
    background: #667eea;
    color: white;
}

.btn-small {
    padding: 8px 16px;
    font-size: 0.8rem;
}

.details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
}

.detail-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
}

.detail-card h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 8px;
}

.detail-rows {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
}

.label {
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 500;
    min-width: 120px;
}

.value {
    color: var(--text-primary);
    font-weight: 500;
    text-align: right;
    word-break: break-all;
}

.monospace {
    font-family: 'Courier New', monospace;
    background: var(--bg-primary);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
}

.payment-amount {
    font-size: 1.1rem;
    font-weight: 600;
    color: #10b981;
}

.address-field,
.url-field {
    display: flex;
    align-items: center;
    gap: 8px;
}

.url-text {
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    word-break: break-all;
}

.link {
    color: #667eea;
    text-decoration: none;
}

.link:hover {
    text-decoration: underline;
}

.copy-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    opacity: 0.6;
    transition: opacity 0.2s ease;
}

.copy-btn:hover {
    opacity: 1;
}

.activity-section {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
}

.activity-section h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 20px;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 8px;
}

.empty-activities {
    text-align: center;
    padding: 40px 20px;
    color: var(--text-secondary);
}

.activities-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.activity-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-primary);
}

.activity-item.failed {
    border-color: #ef444430;
    background: #ef444405;
}

.activity-info {
    flex: 1;
}

.activity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.activity-type {
    display: flex;
    align-items: center;
    gap: 6px;
}

.type-icon {
    font-size: 1rem;
}

.type-text {
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--text-secondary);
}

.activity-status {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
}

.activity-description {
    color: var(--text-primary);
    margin-bottom: 12px;
    font-size: 0.9rem;
}

.activity-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.activity-amount {
    font-weight: 600;
    color: var(--text-primary);
}

.activity-date {
    font-size: 0.8rem;
    color: var(--text-secondary);
}

.activity-transaction {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
}

.activity-transaction .label {
    font-size: 0.8rem;
    min-width: auto;
}

.activity-actions {
    margin-left: 16px;
}

@media (max-width: 768px) {
    .link-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }

    .link-title-section {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .header-actions {
        flex-direction: column;
    }

    .details-grid {
        grid-template-columns: 1fr;
    }

    .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }

    .label {
        min-width: auto;
    }

    .value {
        text-align: left;
    }

    .activity-item {
        flex-direction: column;
        gap: 12px;
    }

    .activity-actions {
        margin-left: 0;
        align-self: stretch;
    }
}
</style>