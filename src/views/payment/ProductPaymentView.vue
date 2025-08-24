<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import type { Product } from '../../types';
import { useWalletStore } from '../../stores/wallet';
import { useWeb3Modal } from '@web3modal/wagmi/vue';
import { getWalletClient } from '@wagmi/core';
import { config } from '../../utils/wallet-config';
import { createSeiMoneySDK } from '@seimoney/sdk/src/sdk';

const route = useRoute();
const productId = route.params.id as string;
const sdk = createSeiMoneySDK({ apiUrl: import.meta.env.VITE_API_URL });

const product = ref<Product | null>(null);
const quantity = ref(1);
const isLoading = ref(true);
const isPaying = ref(false);
const isCompleted = ref(false);
const transaction = ref<string | null>(null);
const error = ref('');
const modal = useWeb3Modal();
const walletStore = useWalletStore();

const loadProduct = async () => {
    try {
        product.value = await sdk.products.getProduct(productId);
    } catch (err) {
        error.value = 'Failed to load product details';
    } finally {
        isLoading.value = false;
    }
};

const updateQuantity = (newQuantity: number) => {
    if (!product.value) return;

    const maxAllowed = product.value.maxQuantity || product.value.availableInStock;
    quantity.value = Math.max(1, Math.min(newQuantity, maxAllowed));
};

const getTotalAmount = () => {
    if (!product.value) return 0;
    return parseFloat(product.value.amount.amount) * quantity.value;
};

const handlePayment = async () => {
    if (!product.value) return;

    isPaying.value = true;
    error.value = '';

    try {
        const walletClient = await getWalletClient(config);

        transaction.value = await sdk.products.fulfill(
            product.value.productId,
            quantity.value,
            walletClient as any
        );

        if (!transaction.value) {
            error.value = 'Payment failed. Please try again.';
            return;
        }

        isCompleted.value = true;
    } catch (err) {
        console.error('Payment failed:', err);
        error.value = 'Payment failed. Please try again.';
    } finally {
        isPaying.value = false;
    }
};

onMounted(() => {
    loadProduct();
});
</script>

