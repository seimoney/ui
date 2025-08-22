<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import type { Checkout, Product } from '../../types';
import { useWalletStore } from '../../stores/wallet';
import { useWeb3Modal } from '@web3modal/wagmi/vue';
import { getWalletClient } from '@wagmi/core';
import { config } from '../../utils/wallet-config';
import { createSeiMoneySDK } from '@seimoney/sdk/src/sdk';

const route = useRoute();
const checkoutId = route.params.id as string;
const sdk = createSeiMoneySDK({ apiUrl: import.meta.env.VITE_API_URL });

const checkout = ref<Checkout | null>(null);
const products = ref<Product[]>([]);
const cart = ref<{ product: Product; quantity: number; }[]>([]);
const isLoading = ref(true);
const error = ref('');
const modal = useWeb3Modal();
const walletStore = useWalletStore();

const loadCheckout = async () => {
    try {
        checkout.value = await sdk.products.getCheckout(checkoutId);
        if (checkout.value) {
            products.value = await sdk.products.getProducts(checkoutId);
        }
    } catch (err) {
        error.value = 'Failed to load checkout';
    } finally {
        isLoading.value = false;
    }
};

const addToCart = (product: Product, quantity: number = 1) => {
    const existingItem = cart.value.find(item => item.product.productId === product.productId);

    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        const maxAllowed = product.maxQuantity || product.availableInStock;
        existingItem.quantity = Math.min(newQuantity, maxAllowed);
    } else {
        cart.value.push({ product, quantity });
    }
};

const removeFromCart = (productId: string) => {
    cart.value = cart.value.filter(item => item.product.productId !== productId);
};

const updateQuantity = (productId: string, quantity: number) => {
    const item = cart.value.find(item => item.product.productId === productId);
    if (item) {
        const maxAllowed = item.product.maxQuantity || item.product.availableInStock;
        item.quantity = Math.max(1, Math.min(quantity, maxAllowed));
    }
};

const getTotalAmount = () => {
    return cart.value.reduce((total, item) => {
        return total + (parseFloat(item.product.amount.amount) * item.quantity);
    }, 0);
};

const getCartItemCount = () => {
    return cart.value.reduce((total, item) => total + item.quantity, 0);
};

const checkoutPayment = async () => {
    if (!walletStore.address || cart.value.length === 0) return;

    try {
        const walletClient = await getWalletClient(config);

        for (const item of cart.value) {
            await sdk.products.fulfill(
                item.product.productId,
                item.quantity,
                walletClient as any
            );
        }

        cart.value = [];
        alert('Payment successful! Thank you for your purchase.');
    } catch (err) {
        console.error('Payment failed:', err);
        error.value = 'Payment failed. Please try again.';
    }
};


const getWorkingDaysText = (workingDays: number[]) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return workingDays.map(day => dayNames[day]).join(', ');
};

onMounted(() => {
    loadCheckout();
});
</script>

