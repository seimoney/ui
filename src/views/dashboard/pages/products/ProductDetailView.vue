<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Product, Activity } from '../../../../types';
import { createSeiMoneySDK } from '@seimoney/sdk/src/sdk';
import { toast } from 'vue3-toastify';

const route = useRoute();
const router = useRouter();
const sdk = createSeiMoneySDK({ apiUrl: import.meta.env.VITE_API_URL });

const isLoading = ref(true);
const product = ref<Product | null>(null);
const activities = ref<Activity[]>([]);
const isDeleting = ref(false);
const selectedImageIndex = ref(0);

const productId = route.params.id as string;

const getProduct = async () => {
    isLoading.value = true;
    try {
        product.value = await sdk.products.getProduct(productId);
        activities.value = await sdk.analytics.getActivitiesFor(productId);
    } catch (error) {
        console.error('Error fetching product:', error);
    }
    isLoading.value = false;
};

const deleteProduct = async () => {
    if (!product.value) return;

    isDeleting.value = true;
    try {
        // const deleted = await sdk.products.deleteProduct(productId);

        // if (deleted) {
        //     router.push('/dashboard/checkout');
        // }
    } catch (error) {
        console.error('Error deleting product:', error);
    }
    isDeleting.value = false;
};

const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        toast('Copied', { autoClose: 3000 });
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
    }
};

