<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { Link as PaymentLink } from '../../../../types';
import { RouterLink } from 'vue-router';
import { createSeiMoneySDK } from '@seimoney/sdk/src/sdk';

const isLoading = ref(true);
const links = ref<PaymentLink[]>([]);
const sdk = createSeiMoneySDK({ apiUrl: import.meta.env.VITE_API_URL });

const getLinks = async () => {
    isLoading.value = true;
    links.value = await sdk.paymentLinks.getPaymentLinks();
    isLoading.value = false;
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active': return '#10b981';
        case 'paid': return '#6366f1';
        case 'expired': return '#ef4444';
        default: return '#6b7280';
    }
};

const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

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

const copyLink = (linkId: string) => {
    const url = `${window.location.origin}/pay/${linkId}`;
    navigator.clipboard.writeText(url);
};


onMounted(() => {
    getLinks();
});
</script>

<template>
    <div class="links-container">
        <div class="links-header">
            <div>
                <h1>Payment Links</h1>
                <p>Create and manage payment links for your products and services</p>
            </div>
            <router-link to="/dashboard/links/create" class="btn btn-primary">
                + Create Link
            </router-link>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading your payment link...</p>
        </div>

        <div class="links-content" v-else>
            <div v-if="links.length === 0" class="empty-state">
                <div class="empty-icon">🔗</div>
                <h3>No payment links yet</h3>
                <p>Create your first payment link to start accepting payments</p>
                <router-link to="/dashboard/links/create" class="btn btn-primary">
                    Create Payment Link
                </router-link>
            </div>

            <div v-else class="links-grid">
                <div v-for="link in links" :key="link.paymentId" class="link-card">
                    <div class="link-header">
                        <div class="link-info">
                            <h3>{{ link.description }}</h3>
                            <div class="link-amount">
                                <span class="amount">{{ link.amount.amount }} {{ link.amount.token.symbol }}</span>
                                <img :src="link.amount.token.icon" :alt="link.amount.token.symbol" class="token-icon" />
                            </div>
                        </div>
                        <div class="link-status" :style="{ color: getStatusColor(link.status) }">
                            <span class="status-dot" :style="{ background: getStatusColor(link.status) }"></span>
                            {{ link.status }} {{ link.status === 'active' ? `(${link.nonce})` : null }}
                        </div>
                    </div>

                    <div class="link-details">
                        <div class="detail-item">
                            <span class="detail-label">Recipient:</span>
                            <span class="detail-value address">{{ formatAddress(link.recipientAddress) }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Network:</span>
                            <span class="detail-value">{{ link.network }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Created:</span>
                            <span class="detail-value">{{ formatDate(new Date(link.createdAt)) }}</span>
                        </div>
                        <div v-if="link.attributes.category" class="detail-item">
                            <span class="detail-label">Category:</span>
                            <span class="detail-value">{{ link.attributes.category }}</span>
                        </div>
                        <div v-if="link.attributes.duration" class="detail-item">
                            <span class="detail-label">Duration:</span>
                            <span class="detail-value">{{ link.attributes.duration }}</span>
                        </div>
                    </div>

                    <div class="link-url">
                        <div class="url-display">
                            <span class="url-text">{{ 'https://seimoney.link' }}/pay/{{ link.paymentId }}</span>
                            <button @click="copyLink(link.paymentId)" class="copy-btn" title="Copy link">
                                📋
                            </button>
                        </div>
                    </div>

                    <div class="link-actions">
                        <RouterLink :to="`links/${link.paymentId}`">
                            <button class="btn  btn-secondary">
                                View Details
                            </button>
                        </RouterLink>
                        <button @click="copyLink(link.paymentId)" class="btn btn-outline">
                            Copy Link
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.links-container {
    max-width: 1200px;
    margin: 0 auto;
}

.links-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
}

.links-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.links-header p {
    color: var(--text-secondary);
    font-size: 1.1rem;
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    text-align: center;
    transition: all 0.2s ease;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

.btn-secondary:hover {
    background: var(--bg-tertiary);
}

.btn-outline {
    background: transparent;
    color: #667eea;
    border: 1px solid #667eea;
}

.btn-outline:hover {
    background: #667eea;
    color: white;
}

.empty-state {
    text-align: center;
    padding: 80px 20px;
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 16px;
    opacity: 0.5;
}

.empty-state h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.empty-state p {
    color: var(--text-secondary);
    margin-bottom: 24px;
}

.links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 24px;
}

.link-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
    transition: all 0.2s ease;
}

.link-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.link-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
}

.link-info h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.link-amount {
    display: flex;
    align-items: center;
    gap: 8px;
}

.amount {
    font-size: 1.1rem;
    font-weight: 700;
    color: #10b981;
}

.token-icon {
    width: 20px;
    height: 20px;
    border-radius: 12px;
    object-fit: cover;
}

.link-status {
    display: flex;
    align-items: center;
    gap: 6px;
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

.link-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.detail-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.detail-value {
    color: var(--text-primary);
    font-weight: 500;
    font-size: 0.9rem;
}

.detail-value.address {
    font-family: 'Courier New', monospace;
    background: var(--bg-primary);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.8rem;
}

.link-url {
    margin-bottom: 20px;
}

.url-display {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
}

.url-text {
    flex: 1;
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    color: var(--text-secondary);
    word-break: break-all;
}

.copy-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: background 0.2s ease;
}

.copy-btn:hover {
    background: var(--bg-tertiary);
}

.link-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.link-actions .btn {
    flex: 1;
    min-width: 100px;
    font-size: 0.9rem;
    padding: 10px 16px;
}

@media (max-width: 768px) {
    .links-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }

    .links-grid {
        grid-template-columns: 1fr;
    }

    .link-actions {
        flex-direction: column;
    }

    .link-actions .btn {
        flex: none;
    }
}
</style>