<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { tokens } from '../../../../utils/constants';
import type { CreateProduct, ImageFile } from '../../../../types';
import { createSeiMoneySDK } from '@seimoney/sdk/src/sdk';

const router = useRouter();
const isLoading = ref(false);
const sdk = createSeiMoneySDK({ apiUrl: import.meta.env.VITE_API_URL });

const images = ref<ImageFile[]>([]);

const form = ref<CreateProduct>({
    name: '',
    description: '',
    availableInStock: 1,
    maxQuantity: 1,
    isFeatured: false,
    isOnSale: true,

    amount: {
        amount: '',
        token: tokens[0]
    },
    network: 'sei-testnet'
});

const errors = ref({
    name: '',
    description: '',
    amount: '',
    availableInStock: ''
});

const addImages = (e: any) => {
    if (images.value.length >= 5) {
        alert('You can only add up to 5 images.');
        return;
    }

    for (const file of e.target.files) {
        images.value.push({ file });
    }
};

const removeImage = (index: number) => {
    images.value.splice(index, 1);
};

const getObjectURL = (file: File) => {
    return URL.createObjectURL(file);
};

const validateForm = (): boolean => {
    // Clear previous errors
    Object.keys(errors.value).forEach(key => {
        errors.value[key as keyof typeof errors.value] = '';
    });

    let isValid = true;

    if (!form.value.name.trim()) {
        errors.value.name = 'Product name is required';
        isValid = false;
    }

    if (!form.value.description.trim()) {
        errors.value.description = 'Product description is required';
        isValid = false;
    }

    if (!form.value.amount.amount || parseFloat(form.value.amount.amount) <= 0) {
        errors.value.amount = 'Valid price is required';
        isValid = false;
    }

    if (form.value.availableInStock < 1) {
        errors.value.availableInStock = 'Stock must be at least 1';
        isValid = false;
    }

    return isValid;
};

const createProduct = async () => {
    if (!validateForm()) return;

    isLoading.value = true;
    try {
        await sdk.products.createProduct(form.value, images.value);
        router.push('/checkout');
    } catch (error) {
        console.error('Error creating product:', error);
    }
    isLoading.value = false;
};

const updateTokenAddress = () => {
    const selectedToken = tokens.find(token => token.symbol === form.value.amount.token.symbol);
    if (selectedToken) {
        form.value.amount.token.address = selectedToken.address as any;
        form.value.amount.token.decimals = selectedToken.decimals;
    }
};
</script>

