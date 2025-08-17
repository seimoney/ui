<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import type { Product, Checkout } from '../../../../types';
import { createSeiMoneySDK } from '@seimoney/sdk/src/sdk';

const isLoading = ref(true);
const checkout = ref<Checkout | null>(null);
const products = ref<Product[]>([]);
const stats = ref({ totalProducts: 0, totalEarnings: '0', currency: 'USDC' });
const showCreateCheckout = ref(false);
const sdk = createSeiMoneySDK({ apiUrl: import.meta.env.VITE_API_URL });

const loadCheckoutData = async () => {
    isLoading.value = true;
    try {
        const checkoutData = await sdk.products.getCheckout();

        checkout.value = checkoutData;
        products.value = await sdk.products.getProducts();
    } catch (error) {
        showCreateCheckout.value = true;
        console.error('Error loading checkout data:', error);
    }
    finally {
        isLoading.value = false;
    }
};

const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

onMounted(() => {
    loadCheckoutData();
});
</script>

<template>
    <div class="checkout-container">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading your checkout...</p>
        </div>

        <!-- Create Checkout State -->
        <div v-else-if="showCreateCheckout" class="create-checkout-state">
            <div class="create-checkout-card">
                <div class="create-icon">🏪</div>
                <h2>Create Your Checkout</h2>
                <p>Set up your digital storefront to start selling products and accepting payments</p>
                <RouterLink to="/dashboard/checkout/create" class="btn btn-primary">
                    Create Checkout
                </RouterLink>
            </div>
        </div>

        <!-- Checkout Dashboard -->
        <div v-else-if="checkout" class="checkout-content">
            <!-- Header -->
            <div class="checkout-header">
                <div class="header-info">
                    <div class="checkout-logo" v-if="checkout.logoURL">
                        <img :src="checkout.logoURL" :alt="checkout.name" class="logo-image" />
                    </div>
                    <div>
                        <h1>{{ checkout.name }}</h1>
                        <p class="tagline" v-if="checkout.tagline">{{ checkout.tagline }}</p>
                        <div class="checkout-meta">
                            <span class="category" v-if="checkout.category">{{ checkout.category }}</span>
                            <span class="location">{{ checkout.location.city }}, {{ checkout.location.country }}</span>
                        </div>
                    </div>
                </div>
                <div class="header-actions">
                    <RouterLink to="/dashboard/checkout/settings" class="btn btn-outline">
                        ⚙️ Settings
                    </RouterLink>
                    <RouterLink to="/dashboard/products/create" class="btn btn-primary">
                        + Add Product
                    </RouterLink>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">📦</div>
                    <div class="stat-content">
                        <h3>{{ stats.totalProducts }}</h3>
                        <p>Total Products</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-content">
                        <h3>{{ stats.totalEarnings }} {{ stats.currency }}</h3>
                        <p>Total Earnings</p>
                    </div>
                </div>
            </div>

            <!-- Products Section -->
            <div class="products-section">
                <div class="section-header">
                    <h2>Your Products</h2>
                    <RouterLink to="/dashboard/products/create" class="btn btn-secondary">
                        + Add Product
                    </RouterLink>
                </div>

                <div v-if="products.length === 0" class="empty-products">
                    <div class="empty-icon">📦</div>
                    <h3>No products yet</h3>
                    <p>Add your first product to start selling</p>
                    <RouterLink to="/dashboard/products/create" class="btn btn-primary">
                        Add Product
                    </RouterLink>
                </div>

                <div v-else class="products-grid">
                    <div v-for="product in products" :key="product.productId" class="product-card">
                        <div class="product-image" v-if="product.images && product.images.length">
                            <img :src="product.images[0].url" :alt="product.name" class="image" />
                            <div class="product-badges">
                                <span v-if="product.isFeatured" class="badge featured">⭐ Featured</span>
                                <span v-if="!product.isOnSale" class="badge inactive">Inactive</span>
                            </div>
                        </div>

                        <div class="product-content">
                            <div class="product-header">
                                <h3 class="product-name">{{ product.name }}</h3>
                                <div class="product-price">
                                    <span class="amount">{{ product.amount.amount }} {{ product.amount.token.symbol
                                        }}</span>
                                    <div class="network-badge">
                                        <span class="network-name">{{ product.network }}</span>
                                    </div>
                                </div>
                            </div>

                            <p class="product-description">{{ product.description }}</p>

                            <div class="product-stats">
                                <div class="stat-item">
                                    <span class="stat-label">Stock:</span>
                                    <span class="stat-value">{{ product.availableInStock }}</span>
                                </div>
                                <div class="stat-item" v-if="product.maxQuantity">
                                    <span class="stat-label">Max Qty:</span>
                                    <span class="stat-value">{{ product.maxQuantity }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Created:</span>
                                    <span class="stat-value">{{ formatDate(product.createdAt) }}</span>
                                </div>
                            </div>

                            <div class="product-actions">
                                <RouterLink :to="`/dashboard/products/${product.productId}`" class="btn btn-secondary">
                                    View Details
                                </RouterLink>
                                <button class="btn btn-outline">
                                    Copy product link
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.checkout-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.loading-state {
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

.create-checkout-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
}

.create-checkout-card {
    text-align: center;
    padding: 60px 40px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    max-width: 500px;
}

.create-icon {
    font-size: 4rem;
    margin-bottom: 24px;
    opacity: 0.8;
}

.create-checkout-card h2 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 12px;
}

