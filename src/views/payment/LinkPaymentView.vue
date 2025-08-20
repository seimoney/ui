<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import type { Link as PaymentLink } from '../../types';
import { type Hex } from 'viem';
import { useWalletStore } from '../../stores/wallet';
import { useWeb3Modal } from '@web3modal/wagmi/vue';
import { getWalletClient } from '@wagmi/core';
import { config } from '../../utils/wallet-config';
import { createSeiMoneySDK } from '@seimoney/sdk/src/sdk';

const route = useRoute();
const paymentId = route.params.id as Hex;
const sdk = createSeiMoneySDK({ apiUrl: import.meta.env.VITE_API_URL });

const paymentLink = ref<PaymentLink | null>(null);
const isLoading = ref(true);
const isSigning = ref(false);
const transaction = ref<string | null>(null);
const isCompleted = ref(false);
const error = ref('');
const modal = useWeb3Modal();

const walletStore = useWalletStore();

onMounted(async () => {
    try {
        paymentLink.value = await sdk.paymentLinks.getPaymentLink(paymentId);
    } catch (err) {
        error.value = 'Failed to load payment link';
    } finally {
        isLoading.value = false;
    }
});

const handleSignToPay = async () => {
    if (!paymentLink.value) return;

    isSigning.value = true;
    error.value = '';

    try {
        const walletClient = await getWalletClient(config);

        transaction.value = await sdk.paymentLinks.fulfillPaymentLink({ paymentId }, walletClient as any);

        if (!transaction.value) return;

        isCompleted.value = true;
    } catch (err) {
        error.value = 'Payment failed. Please try again.';
    } finally {
        isSigning.value = false;
    }
};

const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
</script>

<template>
    <div class="payment-container">
        <div class="payment-card">
            <!-- Loading State -->
            <div v-if="isLoading" class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading payment details...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error && !paymentLink" class="error-state">
                <div class="error-icon">❌</div>
                <h3>Payment Link Not Found</h3>
                <p>{{ error }}</p>
            </div>

            <!-- Success State -->
            <div v-else-if="isCompleted" class="success-state">
                <div class="success-icon">✅</div>
                <h3>Payment Successful!</h3>
                <p>Your payment has been processed successfully.</p>
                <div class="success-details">
                    <p><strong>Amount:</strong> {{ paymentLink?.amount.amount }} {{ paymentLink?.amount.token.symbol }}
                    </p>
                    <p><strong>To:</strong> {{ formatAddress(paymentLink?.recipientAddress || '') }}</p>
                    <p><strong>Ref:</strong> {{ transaction }}</p>
                </div>
            </div>

            <!-- Payment Form -->
            <div v-else-if="paymentLink" class="payment-form">
                <div class="payment-header">
                    <h2>{{ paymentLink.description }}</h2>
                    <div class="payment-amount">
                        <span class="amount">{{ paymentLink.amount.amount }} {{ paymentLink.amount.token.symbol
                            }}</span>
                        <img :src="paymentLink.amount.token.icon" :alt="paymentLink.amount.token.symbol"
                            class="token-icon" />
                    </div>
                </div>

                <div class="payment-details">
                    <div class="detail-section">
                        <h4>Payment Details</h4>
                        <div class="detail-item">
                            <span class="label">Amount:</span>
                            <span class="value">{{ paymentLink.amount.amount }} {{ paymentLink.amount.token.symbol
                                }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Token:</span>
                            <span class="value">{{ paymentLink.amount.token.name }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Recipient:</span>
                            <span class="value address">{{ formatAddress(paymentLink.recipientAddress) }}</span>
                        </div>
                    </div>

                    <div v-if="Object.keys(paymentLink.attributes).length > 0" class="detail-section">
                        <h4>Additional Information</h4>
                        <div v-for="(value, key) in paymentLink.attributes" :key="key" class="detail-item">
                            <span class="label">{{ key }}:</span>
                            <span class="value">{{ value }}</span>
                        </div>
                    </div>
                </div>

                <div v-if="error" class="error-message">
                    {{ error }}
                </div>

                <div class="payment-actions">
                    <button @click="modal.open()" class="btn btn-primary" v-if="!walletStore.address">
                        <span>Connect Wallet</span>
                    </button>

                    <button @click="handleSignToPay" class="btn btn-primary" :disabled="isSigning" v-else>
                        <span v-if="isSigning">Signing Transaction...</span>
                        <span v-else>Sign to Pay</span>
                    </button>
                </div>

                <div class="payment-info">
                    <p>🔒 Secure payment powered by Sei Network</p>
                    <p>You will be prompted to sign the transaction with your wallet</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.payment-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.payment-card {
    background: var(--bg-primary);
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 500px;
    border: 1px solid var(--border-color);
}

.loading-state,
.error-state,
.success-state {
    text-align: center;
    padding: 40px 20px;
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

.error-icon,
.success-icon {
    font-size: 3rem;
    margin-bottom: 16px;
}

.error-state h3,
.success-state h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.error-state p,
.success-state p {
    color: var(--text-secondary);
    margin-bottom: 16px;
}

.success-details {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 16px;
    text-align: left;
}

.success-details p {
    margin-bottom: 8px;
    font-size: 0.9rem;
}

.success-details p:last-child {
    margin-bottom: 0;
}

.payment-header {
    text-align: center;
    margin-bottom: 32px;
}

.payment-header h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
}

.payment-amount {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
}

.amount {
    font-size: 2rem;
    font-weight: 700;
    color: #10b981;
}

.token-icon {
    width: 30px;
    height: 30px;
    border-radius: 12px;
    object-fit: cover;
}

.payment-details {
    margin-bottom: 24px;
}

.detail-section {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
}

.detail-section:last-child {
    margin-bottom: 0;
}

.detail-section h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-color);
}

.detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.detail-item:last-child {
    margin-bottom: 0;
}

.label {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.value {
    color: var(--text-primary);
    font-weight: 500;
    font-size: 0.9rem;
}

.value.address {
    font-family: 'Courier New', monospace;
    background: var(--bg-primary);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.8rem;
}

.error-message {
    color: #ef4444;
    font-size: 0.9rem;
    text-align: center;
    padding: 12px;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 6px;
    border: 1px solid rgba(239, 68, 68, 0.2);
    margin-bottom: 24px;
}

.payment-actions {
    margin-bottom: 24px;
}

.btn {
    width: 100%;
    padding: 16px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.payment-info {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
}

.payment-info p {
    color: var(--text-secondary);
    font-size: 0.8rem;
    margin-bottom: 4px;
}

.payment-info p:last-child {
    margin-bottom: 0;
}

@media (max-width: 480px) {
    .payment-card {
        padding: 24px;
    }

    .payment-header h2 {
        font-size: 1.25rem;
    }

    .amount {
        font-size: 1.5rem;
    }

    .token-icon {
        font-size: 1.5rem;
    }
}
</style>