<template>
    <div class="create-product-container">
        <div class="product-form-wrapper">
            <!-- Header -->
            <div class="form-header">
                <button @click="router.back()" class="back-btn">
                    <span class="back-icon">←</span>
                    Back to Checkout
                </button>
                <div class="header-content">
                    <h1>Add New Product</h1>
                    <p>Create a new product for your digital storefront</p>
                </div>
            </div>

            <!-- Form -->
            <div class="product-form">
                <div class="form-section">
                    <h2>Product Information</h2>
                    <div class="form-grid">
                        <div class="form-group full-width">
                            <label for="name">Product Name *</label>
                            <input id="name" v-model="form.name" type="text" placeholder="Enter product name"
                                :class="{ 'error': errors.name }" />
                            <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
                        </div>

                        <div class="form-group full-width">
                            <label for="description">Description *</label>
                            <textarea id="description" v-model="form.description"
                                placeholder="Describe your product in detail" rows="4"
                                :class="{ 'error': errors.description }"></textarea>
                            <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h2>Pricing & Availability</h2>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="amount">Price *</label>
                            <input id="amount" v-model="form.amount.amount" type="number" step="0.01" min="0"
                                placeholder="0.00" :class="{ 'error': errors.amount }" />
                            <span v-if="errors.amount" class="error-message">{{ errors.amount }}</span>
                        </div>

                        <div class="form-group">
                            <label for="token">Token</label>
                            <select id="token" v-model="form.amount.token.symbol" @change="updateTokenAddress">
                                <option v-for="token in tokens" :key="token.symbol" :value="token.symbol">
                                    {{ token.symbol }}
                                </option>
                            </select>
                        </div>

                        <div class="form-group">

                        </div>

                        <div class="form-group">
                            <label for="stock">Available Stock *</label>
                            <input id="stock" v-model.number="form.availableInStock" type="number" min="1"
                                :class="{ 'error': errors.availableInStock }" />
                            <span v-if="errors.availableInStock" class="error-message">{{ errors.availableInStock
                            }}</span>
                        </div>

                        <div class="form-group">
                            <label for="maxQuantity">Max Quantity per Order</label>
                            <input id="maxQuantity" v-model.number="form.maxQuantity" type="number" min="1"
                                placeholder="No limit" />
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h2>Product Images</h2>
                    <div class="images-section">
                        <div class="add-image">
                            <div class="image-input-group">
                                <input type="file" @change="addImages" accept="image/*" multiple />
                                <button type="button" class="btn btn-outline">
                                    Add Images
                                </button>
                            </div>
                        </div>

                        <div v-if="images.length > 0" class="images-grid">
                            <div v-for="(image, index) in images" :key="index" class="image-item"
                                :class="{ 'primary': index == 0 }">
                                <img :src="getObjectURL(image.file)" :alt="image.caption" class="image-preview" />
                                <input type="text" v-model="image.caption" placeholder="Enter image Caption" />
                                <div class="image-overlay">
                                    <button @click="removeImage(index)" class="btn btn-small btn-outline remove-btn">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h2>Product Settings</h2>
                    <div class="settings-grid">
                        <div class="setting-item">
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="form.isFeatured" />
                                <span class="checkmark"></span>
                                Featured Product
                            </label>
                            <p class="setting-description">Featured products are highlighted in your store</p>
                        </div>

                        <div class="setting-item">
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="form.isOnSale" />
                                <span class="checkmark"></span>
                                Available for Sale
                            </label>
                            <p class="setting-description">Uncheck to temporarily hide this product</p>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="form-actions">
                    <button @click="createProduct" class="btn btn-primary" :disabled="isLoading">
                        <span v-if="isLoading">Creating Product...</span>
                        <span v-else>Create Product</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.create-product-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.form-header {
    margin-bottom: 32px;
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
    margin-bottom: 16px;
    transition: color 0.2s ease;
}

.back-btn:hover {
    color: var(--text-primary);
}

.back-icon {
    font-size: 1.2rem;
}

.header-content h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.header-content p {
    color: var(--text-secondary);
    font-size: 1.1rem;
}

.product-form {
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.form-section {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
}

.form-section h2 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 20px;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 8px;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group.full-width {
    grid-column: 1 / -1;
}

.form-group label {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
    padding: 12px 16px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 0.9rem;
    transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #667eea;
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
    border-color: #ef4444;
}

.error-message {
    color: #ef4444;
    font-size: 0.8rem;
    font-weight: 500;
}

.images-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.image-input-group {
    display: flex;
    gap: 12px;
}

.image-input-group input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-primary);
    color: var(--text-primary);
}

.images-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
}

.image-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid var(--border-color);
    transition: border-color 0.2s ease;
}

.image-item.primary {
    border-color: #667eea;
}

.image-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.image-item:hover .image-overlay {
    opacity: 1;
}

.primary-badge {
    background: #667eea;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
}

.settings-grid {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.setting-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    font-weight: 600;
    color: var(--text-primary);
}

.checkbox-label input[type="checkbox"] {
    display: none;
}

.checkmark {
    width: 20px;
    height: 20px;
    border: 2px solid var(--border-color);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.checkbox-label input[type="checkbox"]:checked+.checkmark {
    background: #667eea;
    border-color: #667eea;
}

.checkbox-label input[type="checkbox"]:checked+.checkmark::after {
    content: '✓';
    color: white;
    font-size: 0.8rem;
    font-weight: bold;
}

.setting-description {
    color: var(--text-secondary);
    font-size: 0.8rem;
    margin-left: 32px;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
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

.btn-outline:hover {
    background: #667eea;
    color: white;
}

.btn-small {
    padding: 6px 12px;
    font-size: 0.8rem;
}

.remove-btn {
    color: #ef4444;
    border-color: #ef4444;
}

.remove-btn:hover {
    background: #ef4444;
    color: white;
}

@media (max-width: 768px) {
    .form-grid {
        grid-template-columns: 1fr;
    }

    .image-input-group {
        flex-direction: column;
    }

    .images-grid {
        grid-template-columns: 1fr 1fr;
    }

    .form-actions {
        justify-content: stretch;
    }

    .btn {
        width: 100%;
    }
}
</style>