const copyProductLink = () => {
    if (!product.value) return;
    const url = `${window.location.origin}/checkout/products/${product.value.productId}`;
    copyToClipboard(url);
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



const selectImage = (index: number) => {
    selectedImageIndex.value = index;
};

onMounted(() => {
    getProduct();
});
</script>

<template>
    <div class="product-detail-container">
        <!-- Back Navigation -->
        <div class="back-nav">
            <button @click="router.back()" class="back-btn">
                <span class="back-icon">←</span>
                Back to Checkout
            </button>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading product details...</p>
        </div>

        <div v-else-if="product" class="product-detail-content">
            <!-- Product Header -->
            <div class="product-header">
                <div class="product-images">
                    <div class="main-image" v-if="product.images && product.images.length">
                        <img :src="product.images[selectedImageIndex].url"
                            :alt="product.images[selectedImageIndex].caption || product.name"
                            class="main-image-display" />
                    </div>

                    <div class="image-thumbnails" v-if="product.images && product.images.length > 1">
                        <img v-for="(image, index) in product.images" :key="index" :src="image.url"
                            :alt="image.caption || product.name" @click="selectImage(index)" class="thumbnail"
                            :class="{ 'active': index === selectedImageIndex }" />
                    </div>
                </div>

                <div class="product-info">
                    <div class="product-badges">
                        <span v-if="product.isFeatured" class="badge featured">⭐ Featured</span>
                        <span v-if="!product.isOnSale" class="badge inactive">Inactive</span>
                        <span v-if="product.availableInStock === 0" class="badge sold-out">Sold Out</span>
                    </div>

                    <h1>{{ product.name }}</h1>
                    <p class="product-description">{{ product.description }}</p>

                    <div class="product-price">
                        <span class="amount">{{ product.amount.amount }} {{ product.amount.token.symbol }}</span>
                        <img :src="product.amount.token.icon" :alt="product.amount.token.symbol" class="token-icon" />
                    </div>

                    <div class="product-actions">
                        <button @click="copyProductLink" class="btn btn-primary">
                            📋 Copy Product Link
                        </button>
                        <button @click="deleteProduct" :disabled="isDeleting" class="btn btn-outline btn-danger">
                            <span v-if="isDeleting">Deleting...</span>
                            <span v-else>🗑️ Delete Product</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Product Details Grid -->
            <div class="details-grid">
                <!-- Basic Information -->
                <div class="detail-card">
                    <h3>Product Information</h3>
                    <div class="detail-rows">
                        <div class="detail-row">
                            <span class="label">Product ID:</span>
                            <span class="value monospace">{{ product.productId }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Available Stock:</span>
                            <span class="value">{{ product.availableInStock }}</span>
                        </div>
                        <div class="detail-row" v-if="product.maxQuantity">
                            <span class="label">Max Quantity:</span>
                            <span class="value">{{ product.maxQuantity }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Featured:</span>
                            <span class="value">{{ product.isFeatured ? 'Yes' : 'No' }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">On Sale:</span>
                            <span class="value">{{ product.isOnSale ? 'Yes' : 'No' }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Created:</span>
                            <span class="value">{{ formatDate(product.createdAt) }}</span>
                        </div>
                        <div class="detail-row" v-if="product.updatedAt">
                            <span class="label">Last Updated:</span>
                            <span class="value">{{ formatDate(product.updatedAt) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Payment Information -->
                <div class="detail-card">
                    <h3>Payment Details</h3>
                    <div class="detail-rows">
                        <div class="detail-row">
                            <span class="label">Price:</span>
                            <span class="value payment-amount">
                                {{ product.amount.amount }} {{ product.amount.token.symbol }}
                            </span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Token:</span>
                            <span class="value">{{ product.amount.token.name }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Token Address:</span>
                            <div class="address-field">
                                <span class="value monospace">{{ formatAddress(product.amount.token.address) }}</span>
                                <button @click="copyToClipboard(product.amount.token.address)" class="copy-btn"
                                    title="Copy token address">
                                    📋
                                </button>
                            </div>
                        </div>
                        <div class="detail-row">
                            <span class="label">Network:</span>
                            <span class="value">{{ product.network }}</span>
                        </div>
                    </div>
                </div>

                <!-- Checkout Information -->
                <div class="detail-card">
                    <h3>Store Information</h3>
                    <div class="detail-rows">
                        <div class="detail-row">
                            <span class="label">Checkout ID:</span>
                            <span class="value monospace">{{ product.checkoutId }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Owner:</span>
                            <div class="address-field">
                                <span class="value monospace">{{ formatAddress(product.owner) }}</span>
                                <button @click="copyToClipboard(product.owner)" class="copy-btn"
                                    title="Copy owner address">
                                    📋
                                </button>
                            </div>
                        </div>
                        <div class="detail-row">
                            <span class="label">Product URL:</span>
                            <div class="url-field">
                                <span class="value url-text">{{
                                    `https://seimoney.link/checkout/${product.checkoutId}/product/${product.productId}`
                                    }}</span>
                                <button @click="copyProductLink" class="copy-btn" title="Copy product link">
                                    📋
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Product Images Gallery -->
            <div class="images-gallery" v-if="product.images && product.images.length > 0">
                <h3>Product Images</h3>
                <div class="images-grid">
                    <div v-for="(image, index) in product.images" :key="index" class="image-item">
                        <img :src="image.url" :alt="image.caption || product.name" class="gallery-image" />
                        <p v-if="image.caption" class="image-caption">{{ image.caption }}</p>
                    </div>
                </div>
            </div>

            <!-- Transaction History -->
            <div class="activity-section">
                <h3>Sales History</h3>
                <div v-if="activities.length === 0" class="empty-activities">
                    <p>No sales yet</p>
                </div>
                <div v-else class="activities-list">
                    <div v-for="activity in activities" :key="activity.id" class="activity-item"
                        :class="{ 'failed': activity.status === 'failed' }">
                        <div class="activity-info">
                            <div class="activity-header">
                                <div class="activity-type">
                                    <span class="type-icon">🛒</span>
                                    <span class="type-text">Product Sale</span>
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
            <h2>Product not found</h2>
            <p>The requested product could not be found.</p>
            <button @click="router.push('/dashboard/checkout')" class="btn btn-primary">
                Back to Checkout
            </button>
        </div>
    </div>
</template>

<style scoped>
.product-detail-container {
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

.product-header {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-bottom: 40px;
    padding: 32px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
}

.product-images {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.main-image {
    width: 100%;
    height: 400px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--border-color);
}

.main-image-display {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-thumbnails {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.thumbnail {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    object-fit: cover;
    border: 2px solid var(--border-color);
    cursor: pointer;
    transition: all 0.2s ease;
}

.thumbnail:hover,
.thumbnail.active {
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
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.badge {
    padding: 6px 12px;
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

.badge.inactive {
    background: rgba(156, 163, 175, 0.1);
    color: #9ca3af;
    border: 1px solid rgba(156, 163, 175, 0.2);
}

.badge.sold-out {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
}

.product-info h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 16px;
    line-height: 1.2;
}

.product-description {
    color: var(--text-secondary);
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 24px;
}

.product-price {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 32px;
}

.amount {
    font-size: 2.5rem;
    font-weight: 700;
    color: #10b981;
}

.token-icon {
    width: 40px;
    height: 40px;
    border-radius: 20px;
    object-fit: cover;
}

.product-actions {
    display: flex;
    gap: 16px;
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

.btn-danger {
    color: #ef4444;
    border-color: #ef4444;
}

.btn-danger:hover:not(:disabled) {
    background: #ef4444;
    color: white;
}

.details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
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
    font-size: 1.2rem;
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

.images-gallery {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 32px;
}

.images-gallery h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 20px;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 8px;
}

.images-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
}

.image-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.gallery-image {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

.image-caption {
    font-size: 0.8rem;
    color: var(--text-secondary);
    text-align: center;
}

.activity-section {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
}

.activity-section h3 {
    font-size: 1.2rem;
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

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
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

@media (max-width: 768px) {
    .product-header {
        grid-template-columns: 1fr;
        gap: 24px;
    }

    .product-info h1 {
        font-size: 2rem;
    }

    .amount {
        font-size: 2rem;
    }

    .product-actions {
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

    .images-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }

    .activity-item {
        flex-direction: column;
        gap: 12px;
    }
}
</style>