<template>
    <div class="product-payment-container">
        <div class="product-payment-card">
            <!-- Loading State -->
            <div v-if="isLoading" class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading product details...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error && !product" class="error-state">
                <div class="error-icon">❌</div>
                <h3>Product Not Found</h3>
                <p>{{ error }}</p>
            </div>

            <!-- Success State -->
            <div v-else-if="isCompleted" class="success-state">
                <div class="success-icon">✅</div>
                <h3>Purchase Successful!</h3>
                <p>Thank you for your purchase. Your order has been confirmed.</p>
                <div class="purchase-summary">
                    <div class="summary-item">
                        <span class="label">Product:</span>
                        <span class="value">{{ product?.name }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Quantity:</span>
                        <span class="value">{{ quantity }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Total:</span>
                        <span class="value">{{ getTotalAmount().toFixed(2) }} {{ product?.amount.token.symbol }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Transaction:</span>
                        <span class="value monospace">{{ transaction }}</span>
                    </div>
                </div>
            </div>

            <!-- Payment Form -->
            <div v-else-if="product" class="product-payment-form">
                <div class="product-header">
                    <div class="product-images" v-if="product.images && product.images.length">
                        <div class="main-image">
                            <img :src="product.images[0].url" :alt="product.name" />
                        </div>
                        <div class="image-thumbnails" v-if="product.images.length > 1">
                            <img v-for="(image, index) in product.images.slice(1, 4)" :key="index" :src="image.url"
                                :alt="image.caption || product.name" class="thumbnail" />
                        </div>
                    </div>

                    <div class="product-info">
                        <div class="product-badges" v-if="product.isFeatured || product.availableInStock === 0">
                            <span v-if="product.isFeatured" class="badge featured">⭐ Featured</span>
                            <span v-if="product.availableInStock === 0" class="badge sold-out">Sold Out</span>
                        </div>

                        <h2>{{ product.name }}</h2>
                        <p class="product-description">{{ product.description }}</p>

                        <div class="product-price">
                            <span class="amount">{{ product.amount.amount }} {{ product.amount.token.symbol }}</span>
                            <img :src="product.amount.token.icon" :alt="product.amount.token.symbol"
                                class="token-icon" />
                        </div>

                        <div class="product-details">
                            <div class="detail-item">
                                <span class="label">Available Stock:</span>
                                <span class="value">{{ product.availableInStock }}</span>
                            </div>
                            <div class="detail-item" v-if="product.maxQuantity">
                                <span class="label">Max per Order:</span>
                                <span class="value">{{ product.maxQuantity }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Network:</span>
                                <span class="value">{{ product.network }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="purchase-section">
                    <div class="quantity-section">
                        <label>Quantity:</label>
                        <div class="quantity-controls">
                            <button @click="updateQuantity(quantity - 1)" :disabled="quantity <= 1"
                                class="quantity-btn">
                                -
                            </button>
                            <span class="quantity-display">{{ quantity }}</span>
                            <button @click="updateQuantity(quantity + 1)"
                                :disabled="quantity >= (product.maxQuantity || product.availableInStock)"
                                class="quantity-btn">
                                +
                            </button>
                        </div>
                    </div>

                    <div class="total-section">
                        <div class="total-breakdown">
                            <div class="breakdown-item">
                                <span>Unit Price:</span>
                                <span>{{ product.amount.amount }} {{ product.amount.token.symbol }}</span>
                            </div>
                            <div class="breakdown-item">
                                <span>Quantity:</span>
                                <span>{{ quantity }}</span>
                            </div>
                            <div class="breakdown-item total">
                                <span>Total:</span>
                                <span>{{ getTotalAmount().toFixed(2) }} {{ product.amount.token.symbol }}</span>
                            </div>
                        </div>
                    </div>

                    <div v-if="error" class="error-message">
                        {{ error }}
                    </div>

                    <div class="payment-actions">
                        <button @click="modal.open()" v-if="!walletStore.address" class="btn btn-primary">
                            Connect Wallet
                        </button>
                        <button @click="handlePayment" v-else :disabled="isPaying || product.availableInStock === 0"
                            class="btn btn-primary">
                            <span v-if="isPaying">Processing Payment...</span>
                            <span v-else-if="product.availableInStock === 0">Sold Out</span>
                            <span v-else>Purchase Now</span>
                        </button>
                    </div>

                    <div class="payment-info">
                        <p>🔒 Secure payment powered by Sei Network</p>
                        <p>You will be prompted to sign the transaction with your wallet</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.product-payment-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.product-payment-card {
    background: var(--bg-primary);
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 800px;
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

.purchase-summary {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
    text-align: left;
}

.summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.summary-item:last-child {
    margin-bottom: 0;
}

.label {
    color: var(--text-secondary);
    font-weight: 500;
}

.value {
    color: var(--text-primary);
    font-weight: 600;
}

.monospace {
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    word-break: break-all;
}

.product-header {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    margin-bottom: 32px;
}

.product-images {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.main-image {
    width: 100%;
    height: 300px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--border-color);
}

.main-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-thumbnails {
    display: flex;
    gap: 8px;
}

.thumbnail {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    object-fit: cover;
    border: 1px solid var(--border-color);
    cursor: pointer;
    transition: all 0.2s ease;
}

.thumbnail:hover {
    border-color: #667eea;
    transform: scale(1.05);
}

.product-info {
    display: flex;
    flex-direction: column;
}

.product-badges {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
}

.badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
}

.badge.featured {
    background: rgba(255, 193, 7, 0.1);
    color: #ffc107;
    border: 1px solid rgba(255, 193, 7, 0.2);
}

.badge.sold-out {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
}

.product-info h2 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 16px;
    line-height: 1.3;
}

.product-description {
    color: var(--text-secondary);
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 24px;
}

.product-price {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
}

.amount {
    font-size: 2rem;
    font-weight: 700;
    color: #10b981;
}

.token-icon {
    width: 32px;
    height: 32px;
    border-radius: 16px;
    object-fit: cover;
}

.product-details {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 16px;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.detail-item:last-child {
    margin-bottom: 0;
}

.detail-item .label {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.detail-item .value {
    color: var(--text-primary);
    font-weight: 500;
    font-size: 0.9rem;
}

.purchase-section {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
}

.quantity-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
}

.quantity-section label {
    font-weight: 600;
    color: var(--text-primary);
}

.quantity-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 8px;
}

.quantity-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: var(--bg-primary);
    color: var(--text-primary);
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1.1rem;
    transition: all 0.2s ease;
}

.quantity-btn:hover:not(:disabled) {
    background: var(--bg-tertiary);
}

.quantity-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.quantity-display {
    min-width: 40px;
    text-align: center;
    font-weight: 600;
    color: var(--text-primary);
    font-size: 1.1rem;
}

.total-section {
    margin-bottom: 24px;
}

.total-breakdown {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 16px;
}

.breakdown-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 0.9rem;
}

.breakdown-item:last-child {
    margin-bottom: 0;
}

.breakdown-item.total {
    font-size: 1.1rem;
    font-weight: 700;
    padding-top: 8px;
    border-top: 1px solid var(--border-color);
    color: var(--text-primary);
}

.breakdown-item span:first-child {
    color: var(--text-secondary);
}

.breakdown-item span:last-child {
    color: var(--text-primary);
    font-weight: 500;
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

.payment-actions .or {
    margin: 20px 0;
    text-align: center;
    color: var(--text-primary);
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

.btn-outline {
    background: transparent;
    color: #667eea;
    border: 1px solid #667eea;
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

@media (max-width: 768px) {
    .product-payment-card {
        padding: 24px;
    }

    .product-header {
        grid-template-columns: 1fr;
        gap: 24px;
    }

    .main-image {
        height: 250px;
    }

    .product-info h2 {
        font-size: 1.5rem;
    }

    .amount {
        font-size: 1.5rem;
    }

    .quantity-section {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
    }

    .quantity-controls {
        justify-content: center;
    }
}
</style>