.create-checkout-card p {
    color: var(--text-secondary);
    font-size: 1.1rem;
    margin-bottom: 32px;
    line-height: 1.6;
}

.checkout-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    padding: 24px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
}

.header-info {
    display: flex;
    align-items: flex-start;
    gap: 20px;
}

.checkout-logo {
    width: 80px;
    height: 80px;
    border-radius: 12px;
    overflow: hidden;
    flex-shrink: 0;
}

.logo-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.checkout-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.tagline {
    color: var(--text-secondary);
    font-size: 1.1rem;
    margin-bottom: 12px;
}

.checkout-meta {
    display: flex;
    gap: 16px;
    align-items: center;
}

.category,
.location {
    padding: 4px 12px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    font-size: 0.8rem;
    color: var(--text-secondary);
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

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
}

.stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    transition: all 0.2s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
    font-size: 2.5rem;
    opacity: 0.8;
}

.stat-content h3 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.stat-content p {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.products-section {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color);
}

.section-header h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
}

.empty-products {
    text-align: center;
    padding: 60px 20px;
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 16px;
    opacity: 0.5;
}

.empty-products h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.empty-products p {
    color: var(--text-secondary);
    margin-bottom: 24px;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 24px;
}

.product-card {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s ease;
}

.product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.product-image {
    position: relative;
    height: 200px;
    overflow: hidden;
}

.image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.product-badges {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
}

.badge.featured {
    background: rgba(255, 193, 7, 0.9);
    color: #000;
}

.badge.inactive {
    background: rgba(239, 68, 68, 0.9);
    color: white;
}

.product-content {
    padding: 20px;
}

.product-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
}

.product-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.3;
    flex: 1;
    margin-right: 12px;
}

.product-price {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
}

.amount {
    font-size: 1rem;
    font-weight: 700;
    color: #10b981;
}

.network-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    background: var(--bg-secondary);
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 500;
    text-transform: capitalize;
}

.network-icon {
    font-size: 0.8rem;
}

.product-description {
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 16px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.product-stats {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
}

.stat-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.stat-label {
    font-size: 0.7rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    font-weight: 500;
}

.stat-value {
    font-size: 0.8rem;
    color: var(--text-primary);
    font-weight: 600;
}

.product-actions {
    display: flex;
    gap: 8px;
}

.product-actions .btn {
    flex: 1;
    font-size: 0.8rem;
    padding: 8px 12px;
}

@media (max-width: 768px) {
    .checkout-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }

    .header-info {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .header-actions {
        flex-direction: column;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .section-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }

    .products-grid {
        grid-template-columns: 1fr;
    }

    .product-header {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
    }

    .product-price {
        align-items: flex-start;
    }

    .product-actions {
        flex-direction: column;
    }
}
</style>