<template>
    <div class="checkout-page">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading store...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error && !checkout" class="error-state">
            <div class="error-icon">❌</div>
            <h3>Store Not Found</h3>
            <p>{{ error }}</p>
        </div>

        <!-- Checkout Content -->
        <div v-else-if="checkout" class="checkout-content">
            <!-- Header -->
            <header class="store-header">
                <div class="container">
                    <div class="header-content">
                        <div class="store-info">
                            <div class="store-logo" v-if="checkout.logoURL">
                                <img :src="checkout.logoURL" :alt="checkout.name" />
                            </div>
                            <div class="store-details">
                                <h1>{{ checkout.name }}</h1>
                                <p class="tagline" v-if="checkout.tagline">{{ checkout.tagline }}</p>
                                <div class="store-meta">
                                    <span class="category" v-if="checkout.category">{{ checkout.category }}</span>
                                    <span class="location">{{ checkout.location.city }}, {{ checkout.location.country
                                        }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="cart-summary">
                            <div class="cart-info">
                                <span class="cart-count">{{ getCartItemCount() }} items</span>
                                <span class="cart-total">${{ getTotalAmount().toFixed(2) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Store About -->
            <section class="store-about" v-if="checkout.about">
                <div class="container">
                    <div class="about-content">
                        <h2>About {{ checkout.name }}</h2>
                        <p>{{ checkout.about }}</p>
                    </div>
                </div>
            </section>

            <!-- Products Grid -->
            <section class="products-section">
                <div class="container">
                    <h2>Products</h2>

                    <div v-if="products.length === 0" class="empty-products">
                        <div class="empty-icon">📦</div>
                        <h3>No products available</h3>
                        <p>This store hasn't added any products yet.</p>
                    </div>

                    <div v-else class="products-grid">
                        <div v-for="product in products.filter(p => p.isOnSale)" :key="product.productId"
                            class="product-card">
                            <div class="product-image" v-if="product.images && product.images.length">
                                <img :src="product.images[0].url" :alt="product.name" />
                                <div class="product-badges">
                                    <span v-if="product.isFeatured" class="badge featured">⭐ Featured</span>
                                    <span v-if="product.availableInStock === 0" class="badge sold-out">Sold Out</span>
                                </div>
                            </div>

                            <div class="product-content">
                                <h3>{{ product.name }}</h3>
                                <p class="product-description">{{ product.description }}</p>

                                <div class="product-details">
                                    <div class="price">
                                        <span class="amount">{{ product.amount.amount }} {{ product.amount.token.symbol
                                            }}</span>
                                        <img :src="product.amount.token.icon" :alt="product.amount.token.symbol"
                                            class="token-icon" />
                                    </div>

                                    <div class="stock-info">
                                        <span class="stock">{{ product.availableInStock }} in stock</span>
                                        <span v-if="product.maxQuantity" class="max-qty">Max {{ product.maxQuantity }}
                                            per order</span>
                                    </div>
                                </div>

                                <div class="product-actions">
                                    <div class="quantity-selector">
                                        <button
                                            @click="updateQuantity(product.productId, (cart.find(item => item.product.productId === product.productId)?.quantity || 1) - 1)"
                                            :disabled="!cart.find(item => item.product.productId === product.productId) || cart.find(item => item.product.productId === product.productId)!.quantity <= 1">
                                            -
                                        </button>
                                        <span class="quantity">{{cart.find(item => item.product.productId ===
                                            product.productId)?.quantity || 1}}</span>
                                        <button
                                            @click="updateQuantity(product.productId, (cart.find(item => item.product.productId === product.productId)?.quantity || 1) + 1)"
                                            :disabled="(cart.find(item => item.product.productId === product.productId)?.quantity || 0) >= (product.maxQuantity || product.availableInStock)">
                                            +
                                        </button>
                                    </div>

                                    <button @click="addToCart(product)" :disabled="product.availableInStock === 0"
                                        class="btn btn-primary add-to-cart">
                                        <span v-if="product.availableInStock === 0">Sold Out</span>
                                        <span v-else>Add to Cart</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Cart Sidebar -->
            <div class="cart-sidebar" :class="{ 'cart-open': cart.length > 0 }">
                <div class="cart-header">
                    <h3>Shopping Cart</h3>
                    <span class="cart-count">{{ getCartItemCount() }} items</span>
                </div>

                <div class="cart-items">
                    <div v-for="item in cart" :key="item.product.productId" class="cart-item">
                        <div class="item-image" v-if="item.product.images && item.product.images.length">
                            <img :src="item.product.images[0].url" :alt="item.product.name" />
                        </div>
                        <div class="item-details">
                            <h4>{{ item.product.name }}</h4>
                            <div class="item-price">
                                {{ item.product.amount.amount }} {{ item.product.amount.token.symbol }} × {{
                                    item.quantity }}
                            </div>
                            <div class="item-total">
                                Total: {{ (parseFloat(item.product.amount.amount) * item.quantity).toFixed(2) }} {{
                                    item.product.amount.token.symbol }}
                            </div>
                        </div>
                        <button @click="removeFromCart(item.product.productId)" class="remove-item">
                            ✕
                        </button>
                    </div>
                </div>

                <div class="cart-footer" v-if="cart.length > 0">
                    <div class="cart-total">
                        <span class="total-label">Total:</span>
                        <span class="total-amount">${{ getTotalAmount().toFixed(2) }}</span>
                    </div>

                    <button @click="modal.open()" v-if="!walletStore.address" class="btn btn-primary btn-full">
                        Connect Wallet to Pay
                    </button>
                    <button @click="checkoutPayment" v-else class="btn btn-primary btn-full">
                        Sign to Pay
                    </button>
                </div>
            </div>

            <!-- Store Info Footer -->
            <footer class="store-footer">
                <div class="container">
                    <div class="footer-content">
                        <div class="store-contact">
                            <h3>Contact Information</h3>
                            <div class="contact-details">
                                <div class="contact-item">
                                    <span class="contact-label">Address:</span>
                                    <span class="contact-value">
                                        {{ checkout.location.address }}, {{ checkout.location.city }}
                                        {{ checkout.location.zipCode ? `, ${checkout.location.zipCode}` : '' }}, {{
                                            checkout.location.country }}
                                    </span>
                                </div>
                                <div class="contact-item">
                                    <span class="contact-label">Business Hours:</span>
                                    <span class="contact-value">
                                        {{ checkout.schedule.workingHours.start }} - {{
                                            checkout.schedule.workingHours.end }}
                                        ({{ checkout.schedule.timezone }})
                                    </span>
                                </div>
                                <div class="contact-item">
                                    <span class="contact-label">Working Days:</span>
                                    <span class="contact-value">{{ getWorkingDaysText(checkout.schedule.workingDays)
                                        }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="powered-by">
                            <p>Powered by <strong>SeiMoney</strong></p>
                            <p>Secure payments on Sei Network</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    </div>
</template>

<style scoped>
.checkout-page {
    min-height: 100vh;
    background: var(--bg-primary);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.loading-state,
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
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

.error-icon {
    font-size: 3rem;
    margin-bottom: 16px;
}

.store-header {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    padding: 2rem 0;
    position: sticky;
    top: 0;
    z-index: 100;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.store-info {
    display: flex;
    align-items: center;
    gap: 20px;
}

.store-logo {
    width: 80px;
    height: 80px;
    border-radius: 12px;
    overflow: hidden;
    flex-shrink: 0;
}

.store-logo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.store-details h1 {
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

.store-meta {
    display: flex;
    gap: 12px;
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

.cart-summary {
    display: flex;
    align-items: center;
    gap: 16px;
}

.cart-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
}

.cart-count {
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.cart-total {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
}

.store-about {
    padding: 3rem 0;
    background: var(--bg-primary);
}

.about-content {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
}

.about-content h2 {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1rem;
}

.about-content p {
    color: var(--text-secondary);
    font-size: 1.1rem;
    line-height: 1.7;
}

.products-section {
    padding: 4rem 0;
    background: var(--bg-secondary);
}

.products-section h2 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 2rem;
    text-align: center;
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
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
}

.product-card {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
}

.product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
}

.product-image {
    position: relative;
    height: 200px;
    overflow: hidden;
}

.product-image img {
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

.badge.sold-out {
    background: rgba(239, 68, 68, 0.9);
    color: white;
}

.product-content {
    padding: 20px;
}

.product-content h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
    line-height: 1.3;
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

.product-details {
    margin-bottom: 16px;
}

.price {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.amount {
    font-size: 1.25rem;
    font-weight: 700;
    color: #10b981;
}

.token-icon {
    width: 20px;
    height: 20px;
    border-radius: 10px;
    object-fit: cover;
}

.stock-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.stock,
.max-qty {
    font-size: 0.8rem;
    color: var(--text-secondary);
}

.product-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.quantity-selector {
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 4px;
}

.quantity-selector button {
    width: 28px;
    height: 28px;
    border: none;
    background: var(--bg-secondary);
    color: var(--text-primary);
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
}

.quantity-selector button:hover:not(:disabled) {
    background: var(--bg-tertiary);
}

.quantity-selector button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.quantity {
    min-width: 30px;
    text-align: center;
    font-weight: 600;
    color: var(--text-primary);
}

.add-to-cart {
    flex: 1;
}

.cart-sidebar {
    position: fixed;
    top: 0;
    right: -400px;
    width: 400px;
    height: 100vh;
    background: var(--bg-primary);
    border-left: 1px solid var(--border-color);
    z-index: 1000;
    transition: right 0.3s ease;
    display: flex;
    flex-direction: column;
}

.cart-sidebar.cart-open {
    right: 0;
}

.cart-header {
    padding: 20px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.cart-header h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
}

.cart-items {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}

.cart-item {
    display: flex;
    gap: 12px;
    padding: 16px 0;
    border-bottom: 1px solid var(--border-color);
}

.cart-item:last-child {
    border-bottom: none;
}

.item-image {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
}

.item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.item-details {
    flex: 1;
}

.item-details h4 {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.item-price,
.item-total {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-bottom: 2px;
}

.item-total {
    font-weight: 600;
    color: var(--text-primary);
}

.remove-item {
    background: none;
    border: none;
    color: #ef4444;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: background 0.2s ease;
}

.remove-item:hover {
    background: rgba(239, 68, 68, 0.1);
}

.cart-footer {
    padding: 20px;
    border-top: 1px solid var(--border-color);
}

.cart-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    font-size: 1.1rem;
    font-weight: 600;
}

.total-label {
    color: var(--text-secondary);
}

.total-amount {
    color: var(--text-primary);
}

.store-footer {
    background: var(--bg-tertiary);
    border-top: 1px solid var(--border-color);
    padding: 3rem 0;
}

.footer-content {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 3rem;
    align-items: start;
}

.store-contact h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
}

.contact-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.contact-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.contact-label {
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.contact-value {
    color: var(--text-primary);
    font-size: 0.9rem;
}

.powered-by {
    text-align: right;
}

.powered-by p {
    color: var(--text-secondary);
    font-size: 0.8rem;
    margin-bottom: 4px;
}

.powered-by strong {
    color: #667eea;
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

.btn-full {
    width: 100%;
}

@media (max-width: 768px) {
    .header-content {
        flex-direction: column;
        gap: 20px;
        align-items: stretch;
    }

    .store-info {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .cart-summary {
        justify-content: center;
    }

    .products-grid {
        grid-template-columns: 1fr;
    }

    .cart-sidebar {
        width: 100%;
        right: -100%;
    }

    .footer-content {
        grid-template-columns: 1fr;
        gap: 2rem;
        text-align: center;
    }

    .powered-by {
        text-align: center;
    }
}
</style>